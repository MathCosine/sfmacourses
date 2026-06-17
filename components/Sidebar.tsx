"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NavTrack } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { statusMeta } from "@/lib/status";
import { trackTheme } from "@/lib/trackTheme";
import { ChevronRight, ChevronDown, Check } from "@/components/icons";

interface SidebarProps {
  tracks: NavTrack[];
  statuses: Record<string, string>;
  activeTrackSlug?: string;
  activeLessonId?: string;
  onNavigate?: () => void;
}

export function Sidebar({
  tracks,
  statuses,
  activeTrackSlug,
  activeLessonId,
  onNavigate,
}: SidebarProps) {
  const initialTrack =
    activeTrackSlug && tracks.some((t) => t.slug === activeTrackSlug)
      ? activeTrackSlug
      : tracks[0]?.slug;
  const [selected, setSelected] = useState(initialTrack);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const track = tracks.find((t) => t.slug === selected) ?? tracks[0];
  const theme = trackTheme(track?.slug ?? "");

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node))
        setSwitcherOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Course switcher */}
      <div ref={switcherRef} className="relative shrink-0 px-3 pt-4 pb-2">
        <button
          onClick={() => setSwitcherOpen((o) => !o)}
          className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-border-strong"
        >
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: theme.banner }} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-bold text-tprimary">{track?.title}</span>
            <span className="block text-[11px] text-tmuted">{theme.tag}</span>
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-tfaint transition-transform", switcherOpen && "rotate-180")} />
        </button>
        {switcherOpen && (
          <div className="absolute left-3 right-3 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lift">
            {tracks.map((t) => {
              const th = trackTheme(t.slug);
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelected(t.slug);
                    setSwitcherOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-bg",
                    t.slug === selected ? "font-semibold text-tprimary" : "text-tmuted",
                  )}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: th.banner }} />
                  <span className="truncate">{t.title}</span>
                </button>
              );
            })}
          </div>
        )}
        {track && (
          <Link
            href={`/learn/${track.slug}`}
            onClick={onNavigate}
            className="mt-1.5 block px-1 text-[11.5px] font-medium text-gold hover:underline"
          >
            View course overview →
          </Link>
        )}
      </div>

      {/* Tree */}
      <nav className="scroll-area flex-1 overflow-y-auto px-2 py-2">
        {track?.modules.length === 0 && (
          <p className="px-3 py-2 text-[13px] text-tfaint">No chapters yet.</p>
        )}
        {track?.modules.map((m) => {
          const isCollapsed = collapsed.has(m.id);
          return (
            <div key={m.id} className="mb-1">
              <button
                onClick={() => toggle(m.id)}
                className="group flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-tmuted transition-colors hover:text-tprimary"
              >
                <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform", !isCollapsed && "rotate-90")} />
                <span className="truncate">{m.title}</span>
              </button>

              {!isCollapsed && (
                <ul className="mb-1 ml-[18px] border-l border-border">
                  {m.lessons.map((l) => {
                    const isActive = l.id === activeLessonId;
                    const status = statuses[l.id] ?? "not_started";
                    const sm = statusMeta(status);
                    const filled = status !== "not_started";
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/learn/${track.slug}/${m.slug}/${l.slug}`}
                          onClick={onNavigate}
                          className={cn(
                            "group -ml-px flex items-center gap-2 border-l-2 py-1.5 pl-3 pr-2 text-[13.5px] transition-colors",
                            isActive
                              ? "border-gold bg-highlight font-semibold text-tprimary"
                              : "border-transparent text-tmuted hover:border-border-strong hover:text-tprimary",
                          )}
                        >
                          <span
                            className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2"
                            style={{
                              borderColor: filled ? sm.color : "var(--color-border-strong)",
                              background: filled ? sm.color : "transparent",
                            }}
                          >
                            {status === "complete" && <Check className="h-2 w-2 text-white" />}
                          </span>
                          <span className="truncate">{l.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                  {m.lessons.length === 0 && (
                    <li className="py-1 pl-3 text-[12.5px] text-tfaint">No chapters</li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
