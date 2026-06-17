/** Division-style banner colors per track, in the spirit of usaco.guide. */
export interface TrackTheme {
  /** solid banner background */
  banner: string;
  /** lighter accent used for tints */
  accent: string;
  tag: string;
}

const THEMES: Record<string, TrackTheme> = {
  "amc-8": { banner: "#0d9488", accent: "#14b8a6", tag: "Middle School" },
  "amc-10-12": { banner: "#2563eb", accent: "#3b82f6", tag: "High School" },
  "ap-calculus-bc": { banner: "#7c3aed", accent: "#8b5cf6", tag: "Advanced" },
};

const FALLBACK: TrackTheme = {
  banner: "#334155",
  accent: "#475569",
  tag: "Course",
};

export function trackTheme(slug: string): TrackTheme {
  return THEMES[slug] ?? FALLBACK;
}
