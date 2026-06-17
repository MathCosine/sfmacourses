import Link from "next/link";
import { Github, Heart } from "@/components/icons";

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Learn",
    links: [
      { label: "AMC 8", href: "/learn/amc-8" },
      { label: "AMC 10/12", href: "/learn/amc-10-12" },
      { label: "AP Calculus BC", href: "/learn/ap-calculus-bc" },
      { label: "All Problems", href: "/problems" },
    ],
  },
  {
    title: "Initiative",
    links: [
      { label: "About SFMA", href: "/about" },
      { label: "sfmathacademy.com", href: "https://sfmathacademy.com", external: true },
      { label: "sfmathopen.replit.app", href: "https://sfmathopen.replit.app", external: true },
      { label: "Group Lessons", href: "https://sfmathacademy.com", external: true },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
      { label: "Sign in", href: "/auth" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-[18px] font-bold text-white shadow-accent">
                ∑
              </span>
              <span className="text-[16px] font-extrabold tracking-tight text-tprimary">
                SFMA <span className="font-medium text-tmuted">Math Academy</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-tmuted">
              A free, structured guide to competition and advanced mathematics,
              hosted by the San Francisco Math Initiative.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1 text-[12px] font-medium text-tmuted">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              Completely free, forever
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-tfaint">
                {col.title}
              </div>
              <ul className="mt-3.5 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13.5px] text-tmuted transition-colors hover:text-gold"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-[13.5px] text-tmuted transition-colors hover:text-gold">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-[12.5px] text-tfaint sm:flex-row">
          <span>© {new Date().getFullYear()} San Francisco Math Initiative. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5">
            Built with <Heart className="h-3.5 w-3.5 text-danger" /> for students everywhere
            <Github className="ml-2 h-4 w-4" />
          </span>
        </div>
      </div>
    </footer>
  );
}
