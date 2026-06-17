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

/** Coerce a possibly-malformed content value into a Block[] (never throws). */
export function asBlocks(content: unknown): Block[] {
  if (Array.isArray(content)) return content as Block[];
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed as Block[];
    } catch {
      /* ignore */
    }
  }
  return [];
}

/** Pull the lesson-level meta block out of a content array. */
export function extractMeta(content: Block[] | null | undefined): {
  author: string;
  frequency: Frequency;
} {
  const meta = asBlocks(content).find((b): b is MetaBlock => b.type === "meta");
  return {
    author: meta?.author || DEFAULT_META.author,
    frequency: meta?.frequency || DEFAULT_META.frequency,
  };
}

/** The renderable content blocks (everything except meta). */
export function contentBlocks(
  content: Block[] | null | undefined,
): ContentBlock[] {
  return asBlocks(content).filter(
    (b): b is ContentBlock => b.type !== "meta",
  );
}

export function countProblems(content: Block[] | null | undefined): number {
  return asBlocks(content).filter((b) => b.type === "problem").length;
}

/** Parse a YouTube/Vimeo watch URL into an embeddable iframe URL. */
export function toEmbedUrl(url: string): string | null {
  if (!url?.trim()) return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (host.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return url;
      if (u.pathname.startsWith("/shorts/"))
        return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return null;
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
