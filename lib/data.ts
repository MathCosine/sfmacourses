import { createClient } from "./supabase/server";
import { isSuperAdmin } from "./admin";
import type {
  Announcement,
  Block,
  Lesson,
  LessonStatus,
  Module,
  Profile,
  ProblemStatus,
  Track,
} from "./types";

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile | null;
  isStaff: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const email = user.email ?? profile?.email ?? "";
  const superAdmin = isSuperAdmin(email);
  const merged = profile
    ? ({ ...profile, role: superAdmin ? "staff" : profile.role } as Profile)
    : superAdmin
      ? ({
          id: user.id,
          email,
          full_name: null,
          role: "staff",
          created_at: new Date().toISOString(),
        } as Profile)
      : null;

  return {
    id: user.id,
    email,
    profile: merged,
    isStaff: superAdmin || profile?.role === "staff",
  };
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export interface TrackWithModules extends Track {
  modules: ModuleWithLessons[];
}

/** Full nav tree: tracks → modules → lessons, ordered. */
export async function getNavTree(): Promise<TrackWithModules[]> {
  const supabase = await createClient();

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*")
    .order("order_index", { ascending: true });

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .order("order_index", { ascending: true });

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true });

  const lessonsByModule = new Map<string, Lesson[]>();
  for (const l of (lessons ?? []) as Lesson[]) {
    const arr = lessonsByModule.get(l.module_id) ?? [];
    arr.push(l);
    lessonsByModule.set(l.module_id, arr);
  }

  const modulesByTrack = new Map<string, ModuleWithLessons[]>();
  for (const m of (modules ?? []) as Module[]) {
    const arr = modulesByTrack.get(m.track_id) ?? [];
    arr.push({ ...m, lessons: lessonsByModule.get(m.id) ?? [] });
    modulesByTrack.set(m.track_id, arr);
  }

  return ((tracks ?? []) as Track[]).map((t) => ({
    ...t,
    modules: modulesByTrack.get(t.id) ?? [],
  }));
}

/** Map of lesson_id -> status for a user (lessons with no row are not_started). */
export async function getLessonStatuses(
  userId: string,
): Promise<Record<string, LessonStatus>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("progress")
    .select("lesson_id, status, completed")
    .eq("user_id", userId);
  const out: Record<string, LessonStatus> = {};
  for (const r of data ?? []) {
    const status = (r.status as LessonStatus) ?? (r.completed ? "complete" : "not_started");
    if (status && status !== "not_started") out[r.lesson_id as string] = status;
  }
  return out;
}

export async function getCompletedLessonIds(
  userId: string,
): Promise<Set<string>> {
  const statuses = await getLessonStatuses(userId);
  return new Set(
    Object.entries(statuses)
      .filter(([, s]) => s === "complete")
      .map(([id]) => id),
  );
}

export interface LessonContext {
  track: Track;
  module: Module;
  lesson: Lesson;
  prev: { track: string; module: string; lesson: string; title: string } | null;
  next: { track: string; module: string; lesson: string; title: string } | null;
}

/** Resolve a lesson by its url path and compute prev/next within the track. */
export async function getLessonContext(
  trackSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): Promise<LessonContext | null> {
  const tree = await getNavTree();
  const track = tree.find((t) => t.slug === trackSlug);
  if (!track) return null;

  // Flatten lessons across the track in display order for prev/next.
  const flat: {
    track: string;
    module: string;
    lesson: string;
    title: string;
    moduleObj: Module;
    lessonObj: Lesson;
  }[] = [];
  for (const m of track.modules) {
    for (const l of m.lessons) {
      flat.push({
        track: track.slug,
        module: m.slug,
        lesson: l.slug,
        title: l.title,
        moduleObj: m,
        lessonObj: l,
      });
    }
  }

  const idx = flat.findIndex(
    (f) => f.module === moduleSlug && f.lesson === lessonSlug,
  );
  if (idx === -1) return null;

  const current = flat[idx];
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return {
    track,
    module: current.moduleObj,
    lesson: {
      ...current.lessonObj,
      content: (current.lessonObj.content ?? []) as Block[],
    },
    prev: prev
      ? { track: prev.track, module: prev.module, lesson: prev.lesson, title: prev.title }
      : null,
    next: next
      ? { track: next.track, module: next.module, lesson: next.lesson, title: next.title }
      : null,
  };
}

export async function getLessonStatus(
  userId: string,
  lessonId: string,
): Promise<LessonStatus> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("progress")
    .select("status, completed")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (!data) return "not_started";
  return (
    (data.status as LessonStatus) ??
    (data.completed ? "complete" : "not_started")
  );
}

/** Map of problem_index -> status for a lesson. */
export async function getProblemStatuses(
  userId: string,
  lessonId: string,
): Promise<Record<number, ProblemStatus>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("problem_completions")
    .select("problem_index, status, completed")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId);
  const out: Record<number, ProblemStatus> = {};
  for (const r of data ?? []) {
    const status =
      (r.status as ProblemStatus) ?? (r.completed ? "solved" : "not_started");
    if (status && status !== "not_started")
      out[r.problem_index as number] = status;
  }
  return out;
}

/** Map of section_index -> status for a lesson. */
export async function getSectionStatuses(
  userId: string,
  lessonId: string,
): Promise<Record<number, LessonStatus>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("section_completions")
    .select("section_index, status")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId);
  const out: Record<number, LessonStatus> = {};
  for (const r of data ?? []) {
    const status = r.status as LessonStatus;
    if (status && status !== "not_started")
      out[r.section_index as number] = status;
  }
  return out;
}

export async function getAnnouncements(): Promise<
  (Announcement & { author_name?: string | null })[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Announcement[];
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  return (data ?? []) as Profile[];
}
