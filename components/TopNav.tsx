"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { NavTrack } from "@/lib/nav";
import { trackTheme } from "@/lib/trackTheme";
import { createClient } from "@/lib/supabase/client";
import { cn, initials } from "@/lib/utils";
import { avatarUrl } from "@/lib/cloudinary";
import { MaturityDot } from "@/components/MaturityBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/Brand";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Menu,
  Close,
  BookOpen,
  ListChecks,
  Settings,
  LogOut,
  GraduationCap,
} from "@/components/icons";

export interface NavUser {
  name: string;
  email: string;
  isStaff: boolean;
  avatarUrl?: string | null;
}

interface TopNavProps {
  tracks: NavTrack[];
  user: NavUser | null;
}

export function TopNav({ tracks, user }: TopNavProps) {
  const pathname = usePathname() || "/";
  const [learnOpen, setLearnOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const learnRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (learnRef.current && !learnRef.current.contains(e.target as Node))
        setLearnOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Cmd/Ctrl+K opens search.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close menus on navigation.
  useEffect(() => {
    setLearnOpen(false);
    setProfileOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="bar sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-1 px-4 sm:px-6">
          {/* Logo — always returns to the landing page. */}
          <Link href="/" className="group flex items-center gap-2.5 pr-2">
            <BrandMark className="h-9 w-9 shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105" />
            <span className="hidden items-center gap-2 sm:flex">
              <span className="text-[16px] font-extrabold tracking-tight text-tprimary">SFMA</span>
              <span className="h-3.5 w-px bg-border-strong" />
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.13em] text-tmuted">
                Math Academy
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
            {user && <NavLink href="/dashboard" active={isActive("/dashboard")}>Dashboard</NavLink>}

            {/* Learn dropdown */}
            <div ref={learnRef} className="relative">
              <button
                onClick={() => setLearnOpen((o) => !o)}
                className={cn(
                  "relative flex items-center gap-1 rounded-lg px-3 py-2 text-[14px] transition-colors",
                  pathname.startsWith("/learn")
                    ? "font-semibold text-tprimary"
                    : "font-medium text-tmuted hover:text-tprimary",
                )}
              >
                Learn
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", learnOpen && "rotate-180")} />
                {pathname.startsWith("/learn") && (
                  <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-gold" />
                )}
              </button>
              {learnOpen && (
                <div className="menu-pop panel-pop absolute left-0 top-full mt-2.5 w-[330px] overflow-hidden p-2">
                  <div className="px-3 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-tfaint">
                    Courses
                  </div>
                  {tracks.map((t) => {
                    const theme = trackTheme(t.slug);
                    const chapters = t.modules.reduce((a, m) => a + m.lessons.length, 0);
                    return (
                      <Link
                        key={t.id}
                        href={user ? `/learn/${t.slug}` : "/auth"}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-bg"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-border"
                          style={{ backgroundColor: theme.tint, color: theme.banner }}
                        >
                          <BookOpen className="h-[18px] w-[18px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-semibold text-tprimary">{t.title}</div>
                          <div className="text-[12px] text-tmuted">
                            <span style={{ color: theme.banner }}>{theme.tag}</span> · {chapters} chapters
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 -translate-x-1 text-tfaint opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <NavLink href="/problems" active={isActive("/problems")}>Problems</NavLink>
            <NavLink href="/team" active={isActive("/team")}>Team</NavLink>
            <NavLink href="/about" active={isActive("/about")}>About</NavLink>
            <a
              href="https://sfmathacademy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-2 text-[14px] font-medium text-tmuted transition-colors hover:text-tprimary"
            >
              Classes
            </a>
          </nav>

          <div className="flex-1" />

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-tfaint transition-colors hover:border-border-strong sm:flex"
          >
            <Search className="h-4 w-4" />
            <span className="pr-6">Search lessons…</span>
            <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10.5px] font-semibold text-tmuted">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-tmuted transition-colors hover:text-tprimary sm:hidden"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          <div className="mx-1.5 hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Profile / sign-in */}
          {user ? (
            <div ref={profileRef} className="relative hidden lg:block">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-[12.5px] font-bold text-gold ring-1 ring-inset ring-gold/25 transition-all hover:scale-105 hover:bg-gold/20"
                aria-label="Account menu"
                data-tip="Account"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl(user.avatarUrl, 72)}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials(user.name, user.email)
                )}
              </button>
              {profileOpen && (
                <div className="menu-pop panel-pop absolute right-0 top-full mt-2 w-60 overflow-hidden py-1.5">
                  <div className="border-b border-border px-4 py-2.5">
                    <div className="truncate text-[13.5px] font-semibold text-tprimary">{user.name}</div>
                    <div className="truncate text-[12px] text-tmuted">{user.email}</div>
                  </div>
                  <MenuLink href="/dashboard" icon={<GraduationCap className="h-4 w-4" />}>Dashboard</MenuLink>
                  <MenuLink href="/settings" icon={<Settings className="h-4 w-4" />}>Settings</MenuLink>
                  {user.isStaff && (
                    <MenuLink href="/admin" icon={<ListChecks className="h-4 w-4" />}>Staff Admin</MenuLink>
                  )}
                  <button
                    onClick={async () => {
                      await createClient().auth.signOut();
                      window.location.href = "/";
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13.5px] text-tmuted transition-colors hover:bg-bg hover:text-danger"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="btn-3d ml-1.5 hidden px-4 py-2 text-[13.5px] lg:inline-flex"
            >
              Sign in
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg border border-border text-tprimary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="panel absolute right-0 top-0 h-full w-[300px] overflow-y-auto rounded-none p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[15px] font-extrabold text-tprimary">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-tmuted hover:bg-bg">
                <Close className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {user && <MobileLink href="/dashboard">Dashboard</MobileLink>}
              <div className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-tfaint">Courses</div>
              {tracks.map((t) => (
                <MobileLink key={t.id} href={user ? `/learn/${t.slug}` : "/auth"}>{t.title}</MobileLink>
              ))}
              <div className="my-2 border-t border-border" />
              <MobileLink href="/problems">Problems</MobileLink>
              <MobileLink href="/team">Team</MobileLink>
              <MobileLink href="/about">About</MobileLink>
              <a href="https://sfmathacademy.com" target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-2.5 text-[14.5px] font-medium text-tmuted">Classes ↗</a>
              {user?.isStaff && <MobileLink href="/admin">Staff Admin</MobileLink>}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <ThemeToggle />
              {user ? (
                <button
                  onClick={async () => {
                    await createClient().auth.signOut();
                    window.location.href = "/";
                  }}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[13.5px] font-medium text-tmuted"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              ) : (
                <Link href="/auth" className="btn-3d px-4 py-2 text-[13.5px]">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {searchOpen && (
        <SearchModal tracks={tracks} loggedIn={!!user} onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-lg px-3 py-2 text-[14px] transition-colors",
        active ? "font-semibold text-tprimary" : "font-medium text-tmuted hover:text-tprimary",
      )}
    >
      {children}
      {active && <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-gold" />}
    </Link>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 px-4 py-2 text-[13.5px] text-tmuted transition-colors hover:bg-bg hover:text-tprimary">
      {icon}
      {children}
    </Link>
  );
}

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-lg px-3 py-2.5 text-[14.5px] font-medium text-tprimary transition-colors hover:bg-bg">
      {children}
    </Link>
  );
}

/** Lightweight client-side ⌘K search over all lesson titles. */
function SearchModal({
  tracks,
  loggedIn,
  onClose,
}: {
  tracks: NavTrack[];
  loggedIn: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const flat: {
      title: string;
      track: string;
      href: string;
      maturity: NavTrack["modules"][number]["lessons"][number]["maturity"];
    }[] = [];
    for (const t of tracks)
      for (const m of t.modules)
        for (const l of m.lessons)
          flat.push({
            title: l.title,
            track: `${t.title} · ${m.title}`,
            href: loggedIn ? `/learn/${t.slug}/${m.slug}/${l.slug}` : "/auth",
            maturity: l.maturity,
          });
    const needle = q.trim().toLowerCase();
    if (!needle) return flat.slice(0, 8);
    return flat
      .filter((r) => r.title.toLowerCase().includes(needle) || r.track.toLowerCase().includes(needle))
      .slice(0, 10);
  }, [q, tracks, loggedIn]);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="glass menu-pop relative w-full max-w-xl overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <Search className="h-[18px] w-[18px] text-tfaint" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lessons…"
            className="flex-1 bg-transparent text-[15px] text-tprimary outline-none placeholder:text-tfaint"
          />
          <kbd className="rounded border border-border bg-bg px-1.5 py-0.5 text-[10.5px] font-semibold text-tmuted">Esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13.5px] text-tfaint">No lessons match “{q}”.</div>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                onClick={() => {
                  onClose();
                  router.push(r.href);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-bg"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium text-tprimary">{r.title}</div>
                  <div className="truncate text-[12px] text-tmuted">{r.track}</div>
                </div>
                {r.maturity !== "stable" && <MaturityDot maturity={r.maturity} />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
