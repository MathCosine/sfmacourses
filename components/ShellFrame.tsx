"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { TopNav, type NavUser } from "@/components/TopNav";
import type { NavTrack } from "@/lib/nav";
import { Menu, Close, GraduationCap } from "@/components/icons";
import { cn } from "@/lib/utils";

function GuestBanner() {
  return (
    <div className="border-b border-border bg-highlight">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-3 gap-y-2 px-6 py-3 sm:px-10">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
          <GraduationCap className="h-[18px] w-[18px]" />
        </span>
        <p className="text-[13px] text-tmuted">
          You&apos;re previewing as a guest.{" "}
          <span className="font-semibold text-tprimary">Sign in</span> to track
          your progress and save your place.
        </p>
        <Link href="/auth" className="btn-3d ml-auto px-4 py-1.5 text-[12.5px]">
          Sign in
        </Link>
      </div>
    </div>
  );
}

interface ShellFrameProps {
  tracks: NavTrack[];
  statuses: Record<string, string>;
  activeTrackSlug?: string;
  activeLessonId?: string;
  user: NavUser | null;
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
            className="btn-3d px-4 py-2.5 text-[13px] shadow-lift"
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

        {/* Content — faint notebook paper behind the reading area */}
        <div className="relative min-w-0 flex-1">
          <div aria-hidden className="graph-paper pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative">
            {!user && <GuestBanner />}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
