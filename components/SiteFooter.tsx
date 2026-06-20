import Link from "next/link";
import { BrandMark } from "@/components/Brand";
import { Heart } from "@/components/icons";

const LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "About", href: "/about" },
  { label: "Problems", href: "/problems" },
  { label: "Team", href: "/team" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Group Lessons", href: "https://sfmathacademy.com", external: true },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-2xl px-6 py-14 text-center sm:px-8">
        <BrandMark className="mx-auto h-11 w-11" />
        <p className="mx-auto mt-4 max-w-sm text-[13.5px] leading-relaxed text-tmuted">
          A free, structured guide to competition and advanced mathematics, by
          the San Francisco Math Initiative.
        </p>

        <nav className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-[13.5px] font-medium text-tmuted">
          {LINKS.map((l) =>
            l.external ? (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold"
              >
                {l.label}
              </a>
            ) : (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-gold">
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="mt-9 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-[12px] text-tfaint sm:flex-row">
          <span>© {new Date().getFullYear()} San Francisco Math Initiative</span>
          <span className="inline-flex items-center gap-1.5">
            Built with <Heart className="h-3.5 w-3.5 text-danger" /> for students everywhere
          </span>
        </div>
      </div>
    </footer>
  );
}
