export type Role = "student" | "staff";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Very Hard";

export type Frequency = "essential" | "important" | "supplemental";

/** usaco.guide-style completion status for a lesson/chapter. */
export type LessonStatus =
  | "not_started"
  | "reading"
  | "practicing"
  | "complete"
  | "skipped"
  | "ignored";

/** Completion status for a single problem. */
export type ProblemStatus =
  | "not_started"
  | "solving"
  | "solved"
  | "skipped"
  | "ignored";

export interface TextBlock {
  type: "text";
  content: string;
}

export interface ResourceBlock {
  type: "resource";
  source: string;
  stars: number;
  title: string;
  description: string;
  url?: string;
}

export interface ProblemBlock {
  type: "problem";
  title: string;
  source: string;
  difficulty: Difficulty;
  statement: string;
  hint?: string;
  solution?: string;
}

export interface SectionBlock {
  type: "section";
  title: string;
}

/**
 * Lesson-level metadata. Stored as an optional first element of the content
 * array (the `lessons` table has no dedicated columns for these), and filtered
 * out of the rendered block stream. Set by staff in the editor.
 */
export interface MetaBlock {
  type: "meta";
  author: string;
  frequency: Frequency;
}

export type ContentBlock =
  | TextBlock
  | ResourceBlock
  | ProblemBlock
  | SectionBlock;

export type Block = ContentBlock | MetaBlock;

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface Track {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
}

export interface Module {
  id: string;
  track_id: string;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  content: Block[];
  order_index: number;
  // Optional metadata stored alongside content blocks.
  author?: string | null;
  frequency?: Frequency | null;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface ProblemCompletion {
  id: string;
  user_id: string;
  lesson_id: string;
  problem_index: number;
  completed: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
}

/** A content block whose text/markdown has been pre-rendered to HTML. */
export type RenderedBlock = ContentBlock & { html?: string };

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  essential: "Essential",
  important: "Important",
  supplemental: "Supplemental",
};

export const FREQUENCY_DOTS: Record<Frequency, number> = {
  essential: 1,
  important: 2,
  supplemental: 3,
};

export const DIFFICULTIES: Difficulty[] = [
  "Easy",
  "Medium",
  "Hard",
  "Very Hard",
];
