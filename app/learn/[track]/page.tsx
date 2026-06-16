import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ProgressRing";
import {
  getCompletedLessonIds,
  getNavTree,
  getSessionUser,
} from "@/lib/data";
import { extractMeta } from "@/lib/utils";
import { FREQUENCY_DOTS } from "@/lib/types";
import { Check } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  const tree = await getNavTree();
  const t = tree.find((x) => x.slug === track);
  return { title: t?.title ?? "Track" };
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

  const completed = await getCompletedLessonIds(user!.id);
  const totalLessons = t.modules.reduce((a, m) => a + m.lessons.length, 0);
  const doneLessons = t.modules.reduce(
    (a, m) => a + m.lessons.filter((l) => completed.has(l.id)).length,
    0,
  );

  return (
    <AppShell activeTrackSlug={t.slug}>
      <div className="mx-auto max-w-[860px] px-6 py-10 sm:px-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gold">
              Track
            </div>
            <h1 className="mt-1.5 font-serif text-4xl text-tprimary">
              {t.title}
            </h1>
            {t.description && (
              <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-tmuted">
                {t.description}
              </p>
            )}
          </div>
          <ProgressRing value={doneLessons} total={totalLessons} size={64} />
        </div>

        <div className="mt-9 space-y-5">
          {t.modules.map((m) => {
            const mDone = m.lessons.filter((l) => completed.has(l.id)).length;
            return (
              <section
                key={m.id}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-center justify-between gap-3">
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

                <ul className="mt-3.5 divide-y divide-border border-t border-border">
                  {m.lessons.map((l) => {
                    const isDone = completed.has(l.id);
                    const meta = extractMeta(l.content);
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/learn/${t.slug}/${m.slug}/${l.slug}`}
                          className="group flex items-center gap-3 py-2.5 transition-colors"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              isDone
                                ? "border-gold bg-gold text-bg"
                                : "border-tfaint"
                            }`}
                          >
                            {isDone && <Check className="h-2.5 w-2.5" />}
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
                      No lessons yet.
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
