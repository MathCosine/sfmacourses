import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { LessonView } from "@/components/LessonView";
import { LessonStatusControl } from "@/components/LessonStatusControl";
import { TableOfContents } from "@/components/TableOfContents";
import { FrequencyDots } from "@/components/FrequencyDots";
import { MaturityBadge } from "@/components/MaturityBadge";
import { MATURITY_META } from "@/lib/maturity";
import { Prerequisites } from "@/components/Prerequisites";
import {
  getLessonContext,
  getLessonStatus,
  getSessionUser,
  getProblemStatuses,
  getSectionStatuses,
  getLessonLinksByIds,
} from "@/lib/data";
import { prepareBlocks } from "@/lib/prepare";
import { renderMarkdown } from "@/lib/markdown";
import { contentBlocks, countProblems, extractMeta } from "@/lib/utils";
import { FREQUENCY_LABELS } from "@/lib/types";
import { ArrowLeft, ArrowRight, ListChecks, Pencil } from "@/components/icons";

interface Params {
  track: string;
  module: string;
  lesson: string;
}

const FREQUENCY_BLURB: Record<string, string> = {
  essential: "Core material — make sure you master this.",
  important: "Frequently useful; worth a solid look.",
  supplemental: "Nice to know; revisit as needed.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { track, module, lesson } = await params;
  const ctx = await getLessonContext(track, module, lesson);
  return { title: ctx?.lesson.title ?? "Lesson" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { track, module, lesson } = await params;
  const ctx = await getLessonContext(track, module, lesson);
  if (!ctx) notFound();

  const user = await getSessionUser();
  if (!user) redirect("/auth");
  const userId = user.id;
  const isStaff = user.isStaff;

  const meta = extractMeta(ctx.lesson.content);
  const blocks = contentBlocks(ctx.lesson.content);
  const [
    prepared,
    lessonStatus,
    problemStatuses,
    sectionStatuses,
    prereqNoteHtml,
    prereqLinks,
  ] = await Promise.all([
    prepareBlocks(blocks),
    getLessonStatus(userId, ctx.lesson.id),
    getProblemStatuses(userId, ctx.lesson.id),
    getSectionStatuses(userId, ctx.lesson.id),
    meta.prereqNote ? renderMarkdown(meta.prereqNote) : Promise.resolve(""),
    getLessonLinksByIds(meta.prereqLessonIds),
  ]);
  const problemCount = countProblems(ctx.lesson.content);

  const prevHref = ctx.prev
    ? `/learn/${ctx.prev.track}/${ctx.prev.module}/${ctx.prev.lesson}`
    : null;
  const nextHref = ctx.next
    ? `/learn/${ctx.next.track}/${ctx.next.module}/${ctx.next.lesson}`
    : null;

  return (
    <AppShell activeTrackSlug={ctx.track.slug} activeLessonId={ctx.lesson.id}>
      <div className="mx-auto flex max-w-[1180px] gap-10 px-6 py-8 sm:px-10">
        <article className="min-w-0 max-w-[760px] flex-1">
          {/* Breadcrumb + nav */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[12.5px] text-tmuted">
              <Link href={`/learn/${ctx.track.slug}`} className="shrink-0 transition-colors hover:text-gold">
                {ctx.track.title}
              </Link>
              <span className="text-tfaint">/</span>
              <span className="truncate">{ctx.module.title}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isStaff && (
                <Link
                  href={`/admin?lesson=${ctx.lesson.id}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-tmuted transition-colors hover:border-gold/50 hover:text-gold"
                >
                  Edit
                </Link>
              )}
              <NavArrow href={prevHref} dir="prev" />
              <NavArrow href={nextHref} dir="next" />
            </div>
          </div>

          {/* Title + status */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <MaturityBadge maturity={meta.maturity} className="mb-2" />
              <h1 className="text-[2.4rem] font-extrabold leading-tight tracking-tight text-tprimary">
                {ctx.lesson.title}
              </h1>
            </div>
            <div className="shrink-0 pt-1">
              <LessonStatusControl lessonId={ctx.lesson.id} initial={lessonStatus} />
            </div>
          </div>

          {/* Heads-up banner for chapters that aren't finished */}
          {meta.maturity !== "stable" && (
            <div
              className="mt-4 flex items-start gap-3 rounded-xl border px-4 py-3"
              style={{
                borderColor: `color-mix(in srgb, ${MATURITY_META[meta.maturity].color} 35%, transparent)`,
                background: `color-mix(in srgb, ${MATURITY_META[meta.maturity].color} 8%, transparent)`,
              }}
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ background: MATURITY_META[meta.maturity].color }}
              />
              <div>
                <div
                  className="text-[13.5px] font-bold"
                  style={{ color: MATURITY_META[meta.maturity].color }}
                >
                  {meta.maturity === "draft"
                    ? "Draft chapter"
                    : "Chapter in progress"}
                </div>
                <p className="mt-0.5 text-[13px] leading-snug text-tmuted">
                  {MATURITY_META[meta.maturity].desc} Check back soon for the
                  finished version.
                </p>
              </div>
            </div>
          )}

          {/* Compact meta line — left-aligned, icon-led, no heavy box */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-tmuted">
            <span className="inline-flex items-center gap-2" title={FREQUENCY_BLURB[meta.frequency] ?? ""}>
              <FrequencyDots frequency={meta.frequency} />
              <span className="font-semibold text-tprimary">{FREQUENCY_LABELS[meta.frequency]}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="h-[18px] w-[18px] text-gold" />
              {problemCount} problem{problemCount === 1 ? "" : "s"}
            </span>
            <span>
              by <span className="font-medium text-tprimary">{meta.author}</span>
            </span>
            {isStaff && (
              <Link
                href={`/admin?lesson=${ctx.lesson.id}`}
                className="inline-flex items-center gap-1.5 font-medium text-gold hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit page
              </Link>
            )}
          </div>

          <Prerequisites noteHtml={prereqNoteHtml} links={prereqLinks} />

          <div className="mt-8">
            <LessonView
              articleId="lesson-article"
              blocks={prepared}
              lessonId={ctx.lesson.id}
              lessonStatus={lessonStatus}
              problemStatuses={problemStatuses}
              sectionStatuses={sectionStatuses}
            />
          </div>

          {/* Bottom prev/next */}
          <div className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
            {prevHref ? (
              <Link href={prevHref} className="group card hover-lift rounded-2xl px-5 py-4 hover:border-gold/40">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-tfaint">← Previous</div>
                <div className="mt-0.5 text-[14px] font-semibold text-tprimary group-hover:text-gold">{ctx.prev!.title}</div>
              </Link>
            ) : (
              <span />
            )}
            {nextHref && (
              <Link href={nextHref} className="group card hover-lift rounded-2xl px-5 py-4 text-right hover:border-gold/40">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-tfaint">Next →</div>
                <div className="mt-0.5 text-[14px] font-semibold text-tprimary group-hover:text-gold">{ctx.next!.title}</div>
              </Link>
            )}
          </div>
        </article>

        {/* Right TOC */}
        <aside className="hidden w-[220px] shrink-0 xl:block">
          <div className="sticky top-24">
            <TableOfContents articleId="lesson-article" />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function NavArrow({ href, dir }: { href: string | null; dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  if (!href) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-tfaint opacity-40">
        <Icon className="h-4 w-4" />
      </span>
    );
  }
  return (
    <Link href={href} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-tmuted transition-colors hover:border-gold/50 hover:text-gold">
      <Icon className="h-4 w-4" />
    </Link>
  );
}
