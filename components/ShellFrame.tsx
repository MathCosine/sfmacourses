"use client";

import { useState } from "react";
import { Sidebar, type SidebarUser } from "@/components/Sidebar";
import type { NavTrack } from "@/lib/nav";
import { Menu, Close } from "@/components/icons";
import { cn } from "@/lib/utils";

interface ShellFrameProps {
  tracks: NavTrack[];
  statuses: Record<string, string>;
  activeTrackSlug?: string;
  activeLessonId?: string;
  user: SidebarUser;
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
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-border lg:block">
        <Sidebar
          tracks={tracks}
          statuses={statuses}
          activeTrackSlug={activeTrackSlug}
          activeLessonId={activeLessonId}
          user={user}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-sidebar px-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-1.5 text-tprimary hover:bg-surface"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-serif text-lg text-gold">SFMA</span>
      </div>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-border transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-4 z-10 rounded-md p-1 text-tmuted hover:bg-surface hover:text-tprimary"
          aria-label="Close navigation"
        >
          <Close className="h-5 w-5" />
        </button>
        <Sidebar
          tracks={tracks}
          statuses={statuses}
          activeTrackSlug={activeTrackSlug}
          activeLessonId={activeLessonId}
          user={user}
        />
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 pt-14 lg:pl-[260px] lg:pt-0">
        {children}
      </div>
    </div>
  );
}
