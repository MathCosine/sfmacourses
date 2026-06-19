"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileName(
  fullName: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const name = fullName.trim().slice(0, 120);
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: name || null,
    },
    { onConflict: "id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateProfileAvatar(
  avatarUrl: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      avatar_url: avatarUrl,
    },
    { onConflict: "id" },
  );
  if (error) return { ok: false, error: error.message };

  // Refresh the header (avatar) across the whole app.
  revalidatePath("/", "layout");
  return { ok: true };
}
