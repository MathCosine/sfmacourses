"use server";

import { createClient } from "@/lib/supabase/server";

export async function setLessonComplete(
  lessonId: string,
  completed: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase.from("progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setProblemSolved(
  lessonId: string,
  problemIndex: number,
  completed: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase.from("problem_completions").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      problem_index: problemIndex,
      completed,
    },
    { onConflict: "user_id,lesson_id,problem_index" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
