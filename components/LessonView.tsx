"use client";

import type { PreparedBlock } from "@/lib/prepare";
import type { LessonStatus, ProblemStatus } from "@/lib/types";
import { TextBlock } from "@/components/blocks/TextBlock";
import { ResourceBlock } from "@/components/blocks/ResourceBlock";
import { ProblemBlock } from "@/components/blocks/ProblemBlock";
import { SectionDivider } from "@/components/blocks/SectionDivider";
import { LessonStatusControl } from "@/components/LessonStatusControl";

interface LessonViewProps {
  articleId: string;
  blocks: PreparedBlock[];
  lessonId: string;
  lessonStatus: LessonStatus;
  problemStatuses: Record<number, ProblemStatus>;
}

export function LessonView({
  articleId,
  blocks,
  lessonId,
  lessonStatus,
  problemStatuses,
}: LessonViewProps) {
  return (
    <>
      <div id={articleId} className="fade-up">
        {blocks.map((block, i) => {
          switch (block.kind) {
            case "text":
              return <TextBlock key={i} html={block.html} />;
            case "resource":
              return <ResourceBlock key={i} block={block.block} />;
            case "section":
              return (
                <SectionDivider key={i} id={block.id} title={block.title} />
              );
            case "problem":
              return (
                <ProblemBlock
                  key={i}
                  block={block.prepared}
                  lessonId={lessonId}
                  problemIndex={block.problemIndex}
                  initialStatus={
                    problemStatuses[block.problemIndex] ?? "not_started"
                  }
                />
              );
          }
        })}
      </div>

      {/* Bottom status control */}
      <div className="mt-12 flex flex-col items-center gap-3 border-t border-border pt-8">
        <p className="text-[13px] text-tmuted">
          Finished this chapter? Update your status:
        </p>
        <LessonStatusControl
          lessonId={lessonId}
          initial={lessonStatus}
          align="left"
        />
      </div>
    </>
  );
}
