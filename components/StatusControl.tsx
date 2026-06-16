"use client";

import { useEffect, useRef, useState } from "react";
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

/**
 * usaco.guide-style status control: a colored status dot (or labeled pill) that
 * opens a dropdown menu of statuses. Used for chapters and problems.
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
  const ref = useRef<HTMLDivElement>(null);
  const meta = statusMeta(value);
  const filled = value && value !== "not_started";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function pick(opt: string, e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(false);
    if (opt !== value) onChange(opt);
  }

  return (
    <div ref={ref} className="relative inline-block">
      {variant === "circle" ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          title={meta.label}
          aria-label={`Status: ${meta.label}`}
          className="flex items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
          style={{
            width: size,
            height: size,
            borderColor: filled ? meta.color : "#ccd0d8",
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
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] font-medium shadow-card transition-colors hover:border-border-strong"
        >
          <span
            className="block h-2.5 w-2.5 rounded-full"
            style={{
              background: filled ? meta.color : "transparent",
              border: filled ? "none" : "2px solid #ccd0d8",
            }}
          />
          <span style={{ color: filled ? meta.color : "var(--color-tmuted)" }}>
            {meta.label}
          </span>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-tfaint" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}

      {open && (
        <div
          className={`absolute z-50 mt-1.5 w-44 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lift ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((opt) => {
            const om = statusMeta(opt);
            const active = opt === value;
            return (
              <button
                key={opt}
                onClick={(e) => pick(opt, e)}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-bg"
              >
                <span
                  className="block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background: opt === "not_started" ? "transparent" : om.color,
                    border:
                      opt === "not_started" ? "2px solid #ccd0d8" : "none",
                  }}
                />
                <span
                  className="flex-1"
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
        </div>
      )}
    </div>
  );
}
