import { getNavTree, getSessionUser } from "@/lib/data";
import { toNavTracks } from "@/lib/nav";
import { TopNav, type NavUser } from "@/components/TopNav";

/**
 * Server wrapper that loads the nav tree + signed-in user and renders the
 * global top navigation. Safe to use on any page (does not require auth).
 */
export async function SiteHeader() {
  const [tree, user] = await Promise.all([getNavTree(), getSessionUser()]);
  const navUser: NavUser | null = user
    ? {
        name: user.profile?.full_name || user.email,
        email: user.email,
        isStaff: user.isStaff,
      }
    : null;
  return <TopNav tracks={toNavTracks(tree)} user={navUser} />;
}
