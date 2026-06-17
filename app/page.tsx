import Link from "next/link";
import { getSessionUser, getNavTree } from "@/lib/data";
import { trackTheme } from "@/lib/trackTheme";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Faq } from "@/components/Faq";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ListChecks,
  Target,
  Sparkles,
  Users,
  Check,
} from "@/components/icons";

const TRACK_INFO: Record<string, { blurb: string; topics: string[] }> = {
  "amc-8": {
    blurb:
      "A rigorous foundation in number theory, counting, algebra, and geometry — everything tested on the AMC 8.",
    topics: ["Number Theory", "Counting", "Algebra", "Geometry"],
  },
  "amc-10-12": {
    blurb:
      "Contest algebra, modular arithmetic, geometry, and the problem-solving tactics that separate qualifiers from the rest.",
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
    icon: BookOpen,
    title: "A structured path",
    body: "Lessons are organized into units and chapters that build on each other — no more guessing what to study next.",
  },
  {
    icon: ListChecks,
    title: "Track everything",
    body: "Mark chapters, sections, and individual problems as Reading, Practicing, Complete, or Skipped. Progress syncs across devices.",
  },
  {
    icon: Target,
    title: "Learn by solving",
    body: "Every topic is paired with real competition problems, hints, and full solutions you reveal exactly when you're ready.",
  },
];

const STATUS_LEGEND = [
  { label: "Not started", color: "#aeb4bf", filled: false },
  { label: "Reading", color: "#2563eb", filled: true },
  { label: "Practicing", color: "#d97706", filled: true },
  { label: "Complete", color: "#15a34a", filled: true, check: true },
  { label: "Skipped", color: "#7c3aed", filled: true },
];

const FAQ_ITEMS = [
  {
    q: "Is San Francisco Math Academy really free?",
    a: "Yes — completely free, forever. SFMA is a project of the San Francisco Math Initiative, a nonprofit dedicated to making great math instruction accessible to every student.",
  },
  {
    q: "Who is this for?",
    a: "Motivated students preparing for the AMC 8, AMC 10/12, or AP Calculus BC — whether you're just starting competition math or sharpening for qualification.",
  },
  {
    q: "How is the guide organized?",
    a: "Each course is split into units (broad topics), which contain chapters (individual lessons). Every chapter mixes explanation, worked examples, curated resources, and practice problems with full solutions.",
  },
  {
    q: "Do I need an account?",
    a: "You can browse freely, but a free account lets you track your progress on every chapter and problem, and pick up exactly where you left off.",
  },
  {
    q: "Are there live classes?",
    a: "Yes. Starting Fall 2026 we run live group lessons that follow this guide chapter by chapter, with instructors and peers. Learn more at sfmathacademy.com.",
  },
];

export default async function HomePage() {
  const [user, tree] = await Promise.all([getSessionUser(), getNavTree()]);
  const cta = user ? "/dashboard" : "/auth";
  const totalChapters = tree.reduce(
    (a, t) => a + t.modules.reduce((b, m) => b + m.lessons.length, 0),
    0,
  );
  const totalUnits = tree.reduce((a, t) => a + t.modules.length, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="dot-grid absolute inset-0 opacity-60" />
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div className="fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3.5 py-1.5 text-[12.5px] font-medium text-tmuted shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Free &amp; open · San Francisco Math Initiative
            </div>
            <h1 className="mt-5 text-[2.9rem] font-extrabold leading-[1.04] tracking-tight text-tprimary sm:text-[3.9rem]">
              Master competition math,{" "}
              <span className="bg-gradient-to-r from-gold to-purple bg-clip-text text-transparent">
                step by step.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-tmuted">
              A free collection of curated, high-quality lessons and problems to
              take you from the AMC 8 to AP Calculus BC and beyond — with
              progress tracking on every chapter.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={cta}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-[15px] font-bold text-white shadow-accent transition-all hover:-translate-y-0.5 hover:bg-gold-hover"
              >
                {user ? "Go to dashboard" : "Get started — it's free"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={user ? "/problems" : "/auth"}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-7 py-3.5 text-[15px] font-bold text-tprimary shadow-sm transition-all hover:-translate-y-0.5 hover:border-border-strong"
              >
                Browse problems
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px] text-tmuted">
              <Stat value={`${tree.length}`} label="courses" />
              <Stat value={`${totalUnits}`} label="units" />
              <Stat value={`${totalChapters}`} label="chapters" />
              <Stat value="100%" label="free" />
            </div>
          </div>

          {/* Product mock */}
          <div className="fade-up-1 relative">
            <HeroMock />
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-gold">
            Why SFMA
          </div>
          <h2 className="mt-2 text-[2.1rem] font-extrabold tracking-tight text-tprimary">
            Everything you need to actually improve
          </h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-tmuted">
            We borrowed the best ideas from the guides that work — and built
            them for math.
          </p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card hover-lift rounded-2xl p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/12 text-gold">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-[18px] font-bold text-tprimary">{f.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-tmuted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Courses ---------- */}
      <section id="courses" className="border-y border-border bg-surface-2">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-gold">
              Courses
            </div>
            <h2 className="mt-2 text-[2.1rem] font-extrabold tracking-tight text-tprimary">
              Choose your track
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-tmuted">
              Each course is designed to cover every topic on its exam — and is
              under active construction, with new chapters landing regularly.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {tree.map((track) => {
              const info = TRACK_INFO[track.slug] ?? {
                blurb: track.description ?? "",
                topics: [],
              };
              const theme = trackTheme(track.slug);
              const chapters = track.modules.reduce((a, m) => a + m.lessons.length, 0);
              return (
                <Link
                  key={track.id}
                  href={user ? `/learn/${track.slug}` : "/auth"}
                  className="hover-lift group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
                >
                  <div className="px-6 py-6 text-white" style={{ background: theme.gradient }}>
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">
                      {theme.tag}
                    </div>
                    <div className="mt-1 text-[1.65rem] font-extrabold tracking-tight">
                      {track.title}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="flex-1 text-[14.5px] leading-relaxed text-tmuted">{info.blurb}</p>
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
                        {track.modules.length} units · {chapters} chapters
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
        </div>
      </section>

      {/* ---------- Progress tracking feature ---------- */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-gold">
              A guide that remembers
            </div>
            <h2 className="mt-2 text-[2.1rem] font-extrabold leading-tight tracking-tight text-tprimary">
              Know exactly where you stand
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-tmuted">
              Every chapter, section, and problem has a status you control with a
              single click — the same flow that's made study guides like
              usaco.guide so effective. Your progress follows you everywhere.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "One-click status on chapters, sections, and problems",
                "Per-course progress rings and completion counts",
                "“Continue where you left off” on your dashboard",
                "Frequency labels show which topics matter most",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[14.5px] text-tprimary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green/15 text-green">
                    <Check className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              {STATUS_LEGEND.map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[12.5px] font-medium text-tmuted"
                >
                  <span
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: s.color,
                      background: s.filled ? s.color : "transparent",
                    }}
                  >
                    {s.check && <Check className="h-2 w-2 text-white" />}
                  </span>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:pl-6">
            <HeroMock dense />
          </div>
        </div>
      </section>

      {/* ---------- Group lessons ---------- */}
      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
          <div className="grid items-stretch gap-0 lg:grid-cols-[1.4fr_1fr]">
            <div className="p-9 sm:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/12 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-gold">
                <Users className="h-3.5 w-3.5" /> New for Fall 2026
              </div>
              <h2 className="mt-4 text-[2rem] font-extrabold leading-tight tracking-tight text-tprimary">
                Work through the guide together
              </h2>
              <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-tmuted">
                Live group classes that follow this guide chapter by chapter —
                with expert instructors, motivated peers, and structured
                practice. Spots are limited.
              </p>
              <a
                href="https://sfmathacademy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-[14.5px] font-semibold text-white shadow-accent transition-colors hover:bg-gold-hover"
              >
                Learn more at sfmathacademy.com
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <div className="relative hidden min-h-[260px] lg:block" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              <div className="dot-grid absolute inset-0 opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationBadge />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-gold">FAQ</div>
            <h2 className="mt-2 text-[2.1rem] font-extrabold tracking-tight text-tprimary">
              Questions, answered
            </h2>
          </div>
          <div className="mt-10">
            <Faq items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }} />
        <div className="dot-grid absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center text-white sm:px-8">
          <h2 className="text-[2.4rem] font-extrabold leading-tight tracking-tight">
            Start your math journey today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/85">
            Create a free account and begin tracking your way through the AMC 8,
            AMC 10/12, and AP Calculus BC.
          </p>
          <Link
            href={cta}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-[15px] font-bold text-[#1d4ed8] shadow-lg transition-transform hover:-translate-y-0.5"
          >
            {user ? "Go to dashboard" : "Get started for free"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-[18px] font-extrabold text-tprimary">{value}</span>
      <span>{label}</span>
    </span>
  );
}

function GraduationBadge() {
  return (
    <svg viewBox="0 0 24 24" className="h-28 w-28 text-white/90" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5M22 10v6" />
    </svg>
  );
}

/** Static product mock evoking a real division/chapter list. */
function HeroMock({ dense = false }: { dense?: boolean }) {
  const rows = [
    { title: "Introduction to Counting", status: "complete", freq: 3 },
    { title: "Casework & Complementary Counting", status: "practicing", freq: 3 },
    { title: "Pigeonhole Principle", status: "reading", freq: 2 },
    { title: "Stars and Bars", status: "not_started", freq: 2 },
    { title: "Expected Value", status: "skipped", freq: 1 },
  ];
  const colorOf: Record<string, string> = {
    complete: "#15a34a",
    practicing: "#d97706",
    reading: "#2563eb",
    skipped: "#7c3aed",
    not_started: "#aeb4bf",
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lift">
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green/70" />
        <span className="ml-3 text-[12px] font-medium text-tmuted">Counting &amp; Probability</span>
      </div>
      <div className="p-4">
        {!dense && (
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[13px] font-bold text-tprimary">Unit 2 · Combinatorics</div>
            <div className="text-[11.5px] font-semibold text-green">60% complete</div>
          </div>
        )}
        <div className="space-y-1.5">
          {rows.map((r) => {
            const c = colorOf[r.status];
            const filled = r.status !== "not_started";
            return (
              <div key={r.title} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5">
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                  style={{ borderColor: c, background: filled ? c : "transparent" }}
                >
                  {r.status === "complete" && <Check className="h-2.5 w-2.5 text-white" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-tprimary">{r.title}</span>
                <span className="flex items-center gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: i < r.freq ? "#15a34a" : "var(--color-border-strong)" }}
                    />
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
