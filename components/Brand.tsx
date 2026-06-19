import { cn } from "@/lib/utils";

/**
 * The SFMA logo mark: a small rising network of connected nodes — echoing the
 * site's dot-and-line motif and reading as "progress through a sequence."
 * Tile-less and drawn as crisp vectors, so it stays sharp from favicon size up
 * to the hero and sits cleanly on any background.
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
        <linearGradient id="sfma-grad" x1="6" y1="58" x2="58" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      {/* rising path */}
      <path
        d="M12 50 L26 37 L40 43 L53 14"
        fill="none"
        stroke="url(#sfma-grad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* nodes */}
      <g fill="url(#sfma-grad)">
        <circle cx="12" cy="50" r="5" />
        <circle cx="26" cy="37" r="5" />
        <circle cx="40" cy="43" r="5" />
        <circle cx="53" cy="14" r="6.5" />
      </g>
      <circle cx="53" cy="14" r="2.4" fill="#fff" />
    </svg>
  );
}

/**
 * Brand mark used across the site (header, footer, hero). Renders {@link
 * LogoMark} directly — a self-contained vector, always crisp, nothing to load.
 */
export function BrandMark({ className }: { className?: string }) {
  return <LogoMark className={className} />;
}
