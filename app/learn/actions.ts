"use server";

import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LessonStatus, ProblemStatus } from "@/lib/types";

type DB = SupabaseClient;

/**
 * Update-or-insert a single row by a unique match, WITHOUT relying on a DB
 * unique constraint (so it works even if `on conflict` targets are missing).
 * Returns the Postgrest error, if any.
 */
async function upsertRow(
  supabase: DB,
  table: string,
  match: Record<string, unknown>,
  values: Record<string, unknown>,
) {
  const sel = await supabase.from(table).select("id").match(match).maybeSingle();
  if (sel.data?.id) {
    const { error } = await supabase.from(table).update(values).eq("id", sel.data.id);
    return error;
  }
  const { error } = await supabase.from(table).insert({ ...match, ...values });
  return error;
}

/** True if an error looks like "the status column doesn't exist yet." */
function isMissingStatusColumn(err: { message?: string; code?: string } | null) {
  if (!err) return false;
  const m = (err.message || "").toLowerCase();
  return err.code === "42703" || (m.includes("status") && m.includes("column"));
}

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function setLessonStatus(
  lessonId: string,
  status: LessonStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { supabase, userId } = await authed();
    if (!userId) return { ok: false, error: "Not authenticated" };

    const completed = status === "complete";
    const match = { user_id: userId, lesson_id: lessonId };
    const full = { status, completed, completed_at: completed ? new Date().toISOString() : null };

    let error = await upsertRow(supabase, "progress", match, full);
    if (isMissingStatusColumn(error)) {
      // DB predates the status migration — persist the boolean at least.
      error = await upsertRow(supabase, "progress", match, {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      });
    }
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save" };
  }
}

export async function setProblemStatus(
  lessonId: string,
  problemIndex: number,
  status: ProblemStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { supabase, userId } = await authed();
    if (!userId) return { ok: false, error: "Not authenticated" };

    const completed = status === "solved";
    const match = { user_id: userId, lesson_id: lessonId, problem_index: problemIndex };

    let error = await upsertRow(supabase, "problem_completions", match, { status, completed });
    if (isMissingStatusColumn(error)) {
      error = await upsertRow(supabase, "problem_completions", match, { completed });
    }
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save" };
  }
}

export async function setSectionStatus(
  lessonId: string,
  sectionIndex: number,
  status: LessonStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { supabase, userId } = await authed();
    if (!userId) return { ok: false, error: "Not authenticated" };

    const match = { user_id: userId, lesson_id: lessonId, section_index: sectionIndex };
    const error = await upsertRow(supabase, "section_completions", match, { status });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save" };
  }
}
