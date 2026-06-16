import Link from "next/link";
import { getSessionUser, getNavTree } from "@/lib/data";
import { ArrowRight } from "@/components/icons";
import { HeroBackground } from "@/components/HeroBackground";

const TRACK_INFO: Record<
  string,
  { tag: string; blurb: string; topics: string[] }
> = {
  "amc-8": {
    tag: "Middle School",
    blurb:
      "A rigorous foundation in number theory, counting, algebra, and geometry — everything tested on the AMC 8.",
    topics: ["Number Theory", "Combinatorics", "Algebra", "Geometry"],
  },
  "amc-10-12": {
    tag: "High School",
    blurb:
      "Contest algebra, modular arithmetic, geometry, and the tactics that separate qualifiers from the rest.",
    topics: ["Algebra", "Number Theory", "Geometry", "Counting & Probability"],
  },
  "ap-calculus-bc": {
    tag: "Advanced",
    blurb:
      "Limits, derivatives, integrals, and series — the complete AP Calculus BC curriculum, taught for mastery.",
    topics: ["Limits", "Derivatives", "Integration", "Series"],
  },
};

const FEATURES = [
  {
    title: "Track every step",
    body: "Mark chapters and individual problems as Reading, Practicing, Complete, or Skipped — your progress follows you across devices.",
  },
  {
    title: "Learn by doing",
    body: "Every topic is paired with real competition problems, hints, and full solutions you can reveal exactly when you're ready.",
  },
  {
    title: "Curated resources",
    body: "Hand-picked references and video walkthroughs sit right alongside the lesson, so you never lose your place.",
  },
];

export default async function HomePage() {
  const [user, tree] = await Promise.all([getSessionUser(), getNavTree()]);
  const cta = user ? "/dashboard" : "/auth";

  return (
    <main className="relative overflow-hidden">
      {/* ---------------------------------------------------------- Nav */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl leading-none text-gold">
              SFMA
            </span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-tfaint sm:inline">
              Math Academy
            </span>
          </div>
          <nav className="flex items-center gap-2 text-[13.5px]">
            <a
              href="#tracks"
              className="hidden rounded-full px-3 py-1.5 text-tmuted transition-colors hover:text-tprimary sm:inline"
            >
              Courses
            </a>
            <a
              href="#about"
              className="hidden rounded-full px-3 py-1.5 text-tmuted transition-colors hover:text-tprimary sm:inline"
            >
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

      {/* ---------------------------------------------------------- Hero */}
      <section className="relative">
        <HeroBackground />
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-14 text-center sm:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3.5 py-1.5 text-[12.5px] font-medium text-tmuted shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            Free &amp; open · by the San Francisco Math Initiative
          </div>
          <h1 className="font-serif text-[3rem] font-semibold leading-[1.04] tracking-tight text-tprimary sm:text-[5rem]">
            Competition math,
            <br />
            <span className="relative inline-block italic text-gold">
              done right.
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="12"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M2 8 C 80 2, 220 2, 298 7"
                  stroke="#ca8a04"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-[17.5px] leading-relaxed text-tmuted">
            A free, structured guide that takes you from your first AMC 8 to AP
            Calculus BC — clear lessons, real problems, and progress tracking
            that keeps you moving.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={cta}
              className="group inline-flex items-center gap-2 rounded-md bg-gold px-7 py-3.5 text-[15px] font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5 hover:bg-gold-hover"
            >
              {user ? "Go to your dashboard" : "Start learning — it's free"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#about"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-6 py-3.5 text-[15px] font-medium text-tprimary transition-colors hover:border-gold/50"
            >
              Learn more
            </a>
          </div>
          <p className="mt-5 text-[12.5px] text-tfaint">
            No paywall, no account required to read · 3 courses and growing
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------- Tracks */}
      <section id="tracks" className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
              The curriculum
            </div>
            <h2 className="mt-2 font-serif text-3xl text-tprimary sm:text-4xl">
              Three courses, one path
            </h2>
          </div>
          <span className="hidden rounded-md border border-gold/30 bg-gold/10 px-3 py-1 text-[11.5px] font-medium text-gold sm:inline">
            Still under construction
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {tree.map((track) => {
            const info = TRACK_INFO[track.slug] ?? {
              tag: "Course",
              blurb: track.description ?? "",
              topics: [],
            };
            const lessons = track.modules.reduce(
              (a, m) => a + m.lessons.length,
              0,
            );
            return (
              <Link
                key={track.id}
                href={user ? `/learn/${track.slug}` : "/auth"}
                className="group flex flex-col rounded-2xl border border-border bg-surface p-7 transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                    {info.tag}
                  </span>
                  <span className="text-[11.5px] text-tfaint">
                    {track.modules.length} units · {lessons} chapters
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-2xl text-tprimary">
                  {track.title}
                </h3>
                <p className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-tmuted">
                  {info.blurb}
                </p>
                {info.topics.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {info.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-bg px-2 py-0.5 text-[11.5px] text-tmuted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold">
                  Explore course
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
        <p className="mt-5 text-[13px] text-tmuted">
          Each course is designed to cover{" "}
          <span className="text-tprimary">every topic</span> on its exam. We're
          actively building out chapters — check back often as the guide grows.
        </p>
      </section>

      {/* ---------------------------------------------------------- About */}
      <section id="about" className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
              Why we built this
            </div>
            <h2 className="mt-2 font-serif text-3xl leading-snug text-tprimary sm:text-4xl">
              Great math instruction shouldn't cost anything.
            </h2>
            <p className="mt-5 text-[15.5px] leading-relaxed text-tmuted">
              The San Francisco Math Academy is a{" "}
              <strong className="font-semibold text-tprimary">
                completely free
              </strong>{" "}
              guide hosted by the San Francisco Math Initiative. Our goal is
              simple: give every motivated student a clear, rigorous path
              through competition and advanced mathematics — the same path our
              own students follow.
            </p>
            <p className="mt-4 text-[15.5px] leading-relaxed text-tmuted">
              Learn more about the Initiative and our in-person programs at{" "}
              <a
                href="https://sfmathacademy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold underline decoration-gold/30 underline-offset-2 hover:decoration-gold"
              >
                sfmathacademy.com
              </a>{" "}
              and{" "}
              <a
                href="https://sfmathopen.replit.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold underline decoration-gold/30 underline-offset-2 hover:decoration-gold"
              >
                sfmathopen.replit.app
              </a>
              .
            </p>
          </div>

          <div className="grid gap-4 self-center">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-bg/50 p-5"
              >
                <h3 className="font-serif text-lg text-tprimary">{f.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-tmuted">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Group lessons */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <div
          className="overflow-hidden rounded-3xl border border-gold/30 px-8 py-10 sm:px-12"
          style={{
            background:
              "linear-gradient(120deg, rgba(59,91,219,0.10), rgba(47,158,68,0.06) 70%), #ffffff",
          }}
        >
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
                New for Fall 2026
              </div>
              <h2 className="mt-2 font-serif text-3xl leading-snug text-tprimary sm:text-[2.5rem]">
                Group lessons, working through the guide together.
              </h2>
              <p className="mt-3 text-[15.5px] leading-relaxed text-tmuted">
                This fall we're offering live group classes that follow this
                guide chapter by chapter — with instructors, peers, and
                structured practice. Spots are limited.
              </p>
            </div>
            <a
              href="https://sfmathacademy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex shrink-0 items-center gap-2 rounded-md bg-gold px-7 py-3.5 text-[15px] font-semibold text-white shadow-lift transition-colors hover:bg-gold-hover"
            >
              Learn more at sfmathacademy.com
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
        <h2 className="font-serif text-3xl text-tprimary sm:text-4xl">
          Ready to begin?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[15.5px] text-tmuted">
          Create a free account to track your progress, or just start reading —
          the entire guide is open.
        </p>
        <Link
          href={cta}
          className="group mt-7 inline-flex items-center gap-2 rounded-md bg-gold px-7 py-3.5 text-[15px] font-semibold text-white shadow-lift transition-colors hover:bg-gold-hover"
        >
          {user ? "Go to your dashboard" : "Get started for free"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>

      {/* ---------------------------------------------------------- Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-center text-[13px] text-tmuted sm:flex-row sm:text-left">
          <div>
            <span className="font-serif text-lg text-gold">SFMA</span>
            <span className="ml-2 text-tfaint">
              San Francisco Math Academy
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <a
              href="https://sfmathacademy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold"
            >
              sfmathacademy.com
            </a>
            <a
              href="https://sfmathopen.replit.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold"
            >
              sfmathopen.replit.app
            </a>
            <span className="text-tfaint">
              A free resource · San Francisco Math Initiative
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
