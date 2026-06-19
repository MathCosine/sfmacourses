"use client";

import { useEffect, useRef } from "react";

/**
 * An interactive constellation backdrop: a grid of dots joined by faint lines
 * that light up and gently bend toward the cursor, with bright "constellation"
 * links drawn from the pointer to nearby dots. Pure canvas + rAF; the canvas is
 * pointer-events-none (cursor is tracked on window) so it never blocks clicks.
 * Falls back to a static grid under prefers-reduced-motion.
 */
export function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = context;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const SPACING = 40;
    const RADIUS = 150; // cursor influence radius
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    type Pt = { x: number; y: number; ox: number; oy: number };
    let pts: Pt[] = [];
    let cols = 0;
    let rows = 0;

    // Accent color sampled from the theme (re-read when the theme flips).
    let accent = { r: 37, g: 99, b: 235 };
    function readAccent() {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
      const m = raw.match(/^#?([0-9a-f]{6})$/i);
      if (m) {
        const n = parseInt(m[1], 16);
        accent = { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
      }
    }
    readAccent();
    const themeObserver = new MutationObserver(readAccent);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mouse = { x: -9999, y: -9999 };

    function build() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / SPACING) + 2;
      rows = Math.ceil(h / SPACING) + 2;
      pts = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING - SPACING;
          const y = r * SPACING - SPACING;
          pts.push({ x, y, ox: x, oy: y });
        }
      }
    }

    function idx(r: number, c: number) {
      return r * cols + c;
    }

    function rgba(a: number) {
      return `rgba(${accent.r},${accent.g},${accent.b},${a})`;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Ease points toward a position bent slightly toward the cursor.
      for (const p of pts) {
        const dx = p.ox - mouse.x;
        const dy = p.oy - mouse.y;
        const dist = Math.hypot(dx, dy);
        let tx = p.ox;
        let ty = p.oy;
        if (dist < RADIUS) {
          const force = (1 - dist / RADIUS) * 14;
          tx = p.ox + (dx / (dist || 1)) * force;
          ty = p.oy + (dy / (dist || 1)) * force;
        }
        p.x += (tx - p.x) * 0.12;
        p.y += (ty - p.y) * 0.12;
      }

      // Grid lines (to right + down neighbours), brighter near the cursor.
      ctx.lineWidth = 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = pts[idx(r, c)];
          const near =
            Math.hypot(p.ox - mouse.x, p.oy - mouse.y) < RADIUS * 1.1;
          const base = 0.05;
          const a = near ? 0.18 : base;
          if (c + 1 < cols) {
            const q = pts[idx(r, c + 1)];
            ctx.strokeStyle = rgba(a);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
          if (r + 1 < rows) {
            const q = pts[idx(r + 1, c)];
            ctx.strokeStyle = rgba(a);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // Dots + constellation lines to the cursor.
      for (const p of pts) {
        const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const near = dist < RADIUS;
        const t = near ? 1 - dist / RADIUS : 0;
        const radius = 1.1 + t * 2.2;
        ctx.fillStyle = rgba(0.18 + t * 0.6);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        if (t > 0.15) {
          ctx.strokeStyle = rgba(t * 0.5);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = rgba(0.06);
      ctx.lineWidth = 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = pts[idx(r, c)];
          if (c + 1 < cols) {
            const q = pts[idx(r, c + 1)];
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
          if (r + 1 < rows) {
            const q = pts[idx(r + 1, c)];
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = rgba(0.2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let raf = 0;
    function onMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }
    function onResize() {
      build();
      if (reduce) drawStatic();
    }

    build();
    if (reduce) {
      drawStatic();
    } else {
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseout", onLeave);
      raf = requestAnimationFrame(draw);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
