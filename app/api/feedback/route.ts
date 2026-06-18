import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CATEGORIES = ["bug", "idea", "content", "praise", "other"] as const;
type Category = (typeof CATEGORIES)[number];

/**
 * Accept a feedback / bug-report submission and store it in public.feedback.
 * Works for signed-out visitors too (RLS allows anon inserts). Degrades
 * gracefully with a clear message if the table hasn't been migrated yet
 * (run supabase/feedback.sql).
 */
export async function POST(req: Request) {
  let body: {
    category?: string;
    message?: string;
    email?: string;
    path?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (message.length < 4) {
    return NextResponse.json(
      { ok: false, error: "Please add a little more detail." },
      { status: 400 },
    );
  }
  if (message.length > 4000) {
    return NextResponse.json(
      { ok: false, error: "That message is too long." },
      { status: 400 },
    );
  }

  const category: Category = CATEGORIES.includes(body.category as Category)
    ? (body.category as Category)
    : "other";
  const email = (body.email ?? "").trim().slice(0, 320) || null;
  const path = (body.path ?? "").trim().slice(0, 512) || null;
  const userAgent = req.headers.get("user-agent")?.slice(0, 512) ?? null;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server is unavailable. Try again shortly." },
      { status: 503 },
    );
  }

  // Attribute to the signed-in user when available.
  let userId: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: userId,
    email,
    category,
    message,
    path,
    user_agent: userAgent,
  });

  if (error) {
    // 42P01 = undefined_table — migration not run yet.
    if (error.code === "42P01") {
      return NextResponse.json(
        {
          ok: false,
          error: "Feedback isn't set up yet. (Admin: run supabase/feedback.sql)",
        },
        { status: 200 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Could not save your feedback. Please try again." },
      { status: 200 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
