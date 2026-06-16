import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Read-only diagnostics. Visit /api/health and read the JSON: each step reports
 * whether that query/column works against the live database. Safe to ship.
 */
export async function GET() {
  const out: Record<string, unknown> = {};
  let supabase;
  try {
    supabase = await createClient();
  } catch (e) {
    return NextResponse.json({ fatal: String(e) }, { status: 200 });
  }

  async function step(name: string, fn: () => Promise<{ error: unknown }>) {
    try {
      const { error } = await fn();
      out[name] = error ? { error: (error as { message?: string }).message ?? error } : "ok";
    } catch (e) {
      out[name] = { threw: String(e) };
    }
  }

  await step("auth.getUser", async () => {
    const { error } = await supabase!.auth.getUser();
    return { error };
  });
  await step("tracks", async () =>
    supabase!.from("tracks").select("id, slug").limit(1),
  );
  await step("modules", async () =>
    supabase!.from("modules").select("id, slug").limit(1),
  );
  await step("lessons", async () =>
    supabase!.from("lessons").select("id, slug, content").limit(1),
  );
  await step("profiles", async () =>
    supabase!.from("profiles").select("id, role").limit(1),
  );
  await step("progress.status", async () =>
    supabase!.from("progress").select("lesson_id, status, completed").limit(1),
  );
  await step("problem_completions.status", async () =>
    supabase!
      .from("problem_completions")
      .select("problem_index, status, completed")
      .limit(1),
  );
  await step("section_completions", async () =>
    supabase!
      .from("section_completions")
      .select("section_index, status")
      .limit(1),
  );
  await step("announcements", async () =>
    supabase!.from("announcements").select("id").limit(1),
  );

  return NextResponse.json(out, { status: 200 });
}
