import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { TeamPhoto } from "@/components/TeamPhoto";
import { Users } from "@/components/icons";

export const metadata: Metadata = { title: "Team" };

interface Member {
  name: string;
  title: string;
  /** Accent color used for the monogram fallback + honor bullets. */
  color: string;
  /** Photo path under /public; falls back to a monogram if missing. */
  photo: string;
  honors: string[];
}

const TEAM: Member[] = [
  {
    name: "Zi-Jie (Thomas) Ni",
    title: "2× AIME Qualifier",
    color: "#0d9488",
    photo: "/team/thomas-ni.jpg",
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
    photo: "/team/ella-feng.jpg",
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
    photo: "/team/ethan-sun.jpg",
    honors: ["BmMT — Top 5%", "BMT DHM Award", "Mathcounts State Qualifier"],
  },
  {
    name: "Alexander Braun",
    title: "2× AIME Qualifier",
    color: "#ea580c",
    photo: "/team/alexander-braun.jpg",
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
    photo: "/team/seojin-lee.jpg",
    honors: ["Multiple Team Competition — Top 3"],
  },
  {
    name: "Temujin Battulga",
    title: "2× AIME Qualifier",
    color: "#7c3aed",
    photo: "/team/temujin-battulga.jpg",
    honors: ["BAMO 8 — Perfect Score", "LAMT Combinatorics — Top 20"],
  },
  {
    name: "Rylan Zhang",
    title: "AIME Qualifier",
    color: "#15803d",
    photo: "/team/rylan-zhang.jpg",
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

      {/* Roster */}
      <section className="mx-auto max-w-6xl px-6 py-14 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m) => (
            <article
              key={m.name}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
            >
              <TeamPhoto src={m.photo} name={m.name} color={m.color} />
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-serif text-[1.3rem] leading-tight text-tprimary">
                  {m.name}
                </h2>
                <div
                  className="mt-0.5 text-[12.5px] font-semibold"
                  style={{ color: m.color }}
                >
                  {m.title}
                </div>
                <ul className="mt-3.5 space-y-1.5 border-t border-border pt-3.5">
                  {m.honors.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2.5 text-[13px] leading-snug text-tmuted"
                    >
                      <span
                        className="mt-[6px] block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: m.color }}
                      />
                      {h}
                    </li>
                  ))}
                  <li className="pt-0.5 text-[12px] italic text-tfaint">
                    &amp; more notable accomplishments
                  </li>
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
