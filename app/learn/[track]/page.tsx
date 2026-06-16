import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ProgressRing";
import { getLessonStatuses, getNavTree, getSessionUser } from "@/lib/data";
import { extractMeta } from "@/lib/utils";
import { FREQUENCY_DOTS, type LessonStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/status";
import { Check } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  const tree = await getNavTree();
  const t = tree.find((x) => x.slug === track);
  return { title: t?.title ?? "Course" };
}

function StatPill({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      <span className="font-semibold text-tprimary">{count}</span>
      <span>{label}</span>
    </span>
  );
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const [tree, user] = await Promise.all([getNavTree(), getSessionUser()]);
  const t = tree.find((x) => x.slug === track);
  if (!t) notFound();

  const statuses = await getLessonStatuses(user!.id);
  const statusOf = (id: string): LessonStatus => statuses[id] ?? "not_started";

  const allLessons = t.modules.flatMap((m) => m.lessons);
  const total = allLessons.length;
  const counts = {
    complete: 0,
    inProgress: 0,
    skipped: 0,
    notStarted: 0,
  };
  for (const l of allLessons) {
    const s = statusOf(l.id);
    if (s === "complete") counts.complete++;
    else if (s === "reading" || s === "practicing") counts.inProgress++;
    else if (s === "skipped" || s === "ignored") counts.skipped++;
    else counts.notStarted++;
  }

  return (
    <AppShell activeTrackSlug={t.slug}>
      <div className="fade-up mx-auto max-w-[840px] px-6 py-10 sm:px-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
          Course
        </div>
        <div className="mt-1.5 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-[2.5rem] leading-tight text-tprimary">
              {t.title}
            </h1>
            {t.description && (
              <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-tmuted">
                {t.description}
              </p>
            )}
          </div>
          <ProgressRing value={counts.complete} total={total} size={68} />
        </div>

        {/* Slim gradient progress bar */}
        <div className="mt-6">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/70">
            <div
              className="progress-fill h-full rounded-full"
              style={{
                width: `${total ? (counts.complete / total) * 100 : 0}%`,
                background: "linear-gradient(90deg, #2563eb, #16a34a)",
              }}
            />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-tmuted">
            <StatPill count={counts.complete} label="Completed" color="#16a34a" />
            <StatPill count={counts.inProgress} label="In Progress" color="#ca8a04" />
            <StatPill count={counts.skipped} label="Skipped" color="#2563eb" />
            <StatPill count={counts.notStarted} label="Not Started" color="#718096" />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {t.modules.map((m) => {
            const mDone = m.lessons.filter(
              (l) => statusOf(l.id) === "complete",
            ).length;
            return (
              <section
                key={m.id}
                className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
                  <div>
                    <h2 className="font-serif text-xl text-tprimary">
                      {m.title}
                    </h2>
                    {m.description && (
                      <p className="mt-0.5 text-[13px] text-tmuted">
                        {m.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[12.5px] font-medium text-tmuted">
                    {mDone}/{m.lessons.length}
                  </span>
                </div>

                <ul className="divide-y divide-border border-t border-border px-5">
                  {m.lessons.map((l) => {
                    const s = statusOf(l.id);
                    const sm = STATUS_META[s];
                    const filled = s !== "not_started";
                    const meta = extractMeta(l.content);
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/learn/${t.slug}/${m.slug}/${l.slug}`}
                          className="group flex items-center gap-3 py-2.5"
                        >
                          <span
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                            style={{
                              borderColor: filled ? sm.color : "#ccd0d8",
                              background: filled ? sm.color : "transparent",
                            }}
                          >
                            {s === "complete" && (
                              <Check className="h-2.5 w-2.5 text-white" />
                            )}
                          </span>
                          <span className="flex-1 text-[14px] text-tprimary transition-colors group-hover:text-gold">
                            {l.title}
                          </span>
                          <span className="text-[11px] tracking-tight text-gold">
                            {"●".repeat(FREQUENCY_DOTS[meta.frequency])}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                  {m.lessons.length === 0 && (
                    <li className="py-3 text-[13px] text-tfaint">
                      No chapters yet.
                    </li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
