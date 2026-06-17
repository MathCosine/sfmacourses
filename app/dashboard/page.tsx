import Link from "next/link";
import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { ProgressRing } from "@/components/ProgressRing";
import {
  getAnnouncements,
  getLessonStatuses,
  getNavTree,
  getSessionUser,
} from "@/lib/data";
import { trackTheme } from "@/lib/trackTheme";
import { formatDate } from "@/lib/utils";
import type { LessonStatus } from "@/lib/types";
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
    getNavTree(),
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
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <div className="fade-up">
          <h1 className="text-[2.3rem] font-extrabold tracking-tight text-tprimary">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1.5 text-[15px] text-tmuted">
            Here's where you stand. Pick up right where you left off.
          </p>
        </div>

        {/* Stat strip */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<CheckCircle className="h-5 w-5" />} value={complete} label="Chapters complete" tint="var(--color-green)" />
          <StatCard icon={<Clock className="h-5 w-5" />} value={inProgress} label="In progress" tint="var(--color-yellow)" />
          <StatCard icon={<Layers className="h-5 w-5" />} value={`${coursesStarted}/${tree.length}`} label="Courses started" tint="var(--color-gold)" />
          <StatCard icon={<Compass className="h-5 w-5" />} value={totalChapters} label="Chapters available" tint="var(--color-purple)" />
        </div>

        {/* Continue */}
        {resume && (
          <Link
            href={resume.href}
            className="group hover-lift mt-6 flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-sm"
          >
            <div className="flex items-center gap-5 px-5 py-4">
              <span className="hidden h-12 w-12 items-center justify-center rounded-xl bg-gold/12 text-gold sm:flex">
                <ArrowRight className="h-6 w-6" />
              </span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                  Continue where you left off
                </div>
                <div className="mt-1 text-[1.35rem] font-extrabold tracking-tight text-tprimary">
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

        {/* Courses */}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-[1.4rem] font-extrabold tracking-tight text-tprimary">Your courses</h2>
          <Link href="/problems" className="text-[13px] font-semibold text-gold hover:underline">
            Browse all problems →
          </Link>
        </div>
        <div className="mt-4 grid gap-5 lg:grid-cols-3">
          {tree.map((t) => {
            const total = t.modules.reduce((a, m) => a + m.lessons.length, 0);
            const done = t.modules.reduce(
              (a, m) => a + m.lessons.filter((l) => statusOf(l.id) === "complete").length,
              0,
            );
            const pct = total ? Math.round((done / total) * 100) : 0;
            const theme = trackTheme(t.slug);
            return (
              <Link
                key={t.id}
                href={`/learn/${t.slug}`}
                className="card hover-lift flex flex-col rounded-2xl p-6"
              >
                <div className="flex items-center gap-4">
                  <ProgressRing value={done} total={total} size={64} stroke={6} />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: theme.banner }}>
                      {theme.tag}
                    </div>
                    <div className="mt-0.5 truncate text-[17px] font-extrabold tracking-tight text-tprimary">
                      {t.title}
                    </div>
                  </div>
                </div>
                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div className="progress-fill h-full rounded-full" style={{ width: `${pct}%`, background: theme.banner }} />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[12.5px] text-tmuted">
                  <span>{done} of {total} chapters</span>
                  <span className="font-semibold">{pct}%</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Announcements */}
        <h2 className="mt-10 text-[1.4rem] font-extrabold tracking-tight text-tprimary">Announcements</h2>
        {announcements.length === 0 ? (
          <div className="card mt-4 rounded-2xl px-5 py-8 text-center text-[14px] text-tfaint">
            No announcements yet — check back soon.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {announcements.map((a) => (
              <article key={a.id} className="card rounded-2xl px-5 py-4">
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
    <div className="card rounded-2xl p-5">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `color-mix(in srgb, ${tint} 14%, transparent)`, color: tint }}
      >
        {icon}
      </span>
      <div className="mt-3.5 text-[1.8rem] font-extrabold leading-none tracking-tight text-tprimary">
        {value}
      </div>
      <div className="mt-1 text-[12.5px] text-tmuted">{label}</div>
    </div>
  );
}
