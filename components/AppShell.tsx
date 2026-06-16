import { redirect } from "next/navigation";
import { getCompletedLessonIds, getNavTree, getSessionUser } from "@/lib/data";
import { toNavTracks } from "@/lib/nav";
import { ShellFrame } from "@/components/ShellFrame";

interface AppShellProps {
  activeTrackSlug?: string;
  activeLessonId?: string;
  children: React.ReactNode;
}

/**
 * Server component that loads the nav tree + the signed-in user and renders the
 * three-column app frame (left sidebar + content). Redirects to /auth if the
 * visitor is not authenticated.
 */
export async function AppShell({
  activeTrackSlug,
  activeLessonId,
  children,
}: AppShellProps) {
  const user = await getSessionUser();
  if (!user) redirect("/auth");

  const [tree, completedSet] = await Promise.all([
    getNavTree(),
    getCompletedLessonIds(user.id),
  ]);

  return (
    <ShellFrame
      tracks={toNavTracks(tree)}
      completed={[...completedSet]}
      activeTrackSlug={activeTrackSlug}
      activeLessonId={activeLessonId}
      user={{
        name: user.profile?.full_name || user.email,
        email: user.email,
        role: user.profile?.role ?? "student",
      }}
    >
      {children}
    </ShellFrame>
  );
}
