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
  /** Optional external solution (e.g. an AoPS thread, video, or article).
   *  May be used alone or alongside a written `solution`. */
  solutionUrl?: string;
}

export interface SectionBlock {
  type: "section";
  title: string;
}

export interface VideoBlock {
  type: "video";
  url: string;
  title?: string;
  caption?: string;
}

export interface ImageBlock {
  type: "image";
  /** Hosted image URL (Cloudinary secure_url). */
  url: string;
  /** Alt text for accessibility. */
  alt?: string;
  /** Optional caption shown beneath the image. */
  caption?: string;
}

/** Styled "environment" box: theorem, big idea, recipe, example, etc. */
export type CalloutVariant =
  | "theorem"
  | "big-idea"
  | "recipe"
  | "example"
  | "info"
  | "warning";

export interface CalloutBlock {
  type: "callout";
  variant: CalloutVariant;
  /** Optional custom heading; falls back to the variant's default label. */
  title?: string;
  /** Markdown body (supports LaTeX). */
  body: string;
}

export const CALLOUT_LABELS: Record<CalloutVariant, string> = {
  theorem: "Theorem",
  "big-idea": "Big Idea",
  recipe: "Recipe",
  example: "Example",
  info: "Note",
  warning: "Warning",
};

export const CALLOUT_VARIANTS: CalloutVariant[] = [
  "theorem",
  "big-idea",
  "recipe",
  "example",
  "info",
  "warning",
];

/**
 * Lesson-level metadata. Stored as an optional first element of the content
 * array (the `lessons` table has no dedicated columns for these), and filtered
 * out of the rendered block stream. Set by staff in the editor.
 */
export interface MetaBlock {
  type: "meta";
  author: string;
  frequency: Frequency;
  /** Optional free-text recommended prerequisites (markdown, supports lists). */
  prereqNote?: string;
  /** Optional ids of other lessons recommended as prerequisites. */
  prereqLessonIds?: string[];
  /** Editorial maturity, set by staff. Defaults to "stable" when absent. */
  maturity?: Maturity;
}

/** How finished/polished a chapter is — staff-set, shown to everyone. */
export type Maturity = "stable" | "developing" | "draft";

export type ContentBlock =
  | TextBlock
  | ResourceBlock
  | ProblemBlock
  | SectionBlock
  | VideoBlock
  | ImageBlock
  | CalloutBlock;

export type Block = ContentBlock | MetaBlock;

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
  avatar_url?: string | null;
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
