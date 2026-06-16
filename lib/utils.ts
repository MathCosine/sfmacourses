import type { Block, ContentBlock, Frequency, MetaBlock } from "./types";

/** Join class names, skipping falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function initials(name: string | null | undefined, email?: string): string {
  const source = name?.trim() || email?.split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Slugify a heading for use as an anchor id (matches TOC + section blocks). */
export function headingId(text: string): string {
  return slugify(text) || "section";
}

const DEFAULT_META: MetaBlock = {
  type: "meta",
  author: "SFMA Staff",
  frequency: "important",
};

/** Pull the lesson-level meta block out of a content array. */
export function extractMeta(content: Block[] | null | undefined): {
  author: string;
  frequency: Frequency;
} {
  const meta = (content ?? []).find((b): b is MetaBlock => b.type === "meta");
  return {
    author: meta?.author || DEFAULT_META.author,
    frequency: meta?.frequency || DEFAULT_META.frequency,
  };
}

/** The renderable content blocks (everything except meta). */
export function contentBlocks(
  content: Block[] | null | undefined,
): ContentBlock[] {
  return (content ?? []).filter(
    (b): b is ContentBlock => b.type !== "meta",
  );
}

export function countProblems(content: Block[] | null | undefined): number {
  return (content ?? []).filter((b) => b.type === "problem").length;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
