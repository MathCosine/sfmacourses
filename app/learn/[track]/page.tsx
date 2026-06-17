import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { FrequencyDots } from "@/components/FrequencyDots";
import { getLessonStatuses, getNavTree, getSessionUser } from "@/lib/data";
import { extractMeta } from "@/lib/utils";
import { trackTheme } from "@/lib/trackTheme";
import type { LessonStatus } from "@/lib/types";
import { statusMeta } from "@/lib/status";
import { Check } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  const tree = await getNavTree();
  return { title: tree.find((x) => x.slug === track)?.title ?? "Course" };
}

function CountStat({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-[20px] font-extrabold"
        style={{ background: `${color}1a`, color }}
      >
        {count}
      </div>
      <div className="text-[10.5px] font-bold uppercase tracking-wide text-tmuted">
        {label}
      </div>
    </div>
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

  const statuses = user ? await getLessonStatuses(user.id) : {};
  const statusOf = (id: string): LessonStatus => statuses[id] ?? "not_started";
  const theme = trackTheme(t.slug);

  const allLessons = t.modules.flatMap((m) => m.lessons);
  const total = allLessons.length;
  const counts = { complete: 0, inProgress: 0, skipped: 0, notStarted: 0 };
  for (const l of allLessons) {
    const s = statusOf(l.id);
    if (s === "complete") counts.complete++;
    else if (s === "reading" || s === "practicing") counts.inProgress++;
    else if (s === "skipped" || s === "ignored") counts.skipped++;
    else counts.notStarted++;
  }
  const pct = total ? Math.round((counts.complete / total) * 100) : 0;

  return (
    <AppShell activeTrackSlug={t.slug}>
      {/* Colored banner */}
      <div className="text-white" style={{ background: theme.banner }}>
        <div className="mx-auto max-w-[820px] px-6 py-12 text-center sm:px-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
            {theme.tag}
          </div>
          <h1 className="mt-2 text-[2.75rem] font-extrabold leading-tight tracking-tight sm:text-[3.25rem]">
            {t.title}
          </h1>
          {t.description && (
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/85">
              {t.description}
            </p>
          )}
        </div>
      </div>

      <div className="fade-up mx-auto max-w-[820px] px-6 py-8 sm:px-10">
        {/* Progress summary card */}
        <div className="card -mt-16 rounded-xl p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-tprimary">
              Chapters Progress
            </h2>
            <span className="text-[12.5px] font-semibold text-tmuted">
              {pct}% complete
            </span>
          </div>
          <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="progress-fill h-full rounded-full"
              style={{ width: `${pct}%`, background: theme.banner }}
            />
          </div>
          <div className="flex items-center justify-around">
            <CountStat count={counts.complete} label="Completed" color="#15a34a" />
            <CountStat count={counts.inProgress} label="In Progress" color="#d97706" />
            <CountStat count={counts.skipped} label="Skipped" color="#2563eb" />
            <CountStat count={counts.notStarted} label="Not Started" color="#9aa3b2" />
          </div>
        </div>

        {/* Timeline of units → chapters */}
        <div className="mt-10">
          {t.modules.map((m) => (
            <section key={m.id} className="relative pl-8">
              {/* vertical line */}
              <span className="absolute left-[7px] top-2 bottom-0 w-px bg-border" />
              {/* node */}
              <span
                className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-surface"
                style={{ borderColor: theme.banner }}
              />
              <div className="pb-8">
                <h2 className="text-[1.35rem] font-extrabold tracking-tight text-tprimary">
                  {m.title}
                </h2>
                {m.description && (
                  <p className="mt-0.5 text-[13.5px] text-tmuted">
                    {m.description}
                  </p>
                )}

                <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                  {m.lessons.map((l) => {
                    const s = statusOf(l.id);
                    const sm = statusMeta(s);
                    const filled = s !== "not_started";
                    const meta = extractMeta(l.content);
                    return (
                      <Link
                        key={l.id}
                        href={`/learn/${t.slug}/${m.slug}/${l.slug}`}
                        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg"
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
                        <div className="min-w-0 flex-1">
                          <div className="text-[14.5px] font-semibold text-tprimary group-hover:text-gold">
                            {l.title}
                          </div>
                          <div className="mt-0.5">
                            <FrequencyDots frequency={meta.frequency} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {m.lessons.length === 0 && (
                    <div className="px-4 py-3 text-[13px] text-tfaint">
                      No chapters yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
          {t.modules.length === 0 && (
            <p className="text-[14px] text-tfaint">
              This course is under construction — chapters coming soon.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
