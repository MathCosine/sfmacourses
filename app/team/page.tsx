import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { initials } from "@/lib/utils";
import { Users } from "@/components/icons";

export const metadata: Metadata = { title: "Team" };

interface Member {
  name: string;
  /** Short title shown under the name. */
  title: string;
  /** Solid accent color for the monogram. */
  color: string;
  honors: string[];
}

const TEAM: Member[] = [
  {
    name: "Zi-Jie (Thomas) Ni",
    title: "2× AIME Qualifier",
    color: "#0d9488",
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
    color: "#db2777",
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
    color: "#2563eb",
    honors: ["BmMT — Top 5%", "BMT DHM Award", "Mathcounts State Qualifier"],
  },
  {
    name: "Alexander Braun",
    title: "2× AIME Qualifier",
    color: "#ea580c",
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
    color: "#0891b2",
    honors: ["Multiple Team Competition — Top 3"],
  },
  {
    name: "Temujin Battulga",
    title: "2× AIME Qualifier",
    color: "#7c3aed",
    honors: ["BAMO 8 — Perfect Score", "LAMT Combinatorics — Top 20"],
  },
  {
    name: "Rylan Zhang",
    title: "AIME Qualifier",
    color: "#15803d",
    honors: ["Solving & writing for the SFMA guide"],
  },
];

export default function TeamPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3.5 py-1.5 text-[12.5px] font-medium text-tmuted">
            <Users className="h-3.5 w-3.5 text-gold" />
            The people behind SFMA
          </div>
          <h1 className="mt-5 text-[2.6rem] font-extrabold leading-tight tracking-tight text-tprimary">
            Written by <span className="marker">competitors who&apos;ve been there</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-tmuted">
            SFMA is built by a team of decorated AIME qualifiers and competition
            winners. Every lesson is shaped by people who have actually sat the
            exams — so the guidance is the kind we wish we&apos;d had.
          </p>
        </div>
      </section>

      {/* Roster — flat, editorial cards */}
      <section className="mx-auto max-w-5xl px-6 py-14 sm:px-8">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {TEAM.map((m) => (
            <article key={m.name} className="bg-surface p-6 sm:p-7">
              <div className="flex items-center gap-3.5">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white"
                  style={{ background: m.color }}
                >
                  {initials(m.name)}
                </span>
                <div className="min-w-0">
                  <h2 className="font-serif text-[1.25rem] leading-tight text-tprimary">
                    {m.name}
                  </h2>
                  <div className="text-[12.5px] font-medium" style={{ color: m.color }}>
                    {m.title}
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
                {m.honors.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2.5 text-[13.5px] leading-snug text-tmuted"
                  >
                    <span
                      className="mt-[7px] block h-1 w-1 shrink-0 rounded-full"
                      style={{ background: m.color }}
                    />
                    {h}
                  </li>
                ))}
                <li className="pt-1 text-[12.5px] italic text-tfaint">
                  &amp; more notable accomplishments
                </li>
              </ul>
            </article>
          ))}
          {TEAM.length % 2 === 1 && (
            <div className="hidden bg-surface sm:block" aria-hidden />
          )}
        </div>
      </section>
    </SiteShell>
  );
}
