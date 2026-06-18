import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { FrequencyDots } from "@/components/FrequencyDots";
import { getLessonStatuses, getCourseTree, getSessionUser } from "@/lib/data";
import { extractMeta, countProblems } from "@/lib/utils";
import { trackTheme } from "@/lib/trackTheme";
import type { LessonStatus } from "@/lib/types";
import { statusMeta } from "@/lib/status";
import { Check, ArrowRight } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  const tree = await getCourseTree();
  return { title: tree.find((x) => x.slug === track)?.title ?? "Course" };
}

function CountStat({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-[20px] font-extrabold"
        style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
      >
        {count}
      </div>
      <div className="text-[10.5px] font-bold uppercase tracking-wide text-tmuted">{label}</div>
    </div>
  );
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const [tree, user] = await Promise.all([getCourseTree(), getSessionUser()]);
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
    <SiteShell footer={false}>
      {/* Banner */}
      <div className="relative overflow-hidden text-white" style={{ background: theme.gradient }}>
        <div className="dot-grid absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-4xl px-6 py-14 sm:px-10">
          <Link href="/dashboard" className="text-[12.5px] font-medium text-white/75 transition-colors hover:text-white">
            ← Dashboard
          </Link>
          <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">{theme.tag}</div>
          <h1 className="mt-1.5 text-[2.6rem] font-extrabold leading-tight tracking-tight sm:text-[3.1rem]">
            {t.title}
          </h1>
          {t.description && (
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/85">{t.description}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 pb-16 sm:px-10">
        {/* Progress summary */}
        <div className="card fade-up -mt-10 rounded-2xl p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-tprimary">Course progress</h2>
            <span className="text-[12.5px] font-semibold text-tmuted">{pct}% complete</span>
          </div>
          <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-border">
            <div className="progress-fill h-full rounded-full" style={{ width: `${pct}%`, background: theme.banner }} />
          </div>
          <div className="flex items-center justify-around">
            <CountStat count={counts.complete} label="Completed" color="#15a34a" />
            <CountStat count={counts.inProgress} label="In Progress" color="#d97706" />
            <CountStat count={counts.skipped} label="Skipped" color="#7c3aed" />
            <CountStat count={counts.notStarted} label="Not Started" color="#94a0b3" />
          </div>
        </div>

        {/* Units → chapters */}
        <div className="mt-10 space-y-9">
          {t.modules.map((m, mi) => {
            const unitDone = m.lessons.filter((l) => statusOf(l.id) === "complete").length;
            return (
              <section key={m.id}>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold text-white"
                      style={{ background: theme.banner }}
                    >
                      {mi + 1}
                    </span>
                    <div>
                      <h2 className="text-[1.3rem] font-extrabold tracking-tight text-tprimary">{m.title}</h2>
                      {m.description && <p className="text-[13px] text-tmuted">{m.description}</p>}
                    </div>
                  </div>
                  <span className="shrink-0 text-[12px] font-semibold text-tmuted">
                    {unitDone}/{m.lessons.length}
                  </span>
                </div>

                <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                  {m.lessons.map((l) => {
                    const s = statusOf(l.id);
                    const sm = statusMeta(s);
                    const filled = s !== "not_started";
                    const meta = extractMeta(l.content);
                    const problems = countProblems(l.content);
                    return (
                      <Link
                        key={l.id}
                        href={`/learn/${t.slug}/${m.slug}/${l.slug}`}
                        className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-bg"
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                          style={{
                            borderColor: filled ? sm.color : "var(--color-border-strong)",
                            background: filled ? sm.color : "transparent",
                          }}
                        >
                          {s === "complete" && <Check className="h-3 w-3 text-white" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[14.5px] font-semibold text-tprimary group-hover:text-gold">
                            {l.title}
                          </div>
                          <div className="mt-0.5 flex items-center gap-3">
                            <FrequencyDots frequency={meta.frequency} />
                            {problems > 0 && (
                              <span className="text-[12px] text-tfaint">{problems} problem{problems === 1 ? "" : "s"}</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-tfaint transition-all group-hover:translate-x-0.5 group-hover:text-gold" />
                      </Link>
                    );
                  })}
                  {m.lessons.length === 0 && (
                    <div className="px-4 py-3.5 text-[13px] text-tfaint">No chapters yet.</div>
                  )}
                </div>
              </section>
            );
          })}
          {t.modules.length === 0 && (
            <p className="text-[14px] text-tfaint">
              This course is under construction — chapters coming soon.
            </p>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
