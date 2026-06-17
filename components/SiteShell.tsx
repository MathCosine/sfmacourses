import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Page frame for the marketing + app pages that use the global top nav
 * (dashboard, division, problems, settings, about). Lesson pages use
 * {@link AppShell} instead, which adds the left module tree.
 */
export async function SiteShell({
  children,
  footer = true,
}: {
  children: React.ReactNode;
  footer?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {footer && <SiteFooter />}
    </div>
  );
}
