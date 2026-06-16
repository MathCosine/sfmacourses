import Link from "next/link";
import { getSessionUser, getNavTree } from "@/lib/data";
import { ArrowRight } from "@/components/icons";

const TRACK_BLURBS: Record<string, { tag: string; blurb: string }> = {
  "amc-8": {
    tag: "Grades 6–8",
    blurb:
      "Build a rigorous foundation in number theory, counting, and geometry for the AMC 8.",
  },
  "amc-10-12": {
    tag: "High School",
    blurb:
      "Master algebra, modular arithmetic, and contest tactics for the AMC 10 and 12.",
  },
  aime: {
    tag: "Advanced",
    blurb:
      "Tackle olympiad-level techniques — LTE, generating functions, and more — for the AIME.",
  },
};

export default async function HomePage() {
  const [user, tree] = await Promise.all([getSessionUser(), getNavTree()]);
  const cta = user ? "/dashboard" : "/auth";

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Decorative background wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px]"
        style={{
          background:
            "radial-gradient(60% 70% at 50% -10%, rgba(168,106,10,0.10), transparent 70%), radial-gradient(40% 50% at 85% 10%, rgba(26,127,71,0.06), transparent 70%)",
        }}
      />

      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
        <div className="font-serif text-[1.7rem] leading-none text-gold">
          SFMA
        </div>
        <nav className="flex items-center gap-4 text-[14px]">
          <Link
            href={cta}
            className="rounded-full border border-border bg-surface/70 px-4 py-1.5 font-medium text-tmuted shadow-card backdrop-blur transition-colors hover:text-tprimary"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-12 text-center sm:pt-24">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[12.5px] font-medium text-tmuted shadow-card">
          <span className="text-gold">∑</span> Competition mathematics,
          beautifully structured
        </div>
        <h1 className="font-serif text-[3.25rem] font-medium leading-[1.04] tracking-tight text-tprimary sm:text-[5rem]">
          San Francisco
          <br />
          <span className="italic text-gold">Math Academy</span>
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-[18px] leading-relaxed text-tmuted">
          A free, structured guide to competition mathematics — from the AMC 8
          to the AIME.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href={cta}
            className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-[15px] font-semibold text-white shadow-lift transition-colors hover:bg-gold-hover"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* Track overview */}
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-10">
        <div className="grid gap-5 sm:grid-cols-3">
          {tree.map((track) => {
            const meta = TRACK_BLURBS[track.slug] ?? {
              tag: "Track",
              blurb: track.description ?? "",
            };
            const lessonCount = track.modules.reduce(
              (acc, m) => acc + m.lessons.length,
              0,
            );
            return (
              <Link
                key={track.id}
                href={user ? `/learn/${track.slug}` : "/auth"}
                className="group card hover-lift flex flex-col rounded-3xl p-7 hover:border-gold/40"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                  {meta.tag}
                </div>
                <h3 className="mt-2.5 font-serif text-[1.7rem] text-tprimary">
                  {track.title}
                </h3>
                <p className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-tmuted">
                  {meta.blurb}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-[12.5px] text-tfaint">
                  <span>
                    {track.modules.length} modules · {lessonCount} lessons
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-tint text-gold transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-[13px] text-tfaint">
        San Francisco Math Academy · A free resource for the math community
      </footer>
    </main>
  );
}
