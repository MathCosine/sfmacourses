"use client";

import { useState, useTransition } from "react";
import type { Difficulty, ProblemStatus } from "@/lib/types";
import { setProblemStatus } from "@/app/learn/actions";
import { PROBLEM_STATUS_OPTIONS } from "@/lib/status";
import { cn, solutionLinkLabel } from "@/lib/utils";
import { ChevronRight, ExternalLink } from "@/components/icons";
import { StatusControl } from "@/components/StatusControl";

export interface PreparedProblem {
  title: string;
  source: string;
  difficulty: Difficulty;
  statementHtml: string;
  hintHtml?: string;
  solutionHtml?: string;
  solutionUrl?: string;
}

const DIFFICULTY_STYLE: Record<Difficulty, { color: string; bg: string }> = {
  Easy: { color: "#2f9e44", bg: "rgba(47,158,68,0.10)" },
  Medium: { color: "#1c7ed6", bg: "rgba(28,126,214,0.10)" },
  Hard: { color: "#e8590c", bg: "rgba(232,89,12,0.10)" },
  "Very Hard": { color: "#c92a2a", bg: "rgba(201,42,42,0.10)" },
};

interface ProblemBlockProps {
  block: PreparedProblem;
  lessonId: string;
  problemIndex: number;
  initialStatus: ProblemStatus;
}

export function ProblemBlock({
  block,
  lessonId,
  problemIndex,
  initialStatus,
}: ProblemBlockProps) {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [status, setStatus] = useState<ProblemStatus>(initialStatus);
  const [, startTransition] = useTransition();

  const diff = DIFFICULTY_STYLE[block.difficulty] ?? DIFFICULTY_STYLE.Medium;
  const done = status === "solved";

  function changeStatus(next: string) {
    const prev = status;
    setStatus(next as ProblemStatus);
    startTransition(async () => {
      const res = await setProblemStatus(
        lessonId,
        problemIndex,
        next as ProblemStatus,
      );
      if (!res.ok) setStatus(prev);
    });
  }

  return (
    <div
      className={cn(
        "my-2.5 overflow-hidden rounded-xl border bg-surface transition-colors",
        done ? "border-green/40" : "border-border",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <StatusControl
          value={status}
          options={PROBLEM_STATUS_OPTIONS}
          onChange={changeStatus}
          size={22}
        />

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
            {block.solutionUrl && (
              <a
                href={block.solutionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-green/40 bg-green/5 px-3 py-1.5 text-[12.5px] font-medium text-green transition-colors hover:bg-green/10"
              >
                Solution on {solutionLinkLabel(block.solutionUrl)}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {showHint && block.hintHtml && (
            <div className="mt-3 rounded-lg border border-border bg-bg px-3.5 py-3">
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
            <div className="mt-3 rounded-lg border border-border bg-bg px-3.5 py-3">
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
