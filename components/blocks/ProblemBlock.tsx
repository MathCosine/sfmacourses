"use client";

import { useState, useTransition } from "react";
import type { Difficulty } from "@/lib/types";
import { setProblemSolved } from "@/app/learn/actions";
import { cn } from "@/lib/utils";
import { ChevronRight, Check } from "@/components/icons";

export interface PreparedProblem {
  title: string;
  source: string;
  difficulty: Difficulty;
  statementHtml: string;
  hintHtml?: string;
  solutionHtml?: string;
}

const DIFFICULTY_STYLE: Record<Difficulty, { color: string; bg: string }> = {
  Easy: { color: "#22c55e", bg: "rgba(34,197,94,0.13)" },
  Medium: { color: "#f0a500", bg: "rgba(240,165,0,0.13)" },
  Hard: { color: "#f7bc35", bg: "rgba(247,188,53,0.14)" },
  "Very Hard": { color: "#e0566b", bg: "rgba(224,86,107,0.13)" },
};

interface ProblemBlockProps {
  block: PreparedProblem;
  lessonId: string;
  problemIndex: number;
  initialSolved: boolean;
}

export function ProblemBlock({
  block,
  lessonId,
  problemIndex,
  initialSolved,
}: ProblemBlockProps) {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(initialSolved);
  const [, startTransition] = useTransition();

  const diff = DIFFICULTY_STYLE[block.difficulty] ?? DIFFICULTY_STYLE.Medium;

  function toggleSolved(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !solved;
    setSolved(next);
    startTransition(async () => {
      const res = await setProblemSolved(lessonId, problemIndex, next);
      if (!res.ok) setSolved(!next); // revert on failure
    });
  }

  return (
    <div
      className={cn(
        "my-4 overflow-hidden rounded-xl border bg-surface transition-colors",
        solved ? "border-green/40" : "border-border",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={toggleSolved}
          title={solved ? "Mark as unsolved" : "Mark as solved"}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
            solved
              ? "border-green bg-green text-bg"
              : "border-tfaint bg-transparent hover:border-gold",
          )}
        >
          {solved && <Check className="h-3.5 w-3.5" />}
        </button>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14.5px] font-semibold text-tprimary">
              {block.title}
            </div>
            <div className="truncate text-[12px] text-tmuted">
              {block.source}
            </div>
          </div>
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{ color: diff.color, background: diff.bg }}
          >
            {block.difficulty}
          </span>
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-tmuted transition-transform",
              open && "rotate-90",
            )}
          />
        </button>
      </div>

      {/* Body */}
      {open && (
        <div className="border-t border-border px-4 py-3.5">
          <div
            className="prose-sfma"
            dangerouslySetInnerHTML={{ __html: block.statementHtml }}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {block.hintHtml && (
              <button
                onClick={() => setShowHint((s) => !s)}
                className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-tmuted transition-colors hover:border-gold/50 hover:text-gold"
              >
                {showHint ? "Hide Hint" : "Show Hint"}
              </button>
            )}
            {block.solutionHtml && (
              <button
                onClick={() => setShowSolution((s) => !s)}
                className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-tmuted transition-colors hover:border-gold/50 hover:text-gold"
              >
                {showSolution ? "Hide Solution" : "Show Solution"}
              </button>
            )}
          </div>

          {showHint && block.hintHtml && (
            <div className="mt-3 rounded-lg border border-border bg-bg/40 px-3.5 py-2.5">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gold">
                Hint
              </div>
              <div
                className="prose-sfma"
                dangerouslySetInnerHTML={{ __html: block.hintHtml }}
              />
            </div>
          )}

          {showSolution && block.solutionHtml && (
            <div className="mt-3 rounded-lg border border-border bg-bg/40 px-3.5 py-2.5">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-green">
                Solution
              </div>
              <div
                className="prose-sfma"
                dangerouslySetInnerHTML={{ __html: block.solutionHtml }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
