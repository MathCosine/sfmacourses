"use client";

import { useEffect, useState } from "react";

/**
 * A thin reading-progress bar pinned to the very top of the viewport. Reflects
 * how far the page is scrolled. Pure transform/width updates on a passive
 * listener — no layout thrash.
 */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 print:hidden"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-gold via-gold to-green transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${pct / 100})`, width: "100%" }}
      />
    </div>
  );
}
