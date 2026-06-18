"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Difficulty, ProblemStatus } from "@/lib/types";
import { setProblemStatus } from "@/app/learn/actions";
import { PROBLEM_STATUS_OPTIONS } from "@/lib/status";
import { StatusControl } from "@/components/StatusControl";
import { solutionLinkLabel } from "@/lib/utils";
import { ArrowLeft, ArrowRight, BookOpen, Lightbulb, CheckCircle, ExternalLink } from "@/components/icons";

const DIFFICULTY_STYLE: Record<Difficulty, { color: string; bg: string }> = {
  Easy: { color: "#2f9e44", bg: "rgba(47,158,68,0.12)" },
  Medium: { color: "#1c7ed6", bg: "rgba(28,126,214,0.12)" },
  Hard: { color: "#e8590c", bg: "rgba(232,89,12,0.12)" },
  "Very Hard": { color: "#c92a2a", bg: "rgba(201,42,42,0.12)" },
};

interface Props {
  lessonId: string;
  problemIndex: number;
  title: string;
  source: string;
  difficulty: Difficulty;
  statementHtml: string;
  hintHtml: string;
  solutionHtml: string;
  solutionUrl?: string;
  initialStatus: ProblemStatus;
  location: {
    trackTitle: string;
    trackSlug: string;
    moduleTitle: string;
    lessonHref: string;
  } | null;
  author: string;
  lessonTitle: string;
  prev: { index: number; title: string } | null;
  next: { index: number; title: string } | null;
  total: number;
}

export function ProblemWorkspace(props: Props) {
  const {
    lessonId,
    problemIndex,
    title,
    source,
    difficulty,
    statementHtml,
    hintHtml,
    solutionHtml,
    solutionUrl,
    initialStatus,
    location,
    author,
    lessonTitle,
    prev,
    next,
    total,
  } = props;

  const [status, setStatus] = useState<ProblemStatus>(initialStatus);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [scratch, setScratch] = useState("");
  const [, startTransition] = useTransition();
  const scratchKey = `sfma-scratch-${lessonId}-${problemIndex}`;
  const loaded = useRef(false);
  const diff = DIFFICULTY_STYLE[difficulty] ?? DIFFICULTY_STYLE.Medium;

  // Reset transient UI when navigating between problems.
  useEffect(() => {
    setStatus(initialStatus);
    setShowHint(false);
    setShowSolution(false);
    loaded.current = false;
  }, [lessonId, problemIndex, initialStatus]);

  // Local-only scratchpad (per problem, never sent to the server).
  useEffect(() => {
    try {
      setScratch(localStorage.getItem(scratchKey) ?? "");
    } catch {
      setScratch("");
    }
    loaded.current = true;
  }, [scratchKey]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(scratchKey, scratch);
    } catch {
      /* ignore */
    }
  }, [scratch, scratchKey]);

  function changeStatus(nextStatus: string) {
    const prevStatus = status;
    setStatus(nextStatus as ProblemStatus);
    startTransition(async () => {
      const res = await setProblemStatus(
        lessonId,
        problemIndex,
        nextStatus as ProblemStatus,
      );
      if (!res.ok) setStatus(prevStatus);
    });
  }

  const problemHref = (i: number) => `/problems/${lessonId}/${i}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-tmuted">
        <Link href="/problems" className="shrink-0 transition-colors hover:text-gold">
          Problems
        </Link>
        <span className="text-tfaint">/</span>
        {location ? (
          <Link href={`/learn/${location.trackSlug}`} className="truncate transition-colors hover:text-gold">
            {location.trackTitle}
          </Link>
        ) : (
          <span className="truncate">Problem Bank</span>
        )}
        <span className="text-tfaint">·</span>
        <span className="text-tfaint">
          {problemIndex + 1} of {total}
        </span>
      </div>

      {/* Header */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-tprimary">
            {title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[13px] text-tmuted">
            <span
              className="rounded-md px-2 py-0.5 text-[11.5px] font-semibold"
              style={{ color: diff.color, background: diff.bg }}
            >
              {difficulty}
            </span>
            {source && <span>{source}</span>}
          </div>
        </div>
        <div className="shrink-0 pt-1">
          <StatusControl
            value={status}
            options={PROBLEM_STATUS_OPTIONS}
            onChange={changeStatus}
            variant="pill"
            align="right"
          />
        </div>
      </div>

      {/* Statement */}
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-tfaint">
          Problem
        </div>
        <div className="prose-sfma" dangerouslySetInnerHTML={{ __html: statementHtml }} />
      </div>

      {/* Scratchpad */}
      <div className="mt-5">
        <label className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-tmuted">
          <span>Your work</span>
          <span className="text-tfaint">saved on this device only</span>
        </label>
        <textarea
          value={scratch}
          onChange={(e) => setScratch(e.target.value)}
          placeholder="Work through it here — jot down your approach, casework, and answer…"
          className="min-h-[150px] w-full resize-y rounded-2xl border border-border bg-surface-2 px-4 py-3 font-mono text-[13.5px] leading-relaxed text-tprimary outline-none transition-colors placeholder:text-tfaint focus:border-gold"
        />
      </div>

      {/* Actions: hint / solution / lesson */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {hintHtml && (
          <button
            onClick={() => setShowHint((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-tmuted transition-colors hover:border-gold/50 hover:text-gold"
          >
            <Lightbulb className="h-4 w-4" />
            {showHint ? "Hide hint" : "Show hint"}
          </button>
        )}
        {solutionHtml && (
          <button
            onClick={() => setShowSolution((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-tmuted transition-colors hover:border-green/50 hover:text-green"
          >
            <CheckCircle className="h-4 w-4" />
            {showSolution ? "Hide solution" : "Show solution"}
          </button>
        )}
        {solutionUrl && (
          <a
            href={solutionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-green/40 bg-green/10 px-4 py-2 text-[13px] font-semibold text-green transition-colors hover:bg-green/15"
          >
            <ExternalLink className="h-4 w-4" />
            Solution on {solutionLinkLabel(solutionUrl)}
          </a>
        )}
        {location && (
          <Link
            href={location.lessonHref}
            className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-[13px] font-semibold text-gold transition-colors hover:bg-gold/15"
          >
            <BookOpen className="h-4 w-4" />
            Stuck? Read the lesson
          </Link>
        )}
      </div>

      {showHint && hintHtml && (
        <div className="env env-big-idea mt-5">
          <div className="env-head">
            <span className="env-badge">
              <Lightbulb className="h-[15px] w-[15px]" />
            </span>
            <span className="env-label">Hint</span>
          </div>
          <div className="prose-sfma env-body" dangerouslySetInnerHTML={{ __html: hintHtml }} />
        </div>
      )}

      {showSolution && solutionHtml && (
        <div className="env env-recipe mt-5">
          <div className="env-head">
            <span className="env-badge">
              <CheckCircle className="h-[15px] w-[15px]" />
            </span>
            <span className="env-label">Solution</span>
          </div>
          <div className="prose-sfma env-body" dangerouslySetInnerHTML={{ __html: solutionHtml }} />
        </div>
      )}

      {location && (
        <p className="mt-6 text-[12.5px] text-tfaint">
          From <span className="font-medium text-tmuted">{lessonTitle}</span> · by {author}
        </p>
      )}

      {/* Prev / next */}
      <div className="mt-8 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
        {prev ? (
          <Link href={problemHref(prev.index)} className="group card hover-lift rounded-2xl px-5 py-4 hover:border-gold/40">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-tfaint">
              <ArrowLeft className="h-3.5 w-3.5" /> Previous problem
            </div>
            <div className="mt-0.5 truncate text-[14px] font-semibold text-tprimary group-hover:text-gold">
              {prev.title}
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={problemHref(next.index)} className="group card hover-lift rounded-2xl px-5 py-4 text-right hover:border-gold/40">
            <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-tfaint">
              Next problem <ArrowRight className="h-3.5 w-3.5" />
            </div>
            <div className="mt-0.5 truncate text-[14px] font-semibold text-tprimary group-hover:text-gold">
              {next.title}
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
