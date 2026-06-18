import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { ProblemWorkspace } from "@/components/ProblemWorkspace";
import {
  getProblemView,
  getProblemStatuses,
  getSessionUser,
} from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";

interface Params {
  lessonId: string;
  index: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lessonId, index } = await params;
  const view = await getProblemView(lessonId, Number(index));
  return { title: view ? view.problem.title : "Problem" };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lessonId, index } = await params;
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0) notFound();

  const view = await getProblemView(lessonId, idx);
  if (!view) notFound();

  const user = await getSessionUser();
  if (!user) redirect(`/auth?redirect=/problems/${lessonId}/${idx}`);

  const statuses = await getProblemStatuses(user.id, lessonId);

  const [statementHtml, hintHtml, solutionHtml] = await Promise.all([
    renderMarkdown(view.problem.statement),
    view.problem.hint ? renderMarkdown(view.problem.hint) : Promise.resolve(""),
    view.problem.solution
      ? renderMarkdown(view.problem.solution)
      : Promise.resolve(""),
  ]);

  return (
    <SiteShell>
      <ProblemWorkspace
        lessonId={lessonId}
        problemIndex={idx}
        title={view.problem.title}
        source={view.problem.source}
        difficulty={view.problem.difficulty}
        statementHtml={statementHtml}
        hintHtml={hintHtml}
        solutionHtml={solutionHtml}
        initialStatus={statuses[idx] ?? "not_started"}
        location={view.location}
        author={view.lessonAuthor}
        lessonTitle={view.lessonTitle}
        prev={view.prev}
        next={view.next}
        total={view.total}
      />
    </SiteShell>
  );
}
