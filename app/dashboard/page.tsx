import Link from "next/link";
import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { ProgressRing } from "@/components/ProgressRing";
import { InteractiveGrid } from "@/components/InteractiveGrid";
import {
  getAnnouncements,
  getLessonStatuses,
  getCourseTree,
  getSessionUser,
} from "@/lib/data";
import { trackTheme } from "@/lib/trackTheme";
import { formatDate, extractMeta } from "@/lib/utils";
import { MATURITY_META, MATURITY_OPTIONS } from "@/lib/maturity";
import type { LessonStatus, Maturity } from "@/lib/types";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Layers,
  Compass,
} from "@/components/icons";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getSessionUser();
  const [tree, statuses, announcements] = await Promise.all([
    getCourseTree(),
    getLessonStatuses(user!.id),
    getAnnouncements(),
  ]);

  const statusOf = (id: string): LessonStatus => statuses[id] ?? "not_started";

  // Resume = first non-complete lesson across all tracks.
  let resume: { href: string; title: string; track: string } | null = null;
  for (const t of tree) {
    for (const m of t.modules) {
      for (const l of m.lessons) {
        if (statusOf(l.id) !== "complete") {
          resume = {
            href: `/learn/${t.slug}/${m.slug}/${l.slug}`,
            title: l.title,
            track: `${t.title} · ${m.title}`,
          };
          break;
        }
      }
      if (resume) break;
    }
    if (resume) break;
  }

  // Aggregate stats.
  let complete = 0;
  let inProgress = 0;
  let totalChapters = 0;
  let coursesStarted = 0;
  for (const t of tree) {
    let trackTouched = false;
    for (const m of t.modules) {
      for (const l of m.lessons) {
        totalChapters++;
        const s = statusOf(l.id);
        if (s === "complete") complete++;
        else if (s === "reading" || s === "practicing") inProgress++;
        if (s !== "not_started") trackTouched = true;
      }
    }
    if (trackTouched) coursesStarted++;
  }

  const firstName =
    user?.profile?.full_name?.split(" ")[0] ||
    user?.email.split("@")[0] ||
    "there";

  return (
    <SiteShell footer={false}>
      {/* ---- Grid-backed hero: greeting + stats + resume ---- */}
      <section className="relative overflow-hidden border-b border-border bg-bg">
        <InteractiveGrid />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-bg" />
        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-10 sm:px-8">
          <div className="fade-up">
            <h1 className="text-[2.4rem] font-extrabold leading-[1.05] tracking-tight text-tprimary">
              Welcome back,{" "}
              <span className="marker-blue">{firstName}</span>
            </h1>
            <p className="mt-2.5 text-[15px] text-tmuted">
              {complete > 0
                ? `${complete} chapter${complete === 1 ? "" : "s"} down. Let's keep the streak going.`
                : "Your first chapter is one click away. Let's get started."}
            </p>
          </div>

          {/* Resume — the standout */}
          {resume && (
            <Link
              href={resume.href}
              className="card-pop shimmer-border group mt-7 flex items-center justify-between gap-4 overflow-hidden"
              style={
                {
                  "--accent": "var(--color-gold)",
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--color-gold) 14%, var(--color-surface)), var(--color-surface))",
                } as React.CSSProperties
              }
            >
              <div className="flex items-center gap-5 px-5 py-4">
                <span className="hidden h-12 w-12 items-center justify-center rounded-xl bg-gold text-white shadow-accent sm:flex">
                  <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                    Continue where you left off
                  </div>
                  <div className="mt-1 truncate text-[1.35rem] font-extrabold tracking-tight text-tprimary">
                    {resume.title}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-tmuted">{resume.track}</div>
                </div>
              </div>
              <span className="mr-5 hidden shrink-0 items-center gap-1.5 rounded-xl bg-gold px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-accent transition-transform group-hover:translate-x-0.5 sm:flex">
                Resume
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          )}

          {/* Stat strip — glassy tiles over the grid */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<CheckCircle className="h-5 w-5" />} value={complete} label="Chapters complete" tint="var(--color-green)" />
            <StatCard icon={<Clock className="h-5 w-5" />} value={inProgress} label="In progress" tint="var(--color-yellow)" />
            <StatCard icon={<Layers className="h-5 w-5" />} value={`${coursesStarted}/${tree.length}`} label="Courses started" tint="var(--color-gold)" />
            <StatCard icon={<Compass className="h-5 w-5" />} value={totalChapters} label="Chapters available" tint="var(--color-purple)" />
          </div>
        </div>
      </section>

      {/* ---- Body ---- */}
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        {/* Courses */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[1.4rem] font-extrabold tracking-tight text-tprimary">Your courses</h2>
            <div className="mt-1.5 h-1 w-10 rounded-full bg-gold" />
          </div>
          <Link href="/problems" className="inline-flex items-center gap-1 text-[13px] font-semibold text-gold hover:underline">
            Browse all problems →
          </Link>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {tree.map((t) => {
            const total = t.modules.reduce((a, m) => a + m.lessons.length, 0);
            const done = t.modules.reduce(
              (a, m) => a + m.lessons.filter((l) => statusOf(l.id) === "complete").length,
              0,
            );
            const pct = total ? Math.round((done / total) * 100) : 0;
            const theme = trackTheme(t.slug);
            const readiness: Record<Maturity, number> = {
              stable: 0,
              developing: 0,
              draft: 0,
            };
            for (const m of t.modules)
              for (const l of m.lessons)
                readiness[extractMeta(l.content).maturity]++;
            return (
              <Link
                key={t.id}
                href={`/learn/${t.slug}`}
                className="card-pop group flex flex-col overflow-hidden"
                style={
                  {
                    "--accent": theme.accent,
                    "--pop": `color-mix(in srgb, ${theme.banner} 20%, transparent)`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="flex flex-1 flex-col p-6"
                  style={{
                    background: `linear-gradient(180deg, color-mix(in srgb, ${theme.banner} 9%, var(--color-surface)), color-mix(in srgb, ${theme.banner} 3%, var(--color-surface)))`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <ProgressRing value={done} total={total} size={64} stroke={6} color={theme.banner} />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: theme.banner }}>
                        {theme.tag}
                      </div>
                      <div className="mt-0.5 truncate text-[17px] font-extrabold tracking-tight text-tprimary">
                        {t.title}
                      </div>
                    </div>
                    <ArrowRight
                      className="ml-auto h-[18px] w-[18px] shrink-0 -translate-x-1.5 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      style={{ color: theme.banner }}
                    />
                  </div>
                  <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--color-border-strong) 60%, transparent)" }}>
                    <div className="progress-fill h-full rounded-full" style={{ width: `${pct}%`, background: theme.banner }} />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[12.5px] text-tmuted">
                    <span>{done} of {total} chapters</span>
                    <span className="font-semibold" style={{ color: theme.banner }}>{pct}%</span>
                  </div>
                  {total > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/70 pt-3 text-[11.5px] text-tmuted">
                      {MATURITY_OPTIONS.map((mk) =>
                        readiness[mk] > 0 ? (
                          <span key={mk} className="inline-flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: MATURITY_META[mk].color }}
                            />
                            {readiness[mk]} {MATURITY_META[mk].label}
                          </span>
                        ) : null,
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Announcements */}
        <div className="mt-12 flex items-end justify-between">
          <div>
            <h2 className="text-[1.4rem] font-extrabold tracking-tight text-tprimary">Announcements</h2>
            <div className="mt-1.5 h-1 w-10 rounded-full bg-gold" />
          </div>
        </div>
        {announcements.length === 0 ? (
          <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-2 px-5 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/12 text-gold">
              <Compass className="h-5 w-5" />
            </span>
            <p className="mt-3 text-[14px] font-medium text-tmuted">No announcements yet</p>
            <p className="mt-0.5 text-[12.5px] text-tfaint">New updates from the SFMA team will show up here.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {announcements.map((a) => (
              <article key={a.id} className="card-pop px-5 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[16px] font-bold text-tprimary">{a.title}</h3>
                  <time className="shrink-0 text-[11.5px] text-tfaint">{formatDate(a.created_at)}</time>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-tmuted">{a.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}

function StatCard({
  icon,
  value,
  label,
  tint,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  tint: string;
}) {
  return (
    <div className="card-pop p-5">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-[10px]"
        style={{ background: `color-mix(in srgb, ${tint} 14%, transparent)`, color: tint }}
      >
        {icon}
      </span>
      <div className="mt-4 text-[2rem] font-extrabold leading-none tracking-[-0.02em] text-tprimary">
        {value}
      </div>
      <div className="mt-1.5 text-[12.5px] text-tmuted">{label}</div>
    </div>
  );
}
