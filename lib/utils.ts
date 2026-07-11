import type { Block, ContentBlock, Frequency, Maturity, MetaBlock } from "./types";

/** Join class names, skipping falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Sanitize a user-supplied post-login destination: only same-origin paths are
 * allowed. Rejects absolute URLs ("https://evil.com"), protocol-relative
 * ("//evil.com") and backslash tricks, so ?redirect= can never leave the site.
 */
export function safeInternalPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/")) return null;
  if (path.startsWith("//") || path.includes("\\")) return null;
  return path;
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

/** Friendly label for an external solution link, inferred from its host
 *  (e.g. an AoPS thread or YouTube video). Falls back to the bare hostname. */
export function solutionLinkLabel(url: string | null | undefined): string {
  if (!url) return "source";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("artofproblemsolving") || host.includes("aops"))
      return "AoPS";
    if (host.includes("youtube") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("khanacademy")) return "Khan Academy";
    if (host.includes("brilliant")) return "Brilliant";
    if (host.includes("desmos")) return "Desmos";
    return host;
  } catch {
    return "source";
  }
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
  prereqNote: string;
  prereqLessonIds: string[];
  maturity: Maturity;
} {
  const meta = asBlocks(content).find((b): b is MetaBlock => b.type === "meta");
  return {
    author: meta?.author || DEFAULT_META.author,
    frequency: meta?.frequency || DEFAULT_META.frequency,
    prereqNote: meta?.prereqNote || "",
    prereqLessonIds: Array.isArray(meta?.prereqLessonIds)
      ? meta!.prereqLessonIds
      : [],
    maturity:
      meta?.maturity === "stable" || meta?.maturity === "developing"
        ? meta.maturity
        : "draft",
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
