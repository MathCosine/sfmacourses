"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PreparedBlock } from "@/lib/prepare";
import { TextBlock } from "@/components/blocks/TextBlock";
import { ResourceBlock } from "@/components/blocks/ResourceBlock";
import { ProblemBlock } from "@/components/blocks/ProblemBlock";
import { SectionDivider } from "@/components/blocks/SectionDivider";
import { setLessonComplete } from "@/app/learn/actions";
import { cn } from "@/lib/utils";
import { Check } from "@/components/icons";

interface LessonViewProps {
  articleId: string;
  blocks: PreparedBlock[];
  lessonId: string;
  solved: number[];
  initialComplete: boolean;
}

export function LessonView({
  articleId,
  blocks,
  lessonId,
  solved,
  initialComplete,
}: LessonViewProps) {
  const router = useRouter();
  const solvedSet = new Set(solved);
  const [complete, setComplete] = useState(initialComplete);
  const [pending, startTransition] = useTransition();

  function toggleComplete() {
    const next = !complete;
    setComplete(next);
    startTransition(async () => {
      const res = await setLessonComplete(lessonId, next);
      if (!res.ok) {
        setComplete(!next);
      } else {
        router.refresh();
      }
    });
  }

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
                  initialSolved={solvedSet.has(block.problemIndex)}
                />
              );
          }
        })}
      </div>

      {/* Mark complete */}
      <div className="mt-12 flex justify-center border-t border-border pt-8">
        <button
          onClick={toggleComplete}
          disabled={pending}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border px-6 py-3 text-[14px] font-semibold transition-all disabled:opacity-60",
            complete
              ? "border-green/50 bg-green/15 text-green"
              : "border-gold bg-gold text-bg hover:bg-gold-hover",
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full border",
              complete ? "border-green bg-green/20" : "border-bg/40",
            )}
          >
            {complete && <Check className="h-3.5 w-3.5" />}
          </span>
          {complete ? "Lesson Complete" : "Mark Lesson Complete"}
        </button>
      </div>
    </>
  );
}
