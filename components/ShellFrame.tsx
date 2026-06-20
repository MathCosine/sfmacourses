"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav, type NavUser } from "@/components/TopNav";
import type { NavTrack } from "@/lib/nav";
import { Menu, Close } from "@/components/icons";
import { cn } from "@/lib/utils";

interface ShellFrameProps {
  tracks: NavTrack[];
  statuses: Record<string, string>;
  activeTrackSlug?: string;
  activeLessonId?: string;
  user: NavUser;
  children: React.ReactNode;
}

export function ShellFrame({
  tracks,
  statuses,
  activeTrackSlug,
  activeLessonId,
  user,
  children,
}: ShellFrameProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <TopNav tracks={tracks} user={user} />

      <div className="flex w-full">
        {/* Desktop module tree */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[290px] shrink-0 border-r border-border bg-sidebar lg:block">
          <Sidebar
            tracks={tracks}
            statuses={statuses}
            activeTrackSlug={activeTrackSlug}
            activeLessonId={activeLessonId}
          />
        </aside>

        {/* Mobile "chapters" trigger */}
        <div className="fixed bottom-5 left-5 z-30 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-[13px] font-semibold text-white shadow-lift"
          >
            <Menu className="h-4 w-4" /> Chapters
          </button>
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[300px] border-r border-border bg-sidebar transition-transform lg:hidden",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-tmuted hover:bg-bg hover:text-tprimary"
            aria-label="Close chapters"
          >
            <Close className="h-5 w-5" />
          </button>
          <Sidebar
            tracks={tracks}
            statuses={statuses}
            activeTrackSlug={activeTrackSlug}
            activeLessonId={activeLessonId}
            onNavigate={() => setOpen(false)}
          />
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
