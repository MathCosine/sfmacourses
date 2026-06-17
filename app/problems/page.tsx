import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { ProblemsExplorer, type ProblemRow } from "@/components/ProblemsExplorer";
import { getAllProblemStatuses, getNavTree, getSessionUser } from "@/lib/data";
import { contentBlocks } from "@/lib/utils";
import type { ProblemStatus } from "@/lib/types";
import { ListChecks } from "@/components/icons";

export const metadata: Metadata = { title: "Problems" };

export default async function ProblemsPage() {
  const user = await getSessionUser();
  const [tree, statuses] = await Promise.all([
    getNavTree(),
    user ? getAllProblemStatuses(user.id) : Promise.resolve({} as Record<string, ProblemStatus>),
  ]);

  const rows: ProblemRow[] = [];
  for (const t of tree) {
    for (const m of t.modules) {
      for (const l of m.lessons) {
        let problemIndex = 0;
        for (const block of contentBlocks(l.content)) {
          if (block.type !== "problem") continue;
          const key = `${l.id}:${problemIndex}`;
          rows.push({
            key,
            lessonId: l.id,
            problemIndex,
            title: block.title,
            source: block.source,
            difficulty: block.difficulty,
            trackTitle: t.title,
            trackSlug: t.slug,
            unitTitle: m.title,
            lessonTitle: l.title,
            href: `/learn/${t.slug}/${m.slug}/${l.slug}`,
            status: statuses[key] ?? "not_started",
          });
          problemIndex++;
        }
      }
    }
  }

  const trackList = tree.map((t) => ({ slug: t.slug, title: t.title }));

  return (
    <SiteShell>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/12 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-gold">
            <ListChecks className="h-3.5 w-3.5" /> Problem Set
          </div>
          <h1 className="mt-3 text-[2.4rem] font-extrabold tracking-tight text-tprimary">All Problems</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-tmuted">
            Every practice problem across all courses in one place. Filter by
            difficulty, course, or status — and update your progress right from
            the table.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
        {rows.length === 0 ? (
          <div className="card rounded-2xl px-5 py-16 text-center text-[14px] text-tfaint">
            No problems have been published yet — check back soon.
          </div>
        ) : (
          <ProblemsExplorer problems={rows} tracks={trackList} />
        )}
      </div>
    </SiteShell>
  );
}
