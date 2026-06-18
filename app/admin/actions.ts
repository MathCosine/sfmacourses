"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import { prepareBlocks, type PreparedBlock } from "@/lib/prepare";
import { isSuperAdmin } from "@/lib/admin";
import type { Block, ContentBlock, MetaBlock, Frequency } from "@/lib/types";

type Result = { ok: boolean; error?: string; id?: string };

/** Render markdown + LaTeX to HTML for the live editor preview. */
export async function previewMarkdown(md: string): Promise<string> {
  return renderMarkdown(md ?? "");
}

/** Render a full block list to its wiki appearance for the inline editor. */
export async function renderLessonPreview(
  blocks: ContentBlock[],
): Promise<PreparedBlock[]> {
  return prepareBlocks(blocks ?? []);
}

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Not authenticated" as const };

  if (isSuperAdmin(user.email)) return { supabase, user, error: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "staff")
    return { supabase, error: "Not authorized" as const };
  return { supabase, user, error: null };
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/learn", "layout");
}

async function nextOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "modules" | "lessons",
  column: "track_id" | "module_id",
  parentId: string,
): Promise<number> {
  const { data } = await supabase
    .from(table)
    .select("order_index")
    .eq(column, parentId)
    .order("order_index", { ascending: false })
    .limit(1);
  return (data?.[0]?.order_index ?? -1) + 1;
}

/**
 * Build a slug that won't collide with an existing one. For modules and lessons
 * we make the slug **globally** unique (not just within the parent): some older
 * databases still carry a global `modules_slug_key` / `lessons_slug_key` unique
 * index, so a globally-unique slug is safe under either schema. `excludeId`
 * skips the row being edited so re-saving an unchanged title keeps its slug.
 */
async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "tracks" | "modules" | "lessons",
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title) || `${table.slice(0, -1)}-${Date.now()}`;
  const { data } = await supabase.from(table).select("id, slug");
  const taken = new Set(
    (data ?? []).filter((r) => r.id !== excludeId).map((r) => r.slug),
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/**
 * Move an item one slot in the given direction.
 *
 * Rather than swapping two `order_index` values (which silently no-ops when
 * siblings share a duplicate index — a common result of seeding), this rebuilds
 * a clean 0..n-1 ordering for the whole sibling group and writes back only the
 * rows whose index actually changed. This is robust to duplicate/sparse indices
 * and surfaces any DB error instead of pretending it succeeded.
 */
async function moveItem(
  table: "tracks" | "modules" | "lessons",
  id: string,
  dir: -1 | 1,
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };

  const parentCol =
    table === "modules" ? "track_id" : table === "lessons" ? "module_id" : null;

  let parentId: string | null = null;
  if (parentCol) {
    const { data: row, error: rowErr } = await supabase
      .from(table)
      .select(`id, ${parentCol}`)
      .eq("id", id)
      .maybeSingle();
    if (rowErr) return { ok: false, error: rowErr.message };
    if (!row) return { ok: false, error: "Item not found" };
    parentId = (row as Record<string, string>)[parentCol];
  }

  let q = supabase.from(table).select("id, order_index");
  if (parentCol && parentId) q = q.eq(parentCol, parentId);
  const { data: siblings, error: sibErr } = await q
    .order("order_index", { ascending: true })
    .order("id", { ascending: true }); // stable tiebreak for duplicate indices
  if (sibErr) return { ok: false, error: sibErr.message };

  const list = [...(siblings ?? [])];
  const idx = list.findIndex((s) => s.id === id);
  const swapIdx = idx + dir;
  if (idx === -1 || swapIdx < 0 || swapIdx >= list.length)
    return { ok: true }; // already at the edge — nothing to do

  // Reorder the in-memory list, then assign a clean contiguous index.
  [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];

  const updates = list
    .map((item, position) => ({ id: item.id, order_index: position, was: item.order_index }))
    .filter((u) => u.order_index !== u.was);

  for (const u of updates) {
    const { error: upErr } = await supabase
      .from(table)
      .update({ order_index: u.order_index })
      .eq("id", u.id);
    if (upErr) return { ok: false, error: upErr.message };
  }

  refresh();
  return { ok: true };
}

export async function moveModule(id: string, dir: -1 | 1): Promise<Result> {
  return moveItem("modules", id, dir);
}

export async function moveLesson(id: string, dir: -1 | 1): Promise<Result> {
  return moveItem("lessons", id, dir);
}

export async function moveTrack(id: string, dir: -1 | 1): Promise<Result> {
  return moveItem("tracks", id, dir);
}

/* ---------------- Tracks (courses) ---------------- */

export async function createTrack(title: string): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const { data: last } = await supabase
    .from("tracks")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1);
  const order_index = (last?.[0]?.order_index ?? -1) + 1;
  const slug = await uniqueSlug(supabase, "tracks", title);
  const { data, error: e } = await supabase
    .from("tracks")
    .insert({ title, slug, order_index })
    .select("id")
    .single();
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true, id: data.id };
}

export async function updateTrack(
  id: string,
  fields: { title?: string; description?: string },
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const patch: Record<string, unknown> = { ...fields };
  if (fields.title) {
    patch.slug = await uniqueSlug(supabase, "tracks", fields.title, id);
  }
  const { error: e } = await supabase.from("tracks").update(patch).eq("id", id);
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true };
}

export async function deleteTrack(id: string): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const { error: e } = await supabase.from("tracks").delete().eq("id", id);
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true };
}

/* ---------------- Modules ---------------- */

export async function createModule(
  trackId: string,
  title: string,
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const order_index = await nextOrder(supabase, "modules", "track_id", trackId);
  const slug = await uniqueSlug(supabase, "modules", title);
  const { data, error: e } = await supabase
    .from("modules")
    .insert({
      track_id: trackId,
      title,
      slug,
      order_index,
    })
    .select("id")
    .single();
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true, id: data.id };
}

export async function updateModule(
  id: string,
  fields: { title?: string; description?: string },
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const patch: Record<string, unknown> = { ...fields };
  if (fields.title) {
    patch.slug = await uniqueSlug(supabase, "modules", fields.title, id);
  }
  const { error: e } = await supabase.from("modules").update(patch).eq("id", id);
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true };
}

export async function deleteModule(id: string): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const { error: e } = await supabase.from("modules").delete().eq("id", id);
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true };
}

/* ---------------- Lessons ---------------- */

export async function createLesson(
  moduleId: string,
  title: string,
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const order_index = await nextOrder(
    supabase,
    "lessons",
    "module_id",
    moduleId,
  );
  const meta: MetaBlock = {
    type: "meta",
    author: "SFMA Staff",
    frequency: "important",
  };
  const slug = await uniqueSlug(supabase, "lessons", title);
  const { data, error: e } = await supabase
    .from("lessons")
    .insert({
      module_id: moduleId,
      title,
      slug,
      content: [meta] as Block[],
      order_index,
    })
    .select("id")
    .single();
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true, id: data.id };
}

export async function updateLesson(
  id: string,
  fields: {
    title?: string;
    content?: ContentBlock[];
    author?: string;
    frequency?: Frequency;
    prereqNote?: string;
    prereqLessonIds?: string[];
  },
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };

  const patch: Record<string, unknown> = {};
  if (fields.title) {
    patch.title = fields.title;
    patch.slug = await uniqueSlug(supabase, "lessons", fields.title, id);
  }
  if (fields.content) {
    const meta: MetaBlock = {
      type: "meta",
      author: fields.author ?? "SFMA Staff",
      frequency: fields.frequency ?? "important",
      prereqNote: fields.prereqNote?.trim() || undefined,
      prereqLessonIds: fields.prereqLessonIds?.length
        ? fields.prereqLessonIds
        : undefined,
    };
    patch.content = [meta, ...fields.content] as Block[];
  }
  const { error: e } = await supabase.from("lessons").update(patch).eq("id", id);
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true };
}

export async function deleteLesson(id: string): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const { error: e } = await supabase.from("lessons").delete().eq("id", id);
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true };
}

/* ------------- Cross-listings (a lesson placed in multiple courses) ------- */

export async function addCrossListing(
  lessonId: string,
  moduleId: string,
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };

  // Place it after the module's existing lessons + cross-listings.
  const [{ data: prim }, { data: cross }] = await Promise.all([
    supabase
      .from("lessons")
      .select("order_index")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: false })
      .limit(1),
    supabase
      .from("lesson_cross_listings")
      .select("order_index")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: false })
      .limit(1),
  ]);
  const order_index =
    Math.max(prim?.[0]?.order_index ?? -1, cross?.[0]?.order_index ?? -1) + 1;

  const { error: e } = await supabase
    .from("lesson_cross_listings")
    .upsert(
      { lesson_id: lessonId, module_id: moduleId, order_index },
      { onConflict: "lesson_id,module_id" },
    );
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true };
}

export async function removeCrossListing(
  lessonId: string,
  moduleId: string,
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const { error: e } = await supabase
    .from("lesson_cross_listings")
    .delete()
    .eq("lesson_id", lessonId)
    .eq("module_id", moduleId);
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true };
}

/* ---------------- Students ---------------- */

export async function toggleRole(
  userId: string,
  role: "student" | "staff",
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const { error: e } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true };
}

/* ---------------- Announcements ---------------- */

export async function createAnnouncement(
  title: string,
  body: string,
): Promise<Result> {
  const { supabase, user, error } = await requireStaff();
  if (error) return { ok: false, error };
  const { error: e } = await supabase
    .from("announcements")
    .insert({ author_id: user!.id, title, body });
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const { error: e } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);
  if (e) return { ok: false, error: e.message };
  refresh();
  return { ok: true };
}
