import { cn } from "@/lib/utils";

/**
 * The SFMA logo mark: a bold Σ (sigma — the site's recurring math motif) on a
 * rounded tile with the brand's blue gradient and a soft top highlight. Drawn
 * as crisp vector strokes so it stays sharp from favicon size up to the hero.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("block", className)}
      role="img"
      aria-label="SFMA"
    >
      <defs>
        <linearGradient id="sfma-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="0.55" stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="sfma-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="15" fill="url(#sfma-tile)" />
      <rect x="0" y="0" width="64" height="34" rx="15" fill="url(#sfma-sheen)" />
      {/* Σ */}
      <path
        d="M44 17 H22 L33 32 L22 47 H44"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Brand mark used across the site (header, footer, hero). Renders {@link
 * LogoMark} directly — a self-contained vector, so it's always crisp with
 * nothing to download and no broken-image states.
 */
export function BrandMark({ className }: { className?: string }) {
  return <LogoMark className={className} />;
}
