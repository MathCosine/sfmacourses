import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { LessonView } from "@/components/LessonView";
import { LessonStatusControl } from "@/components/LessonStatusControl";
import { TableOfContents } from "@/components/TableOfContents";
import {
  getLessonContext,
  getLessonStatus,
  getSessionUser,
  getProblemStatuses,
  getSectionStatuses,
} from "@/lib/data";
import { prepareBlocks } from "@/lib/prepare";
import {
  contentBlocks,
  countProblems,
  extractMeta,
} from "@/lib/utils";
import { FREQUENCY_LABELS, FREQUENCY_DOTS } from "@/lib/types";
import { ArrowLeft, ArrowRight } from "@/components/icons";

interface Params {
  track: string;
  module: string;
  lesson: string;
}

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
  const [prepared, lessonStatus, problemStatuses, sectionStatuses] =
    await Promise.all([
      prepareBlocks(blocks),
      getLessonStatus(userId, ctx.lesson.id),
      getProblemStatuses(userId, ctx.lesson.id),
      getSectionStatuses(userId, ctx.lesson.id),
    ]);
  const problemCount = countProblems(ctx.lesson.content);
  const dots = FREQUENCY_DOTS[meta.frequency];

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
          {/* Prev / Next + edit */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link
              href={`/learn/${ctx.track.slug}`}
              className="text-[12.5px] text-tmuted transition-colors hover:text-gold"
            >
              {ctx.track.title}
            </Link>
            <div className="flex items-center gap-2">
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

          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-tmuted">
            <span>{ctx.track.title}</span>
            <span className="text-tfaint">/</span>
            <span>{ctx.module.title}</span>
            <span className="text-tfaint">/</span>
            <span className="text-tprimary">{ctx.lesson.title}</span>
          </div>

          {/* Frequency + count */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gold">
              <span className="tracking-tight">{"●".repeat(dots)}</span>
              {FREQUENCY_LABELS[meta.frequency]}
            </span>
            {problemCount > 0 && (
              <span className="text-[12.5px] text-tmuted">
                {problemCount} problem{problemCount === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {/* Title + status */}
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl leading-tight text-tprimary sm:text-[2.6rem]">
                {ctx.lesson.title}
              </h1>
              <p className="mt-2 text-[13px] text-tmuted">
                Written by {meta.author}
              </p>
            </div>
            <div className="shrink-0 pt-1">
              <LessonStatusControl
                lessonId={ctx.lesson.id}
                initial={lessonStatus}
              />
            </div>
          </div>

          <div className="mt-7">
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
              <Link
                href={prevHref}
                className="group card hover-lift rounded-2xl px-4.5 py-3.5 hover:border-gold/40"
              >
                <div className="text-[11px] uppercase tracking-wide text-tfaint">
                  ← Previous
                </div>
                <div className="mt-0.5 text-[14px] font-medium text-tprimary">
                  {ctx.prev!.title}
                </div>
              </Link>
            ) : (
              <span />
            )}
            {nextHref && (
              <Link
                href={nextHref}
                className="group card hover-lift rounded-2xl px-4.5 py-3.5 text-right hover:border-gold/40"
              >
                <div className="text-[11px] uppercase tracking-wide text-tfaint">
                  Next →
                </div>
                <div className="mt-0.5 text-[14px] font-medium text-tprimary">
                  {ctx.next!.title}
                </div>
              </Link>
            )}
          </div>
        </article>

        {/* Right TOC */}
        <aside className="hidden w-[220px] shrink-0 xl:block">
          <div className="sticky top-8">
            <TableOfContents articleId="lesson-article" />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function NavArrow({
  href,
  dir,
}: {
  href: string | null;
  dir: "prev" | "next";
}) {
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  if (!href) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-tfaint opacity-40">
        <Icon className="h-4 w-4" />
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-tmuted transition-colors hover:border-gold/50 hover:text-gold"
    >
      <Icon className="h-4 w-4" />
    </Link>
  );
}
