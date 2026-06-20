"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { Difficulty, ProblemStatus } from "@/lib/types";
import { DIFFICULTIES } from "@/lib/types";
import { PROBLEM_STATUS_OPTIONS, statusMeta } from "@/lib/status";
import { setProblemStatus } from "@/app/learn/actions";
import { StatusControl } from "@/components/StatusControl";
import { cn } from "@/lib/utils";
import { Search } from "@/components/icons";

export interface ProblemRow {
  key: string;
  lessonId: string;
  problemIndex: number;
  title: string;
  source: string;
  difficulty: Difficulty;
  trackTitle: string;
  trackSlug: string;
  unitTitle: string;
  lessonTitle: string;
  href: string;
  status: ProblemStatus;
}

const DIFFICULTY_STYLE: Record<Difficulty, { color: string; bg: string }> = {
  Easy: { color: "#2f9e44", bg: "rgba(47,158,68,0.12)" },
  Medium: { color: "#1c7ed6", bg: "rgba(28,126,214,0.12)" },
  Hard: { color: "#e8590c", bg: "rgba(232,89,12,0.12)" },
  "Very Hard": { color: "#c92a2a", bg: "rgba(201,42,42,0.12)" },
};

const STATUS_FILTERS: { value: "all" | ProblemStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "not_started", label: "Not started" },
  { value: "solving", label: "Solving" },
  { value: "solved", label: "Solved" },
  { value: "skipped", label: "Skipped" },
];

export function ProblemsExplorer({
  problems,
  tracks,
}: {
  problems: ProblemRow[];
  tracks: { slug: string; title: string }[];
}) {
  const [rows, setRows] = useState(problems);
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<"all" | Difficulty>("all");
  const [status, setStatus] = useState<"all" | ProblemStatus>("all");
  const [course, setCourse] = useState<"all" | string>("all");
  const [sortKey, setSortKey] = useState<"difficulty" | "title">("difficulty");
  const [sortAsc, setSortAsc] = useState(true);
  const [, startTransition] = useTransition();

  function changeStatus(key: string, lessonId: string, index: number, next: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, status: next as ProblemStatus } : r)));
    startTransition(async () => {
      await setProblemStatus(lessonId, index, next as ProblemStatus);
    });
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (diff !== "all" && r.difficulty !== diff) return false;
      if (status !== "all") {
        if (status === "not_started" && r.status !== "not_started") return false;
        if (status !== "not_started" && r.status !== status) return false;
      }
      if (course !== "all" && r.trackSlug !== course) return false;
      if (needle) {
        const hay = `${r.title} ${r.source} ${r.lessonTitle} ${r.unitTitle}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "difficulty") {
        cmp = DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty);
        if (cmp === 0) cmp = a.title.localeCompare(b.title);
      } else {
        cmp = a.title.localeCompare(b.title);
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [rows, q, diff, status, course, sortKey, sortAsc]);

  const solvedCount = rows.filter((r) => r.status === "solved").length;

  function toggleSort(key: "difficulty" | "title") {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  return (
    <div>
      {/* Controls */}
      <div className="card rounded-xl p-4">
        <div className="flex items-center gap-3 rounded-[10px] border border-border bg-bg px-3.5 py-2.5">
          <Search className="h-[18px] w-[18px] text-tfaint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search problems by name, source, or lesson…"
            className="flex-1 bg-transparent text-[14px] text-tprimary outline-none placeholder:text-tfaint"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <FilterGroup label="Difficulty">
            <Chip active={diff === "all"} onClick={() => setDiff("all")}>All</Chip>
            {DIFFICULTIES.map((d) => (
              <Chip key={d} active={diff === d} onClick={() => setDiff(d)} color={DIFFICULTY_STYLE[d].color}>
                {d}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Course">
            <Chip active={course === "all"} onClick={() => setCourse("all")}>All</Chip>
            {tracks.map((t) => (
              <Chip key={t.slug} active={course === t.slug} onClick={() => setCourse(t.slug)}>
                {t.title}
              </Chip>
            ))}
          </FilterGroup>
        </div>

        <div className="mt-3">
          <FilterGroup label="Status">
            {STATUS_FILTERS.map((s) => (
              <Chip
                key={s.value}
                active={status === s.value}
                onClick={() => setStatus(s.value)}
                color={s.value !== "all" ? statusMeta(s.value).color : undefined}
              >
                {s.label}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-1 text-[13px] text-tmuted">
        <span>
          <span className="font-semibold text-tprimary">{filtered.length}</span> problem
          {filtered.length === 1 ? "" : "s"}
        </span>
        <span>
          <span className="font-semibold text-green">{solvedCount}</span> solved
        </span>
      </div>

      {/* Table */}
      <div className="mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="hidden grid-cols-[44px_1fr_140px_120px_160px] items-center gap-3 bg-surface-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-tfaint sm:grid">
          <span>Status</span>
          <button onClick={() => toggleSort("title")} className="flex items-center gap-1 text-left hover:text-tprimary">
            Problem {sortKey === "title" && (sortAsc ? "↑" : "↓")}
          </button>
          <span>Source</span>
          <button onClick={() => toggleSort("difficulty")} className="flex items-center gap-1 text-left hover:text-tprimary">
            Difficulty {sortKey === "difficulty" && (sortAsc ? "↑" : "↓")}
          </button>
          <span>Course</span>
        </div>

        <div>
          {filtered.map((r) => {
            const ds = DIFFICULTY_STYLE[r.difficulty];
            return (
              <div
                key={r.key}
                className="grid grid-cols-[44px_1fr] items-center gap-3 px-4 py-3 transition-colors odd:bg-surface-2/60 hover:bg-highlight sm:grid-cols-[44px_1fr_140px_120px_160px]"
              >
                <StatusControl
                  value={r.status}
                  options={PROBLEM_STATUS_OPTIONS}
                  onChange={(next) => changeStatus(r.key, r.lessonId, r.problemIndex, next)}
                  size={22}
                />
                <div className="min-w-0">
                  <Link
                    href={`/problems/${r.lessonId}/${r.problemIndex}`}
                    className="block truncate text-[14px] font-semibold text-tprimary hover:text-gold"
                  >
                    {r.title}
                  </Link>
                  <div className="truncate text-[12px] text-tmuted sm:hidden">
                    {r.source} · {r.trackTitle}
                  </div>
                </div>
                <div className="hidden truncate text-[13px] text-tmuted sm:block">{r.source}</div>
                <div className="hidden sm:block">
                  <span
                    className="rounded-md px-2 py-0.5 text-[11.5px] font-semibold"
                    style={{ color: ds.color, background: ds.bg }}
                  >
                    {r.difficulty}
                  </span>
                </div>
                <Link href={`/learn/${r.trackSlug}`} className="hidden truncate text-[12.5px] text-tmuted hover:text-gold sm:block">
                  {r.trackTitle}
                </Link>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-[14px] text-tfaint">
              No problems match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-tfaint">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors",
        active
          ? "border-transparent text-white"
          : "border-border bg-surface text-tmuted hover:border-border-strong hover:text-tprimary",
      )}
      style={active ? { background: color ?? "var(--color-gold)" } : undefined}
    >
      {children}
    </button>
  );
}
