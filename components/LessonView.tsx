"use client";

import type { PreparedBlock } from "@/lib/prepare";
import type { LessonStatus, ProblemStatus } from "@/lib/types";
import { TextBlock } from "@/components/blocks/TextBlock";
import { ResourceBlock } from "@/components/blocks/ResourceBlock";
import { ProblemBlock } from "@/components/blocks/ProblemBlock";
import { VideoBlock } from "@/components/blocks/VideoBlock";
import { SectionBlock } from "@/components/blocks/SectionBlock";
import { CalloutBlock } from "@/components/blocks/CalloutBlock";
import { LessonStatusControl } from "@/components/LessonStatusControl";

interface LessonViewProps {
  articleId: string;
  blocks: PreparedBlock[];
  lessonId: string;
  lessonStatus: LessonStatus;
  problemStatuses: Record<number, ProblemStatus>;
  sectionStatuses: Record<number, LessonStatus>;
}

export function LessonView({
  articleId,
  blocks,
  lessonId,
  lessonStatus,
  problemStatuses,
  sectionStatuses,
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
            case "video":
              return <VideoBlock key={i} block={block.block} />;
            case "callout":
              return <CalloutBlock key={i} block={block.prepared} />;
            case "section":
              return (
                <SectionBlock
                  key={i}
                  id={block.id}
                  title={block.title}
                  lessonId={lessonId}
                  sectionIndex={block.sectionIndex}
                  initialStatus={
                    sectionStatuses[block.sectionIndex] ?? "not_started"
                  }
                />
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
