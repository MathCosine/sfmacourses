import { redirect } from "next/navigation";
import { getLessonStatuses, getNavTree, getSessionUser } from "@/lib/data";
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

  const [tree, statuses] = await Promise.all([
    getNavTree(),
    getLessonStatuses(user.id),
  ]);

  return (
    <ShellFrame
      tracks={toNavTracks(tree)}
      statuses={statuses}
      activeTrackSlug={activeTrackSlug}
      activeLessonId={activeLessonId}
      user={{
        name: user.profile?.full_name || user.email,
        email: user.email,
        role: user.isStaff ? "staff" : "student",
      }}
    >
      {children}
    </ShellFrame>
  );
}
