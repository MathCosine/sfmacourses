import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ProgressRing";
import {
  getAnnouncements,
  getCompletedLessonIds,
  getNavTree,
  getSessionUser,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getSessionUser();
  const [tree, completed, announcements] = await Promise.all([
    getNavTree(),
    getCompletedLessonIds(user!.id),
    getAnnouncements(),
  ]);

  // First incomplete lesson across all tracks = "continue where you left off".
  let resume: { href: string; title: string; track: string } | null = null;
  for (const t of tree) {
    for (const m of t.modules) {
      for (const l of m.lessons) {
        if (!completed.has(l.id)) {
          resume = {
            href: `/learn/${t.slug}/${m.slug}/${l.slug}`,
            title: l.title,
            track: t.title,
          };
          break;
        }
      }
      if (resume) break;
    }
    if (resume) break;
  }

  const firstName =
    user?.profile?.full_name?.split(" ")[0] ||
    user?.email.split("@")[0] ||
    "there";

  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-6 py-10 sm:px-10">
        <h1 className="font-serif text-4xl text-tprimary">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1.5 text-[14.5px] text-tmuted">
          Track your progress and pick up where you left off.
        </p>

        {/* Continue */}
        {resume && (
          <Link
            href={resume.href}
            className="group mt-7 flex items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/10 to-transparent px-6 py-5 transition-colors hover:border-gold"
          >
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                Continue where you left off
              </div>
              <div className="mt-1 font-serif text-xl text-tprimary">
                {resume.title}
              </div>
              <div className="text-[12.5px] text-tmuted">{resume.track}</div>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-bg transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-5 w-5" />
            </span>
          </Link>
        )}

        {/* Progress cards */}
        <h2 className="mt-10 mb-3 font-serif text-2xl text-tprimary">
          Your Tracks
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {tree.map((t) => {
            const total = t.modules.reduce((a, m) => a + m.lessons.length, 0);
            const done = t.modules.reduce(
              (a, m) =>
                a + m.lessons.filter((l) => completed.has(l.id)).length,
              0,
            );
            return (
              <Link
                key={t.id}
                href={`/learn/${t.slug}`}
                className="flex flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center transition-colors hover:border-gold/50"
              >
                <ProgressRing value={done} total={total} size={72} stroke={6} />
                <div className="mt-3.5 font-serif text-lg text-tprimary">
                  {t.title}
                </div>
                <div className="mt-0.5 text-[12.5px] text-tmuted">
                  {done} of {total} lessons
                </div>
              </Link>
            );
          })}
        </div>

        {/* Announcements */}
        <h2 className="mt-10 mb-3 font-serif text-2xl text-tprimary">
          Announcements
        </h2>
        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-5 py-6 text-[14px] text-tfaint">
            No announcements yet.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <article
                key={a.id}
                className="rounded-2xl border border-border bg-surface px-5 py-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-lg text-tprimary">
                    {a.title}
                  </h3>
                  <time className="shrink-0 text-[11.5px] text-tfaint">
                    {formatDate(a.created_at)}
                  </time>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-tmuted">
                  {a.body}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
