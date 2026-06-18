"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Keyboard, Close } from "@/components/icons";

interface Shortcut {
  keys: string[];
  label: string;
}

const GROUPS: { title: string; items: Shortcut[] }[] = [
  {
    title: "Navigation",
    items: [
      { keys: ["g", "h"], label: "Go home" },
      { keys: ["g", "d"], label: "Go to dashboard" },
      { keys: ["g", "p"], label: "Go to problems" },
      { keys: ["g", "t"], label: "Go to team" },
    ],
  },
  {
    title: "General",
    items: [
      { keys: ["⌘", "K"], label: "Search lessons" },
      { keys: ["⇧", "F"], label: "Send feedback" },
      { keys: ["?"], label: "Show this help" },
    ],
  },
];

const NAV: Record<string, string> = {
  h: "/",
  d: "/dashboard",
  p: "/problems",
  t: "/team",
};

/**
 * Global keyboard shortcuts: "?" opens a help overlay, and a Vim-style "g then
 * <key>" jumps between top-level pages. All handlers ignore keystrokes while
 * the user is typing in a field.
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pendingG = useRef(false);
  const gTimer = useRef<number | undefined>(undefined);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function isTyping() {
      const el = document.activeElement;
      return (
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      );
    }

    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping()) return;

      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      const key = e.key.toLowerCase();
      if (pendingG.current && NAV[key]) {
        pendingG.current = false;
        window.clearTimeout(gTimer.current);
        e.preventDefault();
        router.push(NAV[key]);
        return;
      }
      if (key === "g") {
        pendingG.current = true;
        window.clearTimeout(gTimer.current);
        gTimer.current = window.setTimeout(() => {
          pendingG.current = false;
        }, 1200);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="menu-pop panel relative w-full max-w-md overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Keyboard className="h-[18px] w-[18px] text-gold" />
            <h2 className="text-[15px] font-bold text-tprimary">
              Keyboard shortcuts
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-lg p-1.5 text-tfaint transition-colors hover:bg-bg hover:text-tprimary"
          >
            <Close className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="grid gap-5 px-5 py-4 sm:grid-cols-2">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-tfaint">
                {g.title}
              </div>
              <ul className="space-y-2">
                {g.items.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-[13px] text-tmuted">{s.label}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <kbd
                          key={i}
                          className="min-w-[22px] rounded-md border border-border bg-bg px-1.5 py-0.5 text-center text-[11px] font-semibold text-tprimary"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border px-5 py-3 text-center text-[12px] text-tfaint">
          Press <kbd className="rounded border border-border bg-bg px-1 text-[11px]">?</kbd>{" "}
          anytime to toggle this panel.
        </div>
      </div>
    </div>,
    document.body,
  );
}
