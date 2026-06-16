"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import { isSuperAdmin } from "@/lib/admin";
import type { Block, ContentBlock, MetaBlock, Frequency } from "@/lib/types";

type Result = { ok: boolean; error?: string; id?: string };

/** Render markdown + LaTeX to HTML for the live editor preview. */
export async function previewMarkdown(md: string): Promise<string> {
  return renderMarkdown(md ?? "");
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

/** Swap order_index with the neighbour in the given direction. */
async function moveItem(
  table: "modules" | "lessons",
  id: string,
  dir: -1 | 1,
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };

  const { data: row } = await supabase
    .from(table)
    .select("id, order_index, track_id, module_id")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { ok: false, error: "Not found" };

  const parentCol = table === "modules" ? "track_id" : "module_id";
  const parentId = (row as Record<string, string>)[parentCol];

  const { data: siblings } = await supabase
    .from(table)
    .select("id, order_index")
    .eq(parentCol, parentId)
    .order("order_index", { ascending: true });

  const list = siblings ?? [];
  const idx = list.findIndex((s) => s.id === id);
  const swapIdx = idx + dir;
  if (idx === -1 || swapIdx < 0 || swapIdx >= list.length)
    return { ok: true }; // already at the edge

  const a = list[idx];
  const b = list[swapIdx];
  await supabase.from(table).update({ order_index: b.order_index }).eq("id", a.id);
  await supabase.from(table).update({ order_index: a.order_index }).eq("id", b.id);
  refresh();
  return { ok: true };
}

export async function moveModule(id: string, dir: -1 | 1): Promise<Result> {
  return moveItem("modules", id, dir);
}

export async function moveLesson(id: string, dir: -1 | 1): Promise<Result> {
  return moveItem("lessons", id, dir);
}

/* ---------------- Modules ---------------- */

export async function createModule(
  trackId: string,
  title: string,
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };
  const order_index = await nextOrder(supabase, "modules", "track_id", trackId);
  const { data, error: e } = await supabase
    .from("modules")
    .insert({
      track_id: trackId,
      title,
      slug: slugify(title) || `module-${Date.now()}`,
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
  if (fields.title) patch.slug = slugify(fields.title);
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
  const { data, error: e } = await supabase
    .from("lessons")
    .insert({
      module_id: moduleId,
      title,
      slug: slugify(title) || `lesson-${Date.now()}`,
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
  },
): Promise<Result> {
  const { supabase, error } = await requireStaff();
  if (error) return { ok: false, error };

  const patch: Record<string, unknown> = {};
  if (fields.title) {
    patch.title = fields.title;
    patch.slug = slugify(fields.title);
  }
  if (fields.content) {
    const meta: MetaBlock = {
      type: "meta",
      author: fields.author ?? "SFMA Staff",
      frequency: fields.frequency ?? "important",
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
