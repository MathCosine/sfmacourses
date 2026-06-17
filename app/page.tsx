import Link from "next/link";
import { getSessionUser, getNavTree } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";
import { trackTheme } from "@/lib/trackTheme";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Faq } from "@/components/Faq";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, ArrowUpRight, Check } from "@/components/icons";

const TRACK_INFO: Record<string, { blurb: string; topics: string[] }> = {
  "amc-8": {
    blurb:
      "Number theory, counting, algebra, and geometry — the full foundation the AMC 8 rewards.",
    topics: ["Number Theory", "Counting", "Algebra", "Geometry"],
  },
  "amc-10-12": {
    blurb:
      "Contest algebra, modular arithmetic, and the problem-solving instincts that get students to qualify.",
    topics: ["Algebra", "Number Theory", "Geometry", "Probability"],
  },
  "ap-calculus-bc": {
    blurb:
      "Limits through series — the complete AP Calculus BC curriculum, taught for genuine mastery.",
    topics: ["Limits", "Derivatives", "Integration", "Series"],
  },
};

const STEPS = [
  {
    n: "01",
    title: "Follow a real sequence",
    body: "Units and chapters that build on each other, so you always know the next thing to learn — not a pile of disconnected handouts.",
  },
  {
    n: "02",
    title: "Mark what you've done",
    body: "Set every chapter, section, and problem to Reading, Practicing, Complete, or Skipped with one click. It syncs to your account and follows you everywhere.",
  },
  {
    n: "03",
    title: "Practice, then check yourself",
    body: "Each topic comes with real contest problems, hints, and full solutions you reveal only when you're ready to compare.",
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
    a: "Yes — completely free, forever. SFMA is a project of the San Francisco Math Initiative, a nonprofit set on making great math instruction reachable for every student.",
  },
  {
    q: "Who is it for?",
    a: "Motivated students preparing for the AMC 8, AMC 10/12, or AP Calculus BC — whether you're brand new to competition math or sharpening for qualification.",
  },
  {
    q: "How is the guide organized?",
    a: "Each course splits into units (broad topics) made of chapters (individual lessons). Every chapter mixes explanation, worked examples, curated resources, and practice problems with full solutions.",
  },
  {
    q: "Do I need an account?",
    a: "You can read freely, but a free account lets you track progress on every chapter and problem and pick up exactly where you left off.",
  },
  {
    q: "Are there live classes?",
    a: "Yes. Starting Fall 2026 we run live group lessons that follow this guide chapter by chapter, with instructors and peers. Details at sfmathacademy.com.",
  },
];

export default async function HomePage() {
  const [user, tree] = await Promise.all([getSessionUser(), getNavTree()]);
  const cta = user ? "/dashboard" : "/auth";
  const totalChapters = tree.reduce(
    (a, t) => a + t.modules.reduce((b, m) => b + m.lessons.length, 0),
    0,
  );

  // Real, server-rendered math for the hero excerpt — this is a math site.
  const [qHtml, aHtml, formulaHtml] = await Promise.all([
    renderMarkdown(
      "Why is $\\overline{ABCABC}$ always divisible by $7$, $11$, and $13$?",
    ),
    renderMarkdown(
      "$\\overline{ABCABC} = \\overline{ABC}\\cdot 1001 = \\overline{ABC}\\cdot 7\\cdot 11\\cdot 13.$",
    ),
    renderMarkdown("$\\tau(n) = (e_1+1)(e_2+1)\\cdots(e_k+1)$"),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden border-b border-border bg-bg">
        <div className="graph-paper-lg absolute inset-0 opacity-70" />
        <div className="absolute -right-32 -top-24 h-80 w-80 rounded-full bg-gold/8 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:py-24">
          <div className="fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[12.5px] font-medium text-tmuted shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              Free &amp; open · hosted by the San Francisco Math Initiative
            </div>
            <h1 className="mt-6 text-[2.7rem] font-extrabold leading-[1.06] tracking-tight text-tprimary sm:text-[3.7rem]">
              The math you need,
              <br />
              in an order that{" "}
              <span className="marker whitespace-nowrap">makes sense.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[17.5px] leading-relaxed text-tmuted">
              A free, carefully sequenced guide of lessons and contest problems —
              from the AMC 8 to AP Calculus BC — with your progress tracked on
              every single chapter.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={cta}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-[15px] font-bold text-white shadow-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-hover"
              >
                {user ? "Go to your dashboard" : "Start learning — free"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={user ? "/problems" : "/auth"}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-bold text-tprimary transition-colors hover:text-gold"
              >
                Browse the problem set
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-7 text-[13.5px] text-tfaint">
              {tree.length} courses · {totalChapters} chapters · always $0
            </p>
          </div>

          {/* Notebook-style excerpt with real rendered math */}
          <div className="fade-up-1">
            <HeroExcerpt qHtml={qHtml} aHtml={aHtml} formulaHtml={formulaHtml} />
          </div>
        </div>
      </section>

      {/* ---------- How it works (editorial, numbered) ---------- */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-8">
        <Reveal>
          <h2 className="max-w-2xl text-[2.05rem] font-extrabold leading-tight tracking-tight text-tprimary">
            It works the way a good teacher would lay it out.
          </h2>
        </Reveal>
        <div className="mt-12 space-y-px overflow-hidden rounded-2xl border border-border">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 70}>
              <div className="grid items-start gap-5 bg-surface px-6 py-7 sm:grid-cols-[auto_1fr] sm:px-9 sm:py-9">
                <div className="font-mono text-[2.4rem] font-bold leading-none text-gold/30">
                  {s.n}
                </div>
                <div>
                  <h3 className="text-[19px] font-bold text-tprimary">{s.title}</h3>
                  <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-tmuted">
                    {s.body}
                  </p>
                  {s.n === "02" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {STATUS_LEGEND.map((st) => (
                        <span
                          key={st.label}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-1 text-[12px] font-medium text-tmuted"
                        >
                          <span
                            className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-2"
                            style={{ borderColor: st.color, background: st.filled ? st.color : "transparent" }}
                          >
                            {st.check && <Check className="h-2 w-2 text-white" />}
                          </span>
                          {st.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Courses ---------- */}
      <section id="courses" className="relative border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[2.05rem] font-extrabold tracking-tight text-tprimary">
                Three courses. One clear path.
              </h2>
              <p className="max-w-sm text-[14.5px] leading-relaxed text-tmuted">
                Each course aims to cover every topic on its exam — and grows as
                we publish new chapters.
              </p>
            </div>
          </Reveal>

          <div className="mt-11 grid gap-6 lg:grid-cols-3">
            {tree.map((track, i) => {
              const info = TRACK_INFO[track.slug] ?? {
                blurb: track.description ?? "",
                topics: [],
              };
              const theme = trackTheme(track.slug);
              const chapters = track.modules.reduce((a, m) => a + m.lessons.length, 0);
              return (
                <Reveal key={track.id} delay={i * 80}>
                  <Link
                    href={user ? `/learn/${track.slug}` : "/auth"}
                    className="hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
                  >
                    <div className="relative overflow-hidden px-6 py-6 text-white" style={{ background: theme.gradient }}>
                      <div className="graph-paper absolute inset-0 opacity-20" />
                      <div className="relative">
                        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">{theme.tag}</div>
                        <div className="mt-1 text-[1.6rem] font-extrabold tracking-tight">{track.title}</div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="flex-1 text-[14.5px] leading-relaxed text-tmuted">{info.blurb}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {info.topics.map((t) => (
                          <span key={t} className="rounded-md bg-bg px-2 py-0.5 text-[11.5px] font-medium text-tmuted">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-[12.5px]">
                        <span className="text-tfaint">{track.modules.length} units · {chapters} chapters</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-gold">
                          Open
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Initiative / mission ---------- */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div>
              <h2 className="text-[2.05rem] font-extrabold leading-tight tracking-tight text-tprimary">
                Built by the San Francisco Math Initiative — and{" "}
                <span className="marker-blue">free for good.</span>
              </h2>
              <p className="mt-5 text-[15.5px] leading-relaxed text-tmuted">
                We started SFMA because the best math materials are scattered
                across forums, PDFs, and old handouts, and it's hard to know what
                to study next. So we organized it: clear units, real practice,
                and a guide that remembers where you are.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-[14px]">
                <a href="https://sfmathacademy.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-gold hover:underline">
                  sfmathacademy.com <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <span className="text-tfaint">·</span>
                <a href="https://sfmathopen.replit.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-gold hover:underline">
                  sfmathopen.replit.app <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { k: `${tree.length}`, v: "free courses" },
                { k: `${totalChapters}`, v: "chapters & counting" },
                { k: "$0", v: "now and always" },
                { k: "100%", v: "of solutions included" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-border bg-surface p-6">
                  <div className="text-[2rem] font-extrabold tracking-tight text-tprimary">{s.k}</div>
                  <div className="mt-1 text-[13px] text-tmuted">{s.v}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Group lessons ---------- */}
      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="graph-paper absolute inset-0 opacity-50" />
            <div className="relative grid items-center gap-8 p-9 sm:p-12 lg:grid-cols-[1.5fr_1fr]">
              <div>
                <div className="text-[12.5px] font-semibold text-gold">New for Fall 2026</div>
                <h2 className="mt-2 text-[2rem] font-extrabold leading-tight tracking-tight text-tprimary">
                  Want to go through it with a class?
                </h2>
                <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-tmuted">
                  We're running live group lessons that follow this exact guide,
                  chapter by chapter, with instructors and classmates. Spots are
                  limited.
                </p>
                <a
                  href="https://sfmathacademy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-[14.5px] font-semibold text-white shadow-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-hover"
                >
                  See the classes <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <div className="hidden justify-self-end lg:block">
                <div className="font-mono text-[5.5rem] font-bold leading-none text-gold/15">∑</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
          <Reveal>
            <h2 className="text-center text-[2.05rem] font-extrabold tracking-tight text-tprimary">
              Good questions
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-10">
              <Faq items={FAQ_ITEMS} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="relative overflow-hidden border-t border-border bg-bg">
        <div className="graph-paper-lg absolute inset-0 opacity-70" />
        <Reveal>
          <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:px-8">
            <h2 className="text-[2.4rem] font-extrabold leading-tight tracking-tight text-tprimary">
              Pick a course and start today.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-tmuted">
              Make a free account, open the first chapter, and let SFMA keep
              track of the rest.
            </p>
            <Link
              href={cta}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-3.5 text-[15px] font-bold text-white shadow-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-hover"
            >
              {user ? "Go to your dashboard" : "Get started for free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}

/** A faux open-notebook chapter excerpt with real, server-rendered math. */
function HeroExcerpt({
  qHtml,
  aHtml,
  formulaHtml,
}: {
  qHtml: string;
  aHtml: string;
  formulaHtml: string;
}) {
  const rows = [
    { title: "Divisibility Rules", status: "complete" },
    { title: "Prime Factorization & GCD/LCM", status: "reading" },
    { title: "Counting Methods", status: "not_started" },
  ];
  const colorOf: Record<string, string> = {
    complete: "#15a34a",
    reading: "#2563eb",
    not_started: "#aeb4bf",
  };
  return (
    <div className="rotate-[0.6deg] rounded-2xl border border-border bg-surface shadow-lift transition-transform duration-300 hover:rotate-0">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-gold">AMC 8 · Number Theory</span>
        <span className="flex items-center gap-0.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i < 3 ? "#15a34a" : "var(--color-border-strong)" }} />
          ))}
        </span>
      </div>
      <div className="px-5 py-5">
        <div className="prose-sfma text-[15px]" dangerouslySetInnerHTML={{ __html: qHtml }} />
        <div className="mt-2 rounded-xl border border-border bg-bg px-4 py-3">
          <div className="prose-sfma text-[14px]" dangerouslySetInnerHTML={{ __html: aHtml }} />
        </div>
        <div className="mt-3 flex items-center gap-2 text-[12.5px] text-tmuted">
          <span className="font-semibold text-tprimary">Divisor count:</span>
          <span className="prose-sfma" dangerouslySetInnerHTML={{ __html: formulaHtml }} />
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-tfaint">Your progress</div>
          <div className="space-y-1.5">
            {rows.map((r) => {
              const c = colorOf[r.status];
              const filled = r.status !== "not_started";
              return (
                <div key={r.title} className="flex items-center gap-2.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border-2" style={{ borderColor: c, background: filled ? c : "transparent" }}>
                    {r.status === "complete" && <Check className="h-2.5 w-2.5 text-white" />}
                  </span>
                  <span className="text-[13.5px] font-medium text-tprimary">{r.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
