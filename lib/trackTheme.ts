/** Division-style theme per track, in the spirit of usaco.guide divisions. */
export interface TrackTheme {
  /** solid banner background */
  banner: string;
  /** lighter accent used for tints/dots */
  accent: string;
  /** gradient (used for hero banners / accents) */
  gradient: string;
  /** soft translucent tint for card backgrounds */
  tint: string;
  /** short audience label, e.g. "Middle School" */
  tag: string;
}

const THEMES: Record<string, TrackTheme> = {
  "amc-8": {
    banner: "#0d9488",
    accent: "#14b8a6",
    gradient: "linear-gradient(135deg, #0d9488, #0891b2)",
    tint: "rgba(13,148,136,0.10)",
    tag: "Middle School",
  },
  "amc-10-12": {
    banner: "#2563eb",
    accent: "#3b82f6",
    gradient: "linear-gradient(135deg, #2563eb, #4f46e5)",
    tint: "rgba(37,99,235,0.10)",
    tag: "High School",
  },
  "ap-calculus-bc": {
    banner: "#7c3aed",
    accent: "#8b5cf6",
    gradient: "linear-gradient(135deg, #7c3aed, #c026d3)",
    tint: "rgba(124,58,237,0.10)",
    tag: "Advanced",
  },
};

const FALLBACK: TrackTheme = {
  banner: "#334155",
  accent: "#475569",
  gradient: "linear-gradient(135deg, #334155, #1e293b)",
  tint: "rgba(51,65,85,0.10)",
  tag: "Course",
};

export function trackTheme(slug: string): TrackTheme {
  return THEMES[slug] ?? FALLBACK;
}
