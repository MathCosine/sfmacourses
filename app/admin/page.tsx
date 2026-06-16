import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getAllProfiles,
  getAnnouncements,
  getNavTree,
  getSessionUser,
} from "@/lib/data";
import { AdminClient } from "./AdminClient";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { lesson } = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/auth");
  if (user.profile?.role !== "staff") redirect("/dashboard");

  const supabase = await createClient();
  const [tree, profiles, announcements, progressRes] = await Promise.all([
    getNavTree(),
    getAllProfiles(),
    getAnnouncements(),
    supabase.from("progress").select("user_id, completed").eq("completed", true),
  ]);

  const progressByUser = new Map<string, number>();
  for (const row of progressRes.data ?? []) {
    progressByUser.set(
      row.user_id as string,
      (progressByUser.get(row.user_id as string) ?? 0) + 1,
    );
  }

  const totalLessons = tree.reduce(
    (a, t) => a + t.modules.reduce((b, m) => b + m.lessons.length, 0),
    0,
  );

  return (
    <AdminClient
      tree={tree}
      profiles={profiles.map((p) => ({
        ...p,
        completedCount: progressByUser.get(p.id) ?? 0,
      }))}
      announcements={announcements}
      totalLessons={totalLessons}
      openLessonId={lesson ?? null}
    />
  );
}
