import { getLessonStatuses, getCourseTree, getSessionUser } from "@/lib/data";
import { toNavTracks } from "@/lib/nav";
import { ShellFrame } from "@/components/ShellFrame";
import type { NavUser } from "@/components/TopNav";

interface AppShellProps {
  activeTrackSlug?: string;
  activeLessonId?: string;
  children: React.ReactNode;
}

/**
 * Server component for lesson pages: global top nav + left module tree + content.
 * Redirects to /auth if the visitor is not authenticated.
 */
export async function AppShell({
  activeTrackSlug,
  activeLessonId,
  children,
}: AppShellProps) {
  const user = await getSessionUser();

  const [tree, statuses] = await Promise.all([
    getCourseTree(),
    user ? getLessonStatuses(user.id) : Promise.resolve({}),
  ]);

  const navUser: NavUser | null = user
    ? {
        name: user.profile?.full_name || user.email,
        email: user.email,
        isStaff: user.isStaff,
        avatarUrl: user.profile?.avatar_url ?? null,
      }
    : null;

  return (
    <ShellFrame
      tracks={toNavTracks(tree)}
      statuses={statuses}
      activeTrackSlug={activeTrackSlug}
      activeLessonId={activeLessonId}
      user={navUser}
    >
      {children}
    </ShellFrame>
  );
}
