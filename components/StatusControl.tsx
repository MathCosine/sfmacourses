"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { statusMeta } from "@/lib/status";
import { Check } from "@/components/icons";

interface StatusControlProps {
  value: string;
  options: readonly string[];
  onChange: (next: string) => void;
  /** "circle" shows just the dot; "pill" shows dot + label (like usaco header). */
  variant?: "circle" | "pill";
  size?: number;
  align?: "left" | "right";
}

const RING = "#cbd2dc";

/**
 * Status control: a colored status dot (or labeled pill) that opens a menu of
 * statuses. The menu renders in a portal with fixed positioning so it is never
 * clipped by an ancestor's `overflow-hidden` (e.g. the rounded problem card).
 */
export function StatusControl({
  value,
  options,
  onChange,
  variant = "circle",
  size = 22,
  align = "left",
}: StatusControlProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const meta = statusMeta(value);
  const filled = value && value !== "not_started";

  const MENU_W = 188;

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left =
      align === "right"
        ? Math.max(8, r.right - MENU_W)
        : Math.min(r.left, window.innerWidth - MENU_W - 8);
    setCoords({ top: r.bottom + 6, left });
  }, [align]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t))
        return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScroll() {
      place();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, place]);

  function pick(opt: string, e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(false);
    if (opt !== value) onChange(opt);
  }

  const menu =
    open && coords
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="status-menu panel fixed z-[80] overflow-hidden rounded-xl py-1"
            style={{ top: coords.top, left: coords.left, width: MENU_W }}
            onClick={(e) => e.stopPropagation()}
          >
            {options.map((opt) => {
              const om = statusMeta(opt);
              const active = opt === value;
              const isEmpty = opt === "not_started";
              return (
                <button
                  key={opt}
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={(e) => pick(opt, e)}
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-bg"
                  style={
                    active
                      ? { background: `color-mix(in srgb, ${om.color} 10%, transparent)` }
                      : undefined
                  }
                >
                  <span
                    className="block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      background: isEmpty ? "transparent" : om.color,
                      border: isEmpty ? `2px solid ${RING}` : "none",
                    }}
                  />
                  <span
                    className="flex-1 font-medium"
                    style={{ color: active ? om.color : "var(--color-tprimary)" }}
                  >
                    {om.label}
                  </span>
                  {active && (
                    <Check className="h-3.5 w-3.5" style={{ color: om.color }} />
                  )}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative inline-block">
      {variant === "circle" ? (
        <button
          ref={triggerRef}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          title={meta.label}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Status: ${meta.label}`}
          className="flex items-center justify-center rounded-full border-2 transition-transform hover:scale-110 active:scale-100"
          style={{
            width: size,
            height: size,
            borderColor: filled ? meta.color : RING,
            background: filled ? meta.color : "transparent",
          }}
        >
          {value === "complete" || value === "solved" ? (
            <Check className="h-3 w-3 text-white" />
          ) : filled ? (
            <span className="block h-1.5 w-1.5 rounded-full bg-white" />
          ) : null}
        </button>
      ) : (
        <button
          ref={triggerRef}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] font-medium shadow-card transition-colors hover:border-border-strong"
        >
          <span
            className="block h-2.5 w-2.5 rounded-full"
            style={{
              background: filled ? meta.color : "transparent",
              border: filled ? "none" : `2px solid ${RING}`,
            }}
          />
          <span style={{ color: filled ? meta.color : "var(--color-tmuted)" }}>
            {meta.label}
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`h-3.5 w-3.5 text-tfaint transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
      {menu}
    </div>
  );
}
