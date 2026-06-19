/** Per-track color identity. Every course gets its own light, distinct color. */
export interface TrackTheme {
  /** solid accent color — used for tags, the "Open" link, progress fills */
  banner: string;
  /** lighter accent — used for hover borders / dots */
  accent: string;
  /** gradient used for thin accent bars / hero banners */
  gradient: string;
  /** very light translucent tint for card backgrounds */
  tint: string;
  /** short audience label, e.g. "Middle School" */
  tag: string;
}

function theme(
  banner: string,
  accent: string,
  grad2: string,
  tint: string,
  tag: string,
): TrackTheme {
  return { banner, accent, gradient: `linear-gradient(135deg, ${banner}, ${grad2})`, tint, tag };
}

/** Explicit themes for the known courses. */
const THEMES: Record<string, TrackTheme> = {
  "amc-8": theme("#0d9488", "#14b8a6", "#0891b2", "rgba(13,148,136,0.07)", "Middle School"),
  "amc-10-12": theme("#2563eb", "#3b82f6", "#4f46e5", "rgba(37,99,235,0.07)", "High School"),
  aime: theme("#b45309", "#d97706", "#ea580c", "rgba(217,119,6,0.08)", "Olympiad Track"),
  olympiad: theme("#be123c", "#e11d48", "#db2777", "rgba(225,29,72,0.07)", "Olympiad"),
  "ap-calculus-bc": theme("#6d28d9", "#8b5cf6", "#c026d3", "rgba(124,58,237,0.07)", "Advanced"),
};

/** Distinct light colors for any other / future course, picked deterministically. */
const PALETTE: TrackTheme[] = [
  theme("#047857", "#10b981", "#0d9488", "rgba(5,150,105,0.07)", "Course"),
  theme("#4338ca", "#6366f1", "#7c3aed", "rgba(79,70,229,0.07)", "Course"),
  theme("#0e7490", "#06b6d4", "#2563eb", "rgba(8,145,178,0.07)", "Course"),
  theme("#be185d", "#db2777", "#e11d48", "rgba(219,39,119,0.07)", "Course"),
  theme("#c2410c", "#ea580c", "#d97706", "rgba(234,88,12,0.07)", "Course"),
  theme("#7c3aed", "#a78bfa", "#6366f1", "rgba(124,58,237,0.07)", "Course"),
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function trackTheme(slug: string): TrackTheme {
  if (THEMES[slug]) return THEMES[slug];

  // Match common course families even when the slug differs from the seed.
  const s = slug.toLowerCase();
  if (s.includes("aime")) return THEMES.aime;
  if (s.includes("olymp") || s.includes("usajmo") || s.includes("usamo") || s.includes("imo"))
    return THEMES.olympiad;
  if (s.includes("calc")) return THEMES["ap-calculus-bc"];
  if (s.includes("amc") && s.includes("8")) return THEMES["amc-8"];
  if (s.includes("amc")) return THEMES["amc-10-12"];

  // Anything else gets a stable, distinct color (never the bland gray fallback).
  return PALETTE[hash(slug) % PALETTE.length];
}
