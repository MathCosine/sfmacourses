import type { LessonStatus, ProblemStatus } from "./types";

export interface StatusMeta {
  label: string;
  /** Solid accent color for the filled state. */
  color: string;
  /** Soft tint background for chips. */
  tint: string;
}

export const STATUS_META: Record<LessonStatus | ProblemStatus, StatusMeta> = {
  not_started: { label: "Not Started", color: "#aeb4bf", tint: "#f1f2f4" },
  reading: { label: "Reading", color: "#1c7ed6", tint: "#e7f5ff" },
  practicing: { label: "Practicing", color: "#f08c00", tint: "#fff4e6" },
  solving: { label: "Solving", color: "#f08c00", tint: "#fff4e6" },
  complete: { label: "Complete", color: "#2f9e44", tint: "#ebfbee" },
  solved: { label: "Solved", color: "#2f9e44", tint: "#ebfbee" },
  skipped: { label: "Skipped", color: "#7048e8", tint: "#f3f0ff" },
  ignored: { label: "Ignored", color: "#aeb4bf", tint: "#f1f2f4" },
};

export const LESSON_STATUS_OPTIONS: LessonStatus[] = [
  "not_started",
  "reading",
  "practicing",
  "complete",
  "skipped",
  "ignored",
];

export const PROBLEM_STATUS_OPTIONS: ProblemStatus[] = [
  "not_started",
  "solving",
  "solved",
  "skipped",
  "ignored",
];

/** Safe lookup that accepts an arbitrary string (e.g. a DB value). */
export function statusMeta(s: string | undefined | null): StatusMeta {
  return (s && STATUS_META[s as LessonStatus]) || STATUS_META.not_started;
}

export function isComplete(s: LessonStatus | undefined): boolean {
  return s === "complete";
}

export function isInProgress(s: LessonStatus | undefined): boolean {
  return s === "reading" || s === "practicing";
}
