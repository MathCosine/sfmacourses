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
    <main className="min-h-screen">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="font-serif text-2xl leading-none text-gold">SFMA</div>
        <nav className="flex items-center gap-4 text-[14px]">
          <Link
            href={cta}
            className="text-tmuted transition-colors hover:text-tprimary"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center sm:pt-24">
        <div className="mb-5 inline-block rounded-full border border-border bg-surface px-3.5 py-1 text-[12px] font-medium text-tmuted">
          ∑ &nbsp;Competition mathematics, beautifully structured
        </div>
        <h1 className="font-serif text-5xl leading-[1.05] text-tprimary sm:text-7xl">
          San Francisco
          <br />
          Math Academy
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-tmuted">
          A free, structured guide to competition mathematics.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <Link
            href={cta}
            className="group inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-[15px] font-semibold text-bg transition-colors hover:bg-gold-hover"
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
                className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:border-gold/50"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                  {meta.tag}
                </div>
                <h3 className="mt-2 font-serif text-2xl text-tprimary">
                  {track.title}
                </h3>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-tmuted">
                  {meta.blurb}
                </p>
                <div className="mt-5 flex items-center justify-between text-[12.5px] text-tfaint">
                  <span>
                    {track.modules.length} modules · {lessonCount} lessons
                  </span>
                  <ArrowRight className="h-4 w-4 text-tmuted transition-transform group-hover:translate-x-0.5" />
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
