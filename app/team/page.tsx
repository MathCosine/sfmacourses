import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { Reveal } from "@/components/Reveal";
import { initials } from "@/lib/utils";
import { Users, Trophy, Sparkles } from "@/components/icons";

export const metadata: Metadata = { title: "Team" };

interface Member {
  name: string;
  /** Short title shown under the name. */
  title: string;
  /** Accent gradient for the avatar. */
  gradient: string;
  honors: string[];
}

const TEAM: Member[] = [
  {
    name: "Zi-Jie (Thomas) Ni",
    title: "2× AIME Qualifier",
    gradient: "linear-gradient(135deg, #0d9488, #0891b2)",
    honors: [
      "AMC 8 Perfect Score (2026)",
      "Mathcounts Chapter — 1st Place (Written & Countdown)",
      "BAMO 8 — 1st Place, Perfect Score",
      "BMT 2025 General Round — 2nd Place, Perfect Score",
      "BmMT 2026 — 1st Place Team (All Rounds)",
      "LAMT Combinatorics & Geometry — Top 20",
    ],
  },
  {
    name: "Ella Feng",
    title: "2× AIME Qualifier",
    gradient: "linear-gradient(135deg, #db2777, #9333ea)",
    honors: [
      "AMC 8 Perfect Score",
      "BmMT — Individual Top 20",
      "Exeter Math Club Competition Speed Round — 1st Place",
      "Gunn Math Competition Tiebreak Qualifier",
      "Mathcounts State Qualifier",
    ],
  },
  {
    name: "Ethan Sun",
    title: "2× AIME Qualifier",
    gradient: "linear-gradient(135deg, #2563eb, #4f46e5)",
    honors: [
      "BmMT — Top 5%",
      "BMT DHM Award",
      "Mathcounts State Qualifier",
    ],
  },
  {
    name: "Alexander Braun",
    title: "2× AIME Qualifier",
    gradient: "linear-gradient(135deg, #ea580c, #db2777)",
    honors: [
      "BmMT — Top 5%",
      "BMT General Round — Top 10 Individuals",
      "Gunn Math Competition — 5th Place (2026)",
      "Mathcounts State Qualifier",
    ],
  },
  {
    name: "Seojin Lee",
    title: "AIME Qualifier",
    gradient: "linear-gradient(135deg, #0891b2, #2563eb)",
    honors: [
      "Multiple Team Competition — Top 3",
    ],
  },
  {
    name: "Temujin Battulga",
    title: "2× AIME Qualifier",
    gradient: "linear-gradient(135deg, #7c3aed, #c026d3)",
    honors: [
      "BAMO 8 — Perfect Score",
      "LAMT Combinatorics — Top 20",
    ],
  },
  {
    name: "Rylan Zhang",
    title: "AIME Qualifier",
    gradient: "linear-gradient(135deg, #15803d, #0d9488)",
    honors: [
      "Solving & writing for the SFMA guide",
    ],
  },
];

export default function TeamPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="graph-paper-lg absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3.5 py-1.5 text-[12.5px] font-medium text-tmuted">
            <Users className="h-3.5 w-3.5 text-gold" />
            The people behind SFMA
          </div>
          <h1 className="mt-5 text-[2.8rem] font-extrabold leading-tight tracking-tight text-tprimary">
            Written by <span className="marker">competitors who&apos;ve been there</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16.5px] leading-relaxed text-tmuted">
            SFMA is built by a team of decorated AIME qualifiers and competition
            winners. Every lesson is shaped by people who have actually sat the
            exams — so the guidance is the kind we wish we&apos;d had.
          </p>
        </div>
      </section>

      {/* Roster */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={(i % 2) * 70}>
              <article className="hover-lift relative h-full overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="graph-paper absolute inset-0 opacity-[0.35]" />
                <div className="relative flex items-start gap-4">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[18px] font-bold text-white shadow-md"
                    style={{ background: m.gradient }}
                  >
                    {initials(m.name)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-serif text-[1.35rem] leading-tight text-tprimary">
                      {m.name}
                    </h2>
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gold/12 px-2.5 py-0.5 text-[12px] font-semibold text-gold">
                      <Trophy className="h-3.5 w-3.5" />
                      {m.title}
                    </div>
                  </div>
                </div>

                <ul className="relative mt-5 space-y-1.5">
                  {m.honors.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-[13.5px] leading-snug text-tmuted">
                      <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-gold/70" />
                      {h}
                    </li>
                  ))}
                  <li className="flex items-center gap-2 pt-1 text-[12.5px] font-medium text-tfaint">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    &amp; more notable accomplishments
                  </li>
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
