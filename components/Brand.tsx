"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Inline SVG recreation of the SFMA emblem (charcoal tile + brushed-silver
 * monogram). Used as the fallback whenever the raster logo is unavailable, so
 * the brand still renders correctly with nothing to download.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("block", className)} aria-hidden>
      <defs>
        <linearGradient id="sfma-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef1f4" />
          <stop offset="0.5" stopColor="#878e98" />
          <stop offset="1" stopColor="#d6dade" />
        </linearGradient>
        <linearGradient id="sfma-silver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfcfd" />
          <stop offset="0.45" stopColor="#cdd3da" />
          <stop offset="0.55" stopColor="#969da7" />
          <stop offset="1" stopColor="#e7eaee" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="15" fill="url(#sfma-ring)" />
      <rect x="6.5" y="6.5" width="51" height="51" rx="11.5" fill="#2b2f37" />
      <text
        x="32"
        y="31"
        textAnchor="middle"
        textLength="32"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="18"
        fill="url(#sfma-silver)"
      >
        SFMA
      </text>
      <text
        x="32"
        y="45"
        textAnchor="middle"
        textLength="28"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="9"
        fill="url(#sfma-silver)"
      >
        courses
      </text>
    </svg>
  );
}

/**
 * The brand mark used across the site (header, footer, hero). Renders the
 * uploaded logo from /public/brand/sfma-logo.png and gracefully falls back to
 * {@link LogoMark} if that file is missing or fails to load — so headers and
 * footers never show a broken image before the asset is added.
 */
export function BrandMark({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // The image can 404 before React attaches the onError handler during
  // hydration, so that event is missed. Re-check on mount: a finished load
  // with zero natural width means it failed — fall back to the SVG mark.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return <LogoMark className={cn("rounded-[0.5em]", className)} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src="/brand/sfma-logo.png"
      alt="SFMA courses logo"
      onError={() => setFailed(true)}
      className={cn("block rounded-[0.5em] object-contain", className)}
    />
  );
}
