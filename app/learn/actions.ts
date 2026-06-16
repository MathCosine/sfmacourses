"use server";

import { createClient } from "@/lib/supabase/server";
import type { LessonStatus, ProblemStatus } from "@/lib/types";

export async function setSectionStatus(
  lessonId: string,
  sectionIndex: number,
  status: LessonStatus,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase.from("section_completions").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      section_index: sectionIndex,
      status,
    },
    { onConflict: "user_id,lesson_id,section_index" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setLessonStatus(
  lessonId: string,
  status: LessonStatus,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const completed = status === "complete";
  const { error } = await supabase.from("progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setProblemStatus(
  lessonId: string,
  problemIndex: number,
  status: ProblemStatus,
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
      status,
      completed: status === "solved",
    },
    { onConflict: "user_id,lesson_id,problem_index" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
