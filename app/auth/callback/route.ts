import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth (and email-link) callback. Supabase redirects here with a `code` after
 * the provider sign-in; we exchange it for a session cookie, make sure a
 * profile row exists, then continue to the originally requested page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/auth?error=oauth`);
  }

  // Ensure the user has a profile row (DO NOTHING keeps an existing role/name).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name:
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          null,
        role: "student",
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
