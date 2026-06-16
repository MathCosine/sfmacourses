"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NavTrack } from "@/lib/nav";
import { cn, initials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight, Check, LogOut } from "@/components/icons";

export interface SidebarUser {
  name: string;
  email: string;
  role: "student" | "staff";
}

interface SidebarProps {
  tracks: NavTrack[];
  completed: string[];
  activeTrackSlug?: string;
  activeLessonId?: string;
  user: SidebarUser;
}

export function Sidebar({
  tracks,
  completed,
  activeTrackSlug,
  activeLessonId,
  user,
}: SidebarProps) {
  const router = useRouter();
  const completedSet = useMemo(() => new Set(completed), [completed]);

  const initialTrack =
    activeTrackSlug && tracks.some((t) => t.slug === activeTrackSlug)
      ? activeTrackSlug
      : tracks[0]?.slug;
  const [selected, setSelected] = useState(initialTrack);

  const track = tracks.find((t) => t.slug === selected) ?? tracks[0];

  // Modules collapsed state — keyed by module id. Default: expanded.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/dashboard" className="block">
          <div className="font-serif text-2xl leading-none text-gold">SFMA</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-tmuted">
            Courses
          </div>
        </Link>
      </div>

      {/* Track switcher pills */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.slug)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
              t.slug === selected
                ? "border-gold/60 bg-gold/15 text-gold"
                : "border-border bg-transparent text-tmuted hover:border-tfaint hover:text-tprimary",
            )}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="mx-4 border-t border-border" />

      {/* Tree */}
      <nav className="scroll-area flex-1 overflow-y-auto px-2 py-3">
        {track?.modules.length === 0 && (
          <p className="px-3 py-2 text-[13px] text-tfaint">No lessons yet.</p>
        )}
        {track?.modules.map((m) => {
          const isCollapsed = collapsed.has(m.id);
          return (
            <div key={m.id} className="mb-1">
              <button
                onClick={() => toggle(m.id)}
                className="group flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-[13.5px] font-semibold text-tprimary transition-colors hover:bg-surface/60"
              >
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-tmuted transition-transform",
                    !isCollapsed && "rotate-90",
                  )}
                />
                <span className="truncate">{m.title}</span>
              </button>

              {!isCollapsed && (
                <ul className="mb-1 ml-[18px] border-l border-border">
                  {m.lessons.map((l) => {
                    const isActive = l.id === activeLessonId;
                    const isDone = completedSet.has(l.id);
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/learn/${track.slug}/${m.slug}/${l.slug}`}
                          className={cn(
                            "group -ml-px flex items-center gap-2 border-l-2 py-1.5 pl-3 pr-2 text-[13.5px] transition-colors",
                            isActive
                              ? "border-gold bg-gold/10 text-tprimary"
                              : "border-transparent text-tmuted hover:text-tprimary",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
                              isDone
                                ? "border-gold bg-gold text-bg"
                                : "border-tfaint bg-transparent",
                            )}
                          >
                            {isDone && <Check className="h-2.5 w-2.5" />}
                          </span>
                          <span className="truncate">{l.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                  {m.lessons.length === 0 && (
                    <li className="py-1 pl-3 text-[12.5px] text-tfaint">
                      No lessons
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[12px] font-semibold text-gold">
            {initials(user.name, user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-tprimary">
              {user.name || user.email}
            </div>
            <div className="truncate text-[11px] text-tmuted">
              {user.role === "staff" ? "Staff" : "Student"}
            </div>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="rounded-md p-1.5 text-tmuted transition-colors hover:bg-surface hover:text-tprimary"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        {user.role === "staff" && (
          <Link
            href="/admin"
            className="mt-2 block rounded-md border border-border px-2.5 py-1.5 text-center text-[12px] font-medium text-tmuted transition-colors hover:border-gold/50 hover:text-gold"
          >
            Staff Admin
          </Link>
        )}
      </div>
    </div>
  );
}
