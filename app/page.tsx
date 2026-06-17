import Link from "next/link";
import { getSessionUser, getNavTree } from "@/lib/data";
import { trackTheme } from "@/lib/trackTheme";
import { ArrowRight } from "@/components/icons";

const TRACK_INFO: Record<string, { blurb: string; topics: string[] }> = {
  "amc-8": {
    blurb:
      "A rigorous foundation in number theory, counting, algebra, and geometry — everything tested on the AMC 8.",
    topics: ["Number Theory", "Combinatorics", "Algebra", "Geometry"],
  },
  "amc-10-12": {
    blurb:
      "Contest algebra, modular arithmetic, geometry, and the tactics that separate qualifiers from the rest.",
    topics: ["Algebra", "Number Theory", "Geometry", "Probability"],
  },
  "ap-calculus-bc": {
    blurb:
      "Limits, derivatives, integrals, and series — the complete AP Calculus BC curriculum, taught for mastery.",
    topics: ["Limits", "Derivatives", "Integration", "Series"],
  },
};

const FEATURES = [
  {
    title: "Track every step",
    body: "Mark chapters, sections, and individual problems as Reading, Practicing, Complete, or Skipped — your progress syncs across devices.",
  },
  {
    title: "Learn by doing",
    body: "Every topic is paired with real competition problems, hints, and full solutions you reveal exactly when you're ready.",
  },
  {
    title: "Curated resources",
    body: "Hand-picked references and video walkthroughs sit right beside the lesson, so you never lose your place.",
  },
];

export default async function HomePage() {
  const [user, tree] = await Promise.all([getSessionUser(), getNavTree()]);
  const cta = user ? "/dashboard" : "/auth";

  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-[17px] font-bold text-white">
              ∑
            </span>
            <span className="text-[16px] font-extrabold tracking-tight text-tprimary">
              SFMA<span className="ml-1.5 font-medium text-tmuted">Math Academy</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-[14px] font-medium">
            <a href="#courses" className="hidden rounded-md px-3 py-1.5 text-tmuted transition-colors hover:bg-bg hover:text-tprimary sm:inline">
              Courses
            </a>
            <a href="#about" className="hidden rounded-md px-3 py-1.5 text-tmuted transition-colors hover:bg-bg hover:text-tprimary sm:inline">
              About
            </a>
            <Link
              href={cta}
              className="rounded-md bg-gold px-4 py-1.5 font-semibold text-white shadow-accent transition-colors hover:bg-gold-hover"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-bg">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[12.5px] font-medium text-tmuted shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            Free &amp; open · San Francisco Math Initiative
          </div>
          <h1 className="text-[2.9rem] font-extrabold leading-[1.05] tracking-tight text-tprimary sm:text-[4.25rem]">
            San Francisco
            <br />
            Math Academy
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[18px] leading-relaxed text-tmuted">
            A free, structured guide of{" "}
            <span className="bg-gradient-to-r from-gold to-[#7c3aed] bg-clip-text font-semibold text-transparent">
              curated, rigorous lessons
            </span>{" "}
            to take you from the AMC 8 to AP Calculus BC and beyond.
          </p>
          <div className="mt-9 flex items-center justify-center">
            <Link
              href={cta}
              className="rounded-lg bg-surface px-7 py-3.5 text-[15px] font-bold text-tprimary shadow-md ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <h2 className="text-center text-[2rem] font-extrabold tracking-tight text-tprimary">
          Choose your track
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-[15px] text-tmuted">
          Each course is designed to cover every topic on its exam. Still under
          active construction — new chapters land regularly.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {tree.map((track) => {
            const info = TRACK_INFO[track.slug] ?? {
              blurb: track.description ?? "",
              topics: [],
            };
            const theme = trackTheme(track.slug);
            const lessons = track.modules.reduce(
              (a, m) => a + m.lessons.length,
              0,
            );
            return (
              <Link
                key={track.id}
                href={user ? `/learn/${track.slug}` : "/auth"}
                className="hover-lift group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
              >
                <div
                  className="px-6 py-5 text-white"
                  style={{ background: theme.banner }}
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">
                    {theme.tag}
                  </div>
                  <div className="mt-1 text-[1.6rem] font-extrabold tracking-tight">
                    {track.title}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="flex-1 text-[14.5px] leading-relaxed text-tmuted">
                    {info.blurb}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {info.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-bg px-2 py-0.5 text-[11.5px] font-medium text-tmuted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-[12.5px]">
                    <span className="text-tfaint">
                      {track.modules.length} units · {lessons} chapters
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-gold">
                      Explore
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-gold">
              Why we built this
            </div>
            <h2 className="mt-2 text-[2rem] font-extrabold leading-tight tracking-tight text-tprimary">
              Great math instruction, free for everyone.
            </h2>
            <p className="mt-5 text-[15.5px] leading-relaxed text-tmuted">
              The San Francisco Math Academy is a{" "}
              <strong className="font-semibold text-tprimary">
                completely free
              </strong>{" "}
              guide hosted by the San Francisco Math Initiative. Our goal: give
              every motivated student a clear, rigorous path through competition
              and advanced mathematics.
            </p>
            <p className="mt-4 text-[15.5px] leading-relaxed text-tmuted">
              Learn more about the Initiative and our programs at{" "}
              <a href="https://sfmathacademy.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-gold hover:underline">
                sfmathacademy.com
              </a>{" "}
              and{" "}
              <a href="https://sfmathopen.replit.app" target="_blank" rel="noopener noreferrer" className="font-semibold text-gold hover:underline">
                sfmathopen.replit.app
              </a>
              .
            </p>
          </div>
          <div className="grid gap-3 self-center">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-bg/60 p-5">
                <h3 className="text-[16px] font-bold text-tprimary">{f.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-tmuted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Group lessons */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="p-8 sm:p-10">
              <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-gold">
                New for Fall 2026
              </div>
              <h2 className="mt-2 text-[1.9rem] font-extrabold leading-tight tracking-tight text-tprimary">
                Group lessons, working through the guide together.
              </h2>
              <p className="mt-3 text-[15.5px] leading-relaxed text-tmuted">
                Live group classes that follow this guide chapter by chapter —
                with instructors, peers, and structured practice. Spots are
                limited.
              </p>
              <a
                href="https://sfmathacademy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-[14.5px] font-semibold text-white shadow-accent transition-colors hover:bg-gold-hover"
              >
                Learn more at sfmathacademy.com
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div
              className="hidden h-full min-h-[220px] lg:block"
              style={{
                background:
                  "linear-gradient(135deg, #2563eb, #7c3aed)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-center text-[13px] text-tmuted sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold text-[14px] font-bold text-white">∑</span>
            <span className="font-semibold text-tprimary">San Francisco Math Academy</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <a href="https://sfmathacademy.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold">sfmathacademy.com</a>
            <a href="https://sfmathopen.replit.app" target="_blank" rel="noopener noreferrer" className="hover:text-gold">sfmathopen.replit.app</a>
            <span className="text-tfaint">Free · San Francisco Math Initiative</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
