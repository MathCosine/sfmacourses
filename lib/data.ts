import { createClient } from "./supabase/server";
import { isSuperAdmin } from "./admin";
import { contentBlocks } from "./utils";
import type {
  Announcement,
  Block,
  Lesson,
  LessonStatus,
  Module,
  Profile,
  ProblemBlock,
  ProblemStatus,
  Track,
} from "./types";

/** Slug of the special "Problem Bank" track — standalone problems not tied to a
 *  teaching chapter. Hidden from the learner course nav, shown in /problems. */
export const PROBLEM_BANK_SLUG = "problem-bank";

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile | null;
  isStaff: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  let user;
  try {
    const res = await supabase.auth.getUser();
    user = res.data.user;
  } catch {
    return null;
  }
  if (!user) return null;

  let profile: Profile | null = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = (data as Profile) ?? null;
  } catch {
    profile = null;
  }

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
  try {
    const supabase = await createClient();

    const [{ data: tracks }, { data: modules }, { data: lessons }] =
      await Promise.all([
        supabase.from("tracks").select("*").order("order_index", { ascending: true }),
        supabase.from("modules").select("*").order("order_index", { ascending: true }),
        supabase.from("lessons").select("*").order("order_index", { ascending: true }),
      ]);

    const lessonsByModule = new Map<string, Lesson[]>();
    for (const l of (lessons ?? []) as Lesson[]) {
      const arr = lessonsByModule.get(l.module_id) ?? [];
      arr.push(l);
      lessonsByModule.set(l.module_id, arr);
    }

    const modulesByTrack = new Map<string, ModuleWithLessons[]>();
    for (const m of (modules ?? []) as Module[]) {
      const arr = modulesByTrack.get(m.track_id) ?? [];
      arr.push({ ...m, lessons: [...(lessonsByModule.get(m.id) ?? [])] });
      modulesByTrack.set(m.track_id, arr);
    }

    return ((tracks ?? []) as Track[]).map((t) => ({
      ...t,
      modules: modulesByTrack.get(t.id) ?? [],
    }));
  } catch (e) {
    console.error("getNavTree failed", e);
    return [];
  }
}

/**
 * Place cross-listed lessons into their additional modules. The lesson row is
 * the single source of truth (same id → shared content & progress); a
 * cross-listing just makes it *also* appear under another course's unit.
 * Mutates `tree` in place. `lessonsById` should span every lesson (so a lesson
 * from any course — even the bank — can be cross-listed). No-ops if the table
 * is missing.
 */
async function applyCrossListings(
  tree: TrackWithModules[],
  lessonsById: Map<string, Lesson>,
): Promise<void> {
  const moduleById = new Map<string, ModuleWithLessons>();
  for (const t of tree) for (const m of t.modules) moduleById.set(m.id, m);
  try {
    const supabase = await createClient();
    const { data: cross } = await supabase
      .from("lesson_cross_listings")
      .select("lesson_id, module_id, order_index")
      .order("order_index", { ascending: true });
    for (const row of cross ?? []) {
      const mod = moduleById.get(row.module_id as string);
      const les = lessonsById.get(row.lesson_id as string);
      if (!mod || !les) continue;
      if (mod.lessons.some((l) => l.id === les.id)) continue; // already present
      mod.lessons.push(les);
    }
  } catch {
    /* cross-listings table not present — ignore */
  }
}

/**
 * Learner-facing courses: the nav tree without the hidden Problem Bank track,
 * with cross-listed lessons placed into their additional units.
 */
export async function getCourseTree(): Promise<TrackWithModules[]> {
  const full = await getNavTree();
  const lessonsById = new Map<string, Lesson>();
  for (const t of full)
    for (const m of t.modules) for (const l of m.lessons) lessonsById.set(l.id, l);
  const course = full.filter((t) => t.slug !== PROBLEM_BANK_SLUG);
  await applyCrossListings(course, lessonsById);
  return course;
}

export interface LessonLink {
  id: string;
  title: string;
  trackTitle: string;
  trackSlug: string;
  moduleTitle: string;
  href: string;
}

/** Flatten a nav tree into a searchable catalog of every lesson (for linking). */
export function flattenLessons(tree: TrackWithModules[]): LessonLink[] {
  const out: LessonLink[] = [];
  for (const t of tree)
    for (const m of t.modules)
      for (const l of m.lessons)
        out.push({
          id: l.id,
          title: l.title,
          trackTitle: t.title,
          trackSlug: t.slug,
          moduleTitle: m.title,
          href: `/learn/${t.slug}/${m.slug}/${l.slug}`,
        });
  return out;
}

/** Resolve a set of lesson ids to links, preserving the requested order. */
export async function getLessonLinksByIds(
  ids: string[],
): Promise<LessonLink[]> {
  if (!ids?.length) return [];
  const all = flattenLessons(await getNavTree());
  const byId = new Map(all.map((l) => [l.id, l]));
  return ids.map((id) => byId.get(id)).filter((l): l is LessonLink => !!l);
}

export interface ModuleLink {
  id: string;
  title: string;
  trackTitle: string;
  trackSlug: string;
}

/** Flatten a nav tree into a catalog of every unit/module (for cross-listing). */
export function flattenModules(tree: TrackWithModules[]): ModuleLink[] {
  const out: ModuleLink[] = [];
  for (const t of tree)
    for (const m of t.modules)
      out.push({
        id: m.id,
        title: m.title,
        trackTitle: t.title,
        trackSlug: t.slug,
      });
  return out;
}

export interface CrossListing {
  lesson_id: string;
  module_id: string;
}

/** All cross-listing rows (lesson placed in an additional module). */
export async function getCrossListings(): Promise<CrossListing[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("lesson_cross_listings")
      .select("lesson_id, module_id");
    return (data ?? []) as CrossListing[];
  } catch (e) {
    console.error("getCrossListings failed", e);
    return [];
  }
}

export interface ProblemView {
  problem: ProblemBlock;
  problemIndex: number;
  lessonId: string;
  lessonTitle: string;
  lessonAuthor: string;
  /** Location for breadcrumbs / "open the lesson" link. Null for bank problems. */
  location: {
    trackTitle: string;
    trackSlug: string;
    moduleTitle: string;
    lessonHref: string;
  } | null;
  isBank: boolean;
  /** Sibling problems in the same lesson, for prev/next. */
  prev: { index: number; title: string } | null;
  next: { index: number; title: string } | null;
  total: number;
}

/** Resolve a single problem (by lesson id + its problem index) for the
 *  standalone problem workspace. */
export async function getProblemView(
  lessonId: string,
  index: number,
): Promise<ProblemView | null> {
  const tree = await getNavTree();
  for (const t of tree) {
    for (const m of t.modules) {
      for (const l of m.lessons) {
        if (l.id !== lessonId) continue;
        const problems = contentBlocks(l.content).filter(
          (b): b is ProblemBlock => b.type === "problem",
        );
        const problem = problems[index];
        if (!problem) return null;
        const isBank = t.slug === PROBLEM_BANK_SLUG;
        const prevP = problems[index - 1];
        const nextP = problems[index + 1];
        return {
          problem,
          problemIndex: index,
          lessonId,
          lessonTitle: l.title,
          lessonAuthor:
            (l.content?.find?.((b) => (b as { type?: string }).type === "meta") as
              | { author?: string }
              | undefined)?.author ?? "SFMA Staff",
          location: isBank
            ? null
            : {
                trackTitle: t.title,
                trackSlug: t.slug,
                moduleTitle: m.title,
                lessonHref: `/learn/${t.slug}/${m.slug}/${l.slug}`,
              },
          isBank,
          prev: prevP ? { index: index - 1, title: prevP.title } : null,
          next: nextP ? { index: index + 1, title: nextP.title } : null,
          total: problems.length,
        };
      }
    }
  }
  return null;
}

/** Map of lesson_id -> status for a user (lessons with no row are not_started). */
export async function getLessonStatuses(
  userId: string,
): Promise<Record<string, LessonStatus>> {
  const out: Record<string, LessonStatus> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("progress")
      .select("lesson_id, status, completed")
      .eq("user_id", userId);
    for (const r of data ?? []) {
      const status = (r.status as LessonStatus) ?? (r.completed ? "complete" : "not_started");
      if (status && status !== "not_started") out[r.lesson_id as string] = status;
    }
  } catch (e) {
    console.error("getLessonStatuses failed", e);
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
  // Use the merged course tree so a cross-listed lesson resolves under each
  // course it appears in (and prev/next follows that course's ordering).
  const tree = await getCourseTree();
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
  try {
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
  } catch (e) {
    console.error("getLessonStatus failed", e);
    return "not_started";
  }
}

/** Map of problem_index -> status for a lesson. */
export async function getProblemStatuses(
  userId: string,
  lessonId: string,
): Promise<Record<number, ProblemStatus>> {
  const out: Record<number, ProblemStatus> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("problem_completions")
      .select("problem_index, status, completed")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);
    for (const r of data ?? []) {
      const status =
        (r.status as ProblemStatus) ?? (r.completed ? "solved" : "not_started");
      if (status && status !== "not_started")
        out[r.problem_index as number] = status;
    }
  } catch (e) {
    console.error("getProblemStatuses failed", e);
  }
  return out;
}

/** Map of section_index -> status for a lesson. */
export async function getSectionStatuses(
  userId: string,
  lessonId: string,
): Promise<Record<number, LessonStatus>> {
  const out: Record<number, LessonStatus> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("section_completions")
      .select("section_index, status")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);
    for (const r of data ?? []) {
      const status = r.status as LessonStatus;
      if (status && status !== "not_started")
        out[r.section_index as number] = status;
    }
  } catch (e) {
    console.error("getSectionStatuses failed", e);
  }
  return out;
}

/** Map of `${lesson_id}:${problem_index}` -> status across all lessons. */
export async function getAllProblemStatuses(
  userId: string,
): Promise<Record<string, ProblemStatus>> {
  const out: Record<string, ProblemStatus> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("problem_completions")
      .select("lesson_id, problem_index, status, completed")
      .eq("user_id", userId);
    for (const r of data ?? []) {
      const status =
        (r.status as ProblemStatus) ?? (r.completed ? "solved" : "not_started");
      if (status && status !== "not_started")
        out[`${r.lesson_id}:${r.problem_index}`] = status;
    }
  } catch (e) {
    console.error("getAllProblemStatuses failed", e);
  }
  return out;
}

export async function getAnnouncements(): Promise<
  (Announcement & { author_name?: string | null })[]
> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []) as Announcement[];
  } catch (e) {
    console.error("getAnnouncements failed", e);
    return [];
  }
}

export async function getAllProfiles(): Promise<Profile[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    return (data ?? []) as Profile[];
  } catch (e) {
    console.error("getAllProfiles failed", e);
    return [];
  }
}
