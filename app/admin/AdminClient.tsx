"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TrackWithModules } from "@/lib/data";
import type { Announcement, Lesson, Profile } from "@/lib/types";
import { cn, formatDate, countProblems } from "@/lib/utils";
import { BlockEditor } from "./BlockEditor";
import {
  createModule,
  createLesson,
  deleteModule,
  updateModule,
  toggleRole,
  createAnnouncement,
  deleteAnnouncement,
} from "./actions";
import { PlusIcon, TrashIcon, ChevronRight } from "@/components/icons";

type Tab = "content" | "students" | "announcements";

interface AdminClientProps {
  tree: TrackWithModules[];
  profiles: (Profile & { completedCount: number })[];
  announcements: Announcement[];
  totalLessons: number;
  openLessonId: string | null;
}

export function AdminClient({
  tree,
  profiles,
  announcements,
  totalLessons,
  openLessonId,
}: AdminClientProps) {
  const [tab, setTab] = useState<Tab>("content");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-serif text-2xl text-gold">
            SFMA
          </Link>
          <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
            Staff Admin
          </span>
        </div>
        <Link
          href="/dashboard"
          className="text-[13px] text-tmuted transition-colors hover:text-tprimary"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="mx-auto max-w-[1000px] px-6 py-8 sm:px-10">
        {/* Tabs */}
        <div className="mb-7 flex gap-1 border-b border-border">
          {(["content", "students", "announcements"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-[12.5px] font-semibold uppercase tracking-wide transition-colors",
                tab === t
                  ? "border-gold text-gold"
                  : "border-transparent text-tmuted hover:text-tprimary",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "content" && (
          <ContentTab tree={tree} openLessonId={openLessonId} />
        )}
        {tab === "students" && (
          <StudentsTab profiles={profiles} totalLessons={totalLessons} />
        )}
        {tab === "announcements" && (
          <AnnouncementsTab announcements={announcements} />
        )}
      </div>
    </div>
  );
}

/* ---------------- Content ---------------- */

function ContentTab({
  tree,
  openLessonId,
}: {
  tree: TrackWithModules[];
  openLessonId: string | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<Lesson | null>(
    () => {
      for (const t of tree)
        for (const m of t.modules)
          for (const l of m.lessons) if (l.id === openLessonId) return l;
      return null;
    },
  );

  function onNewModule(trackId: string) {
    const title = prompt("New module title:");
    if (!title?.trim()) return;
    startTransition(async () => {
      const res = await createModule(trackId, title.trim());
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }
  function onNewLesson(moduleId: string) {
    const title = prompt("New lesson title:");
    if (!title?.trim()) return;
    startTransition(async () => {
      const res = await createLesson(moduleId, title.trim());
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }
  function onDeleteModule(id: string, title: string) {
    if (!confirm(`Delete module “${title}” and all its lessons?`)) return;
    startTransition(async () => {
      const res = await deleteModule(id);
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }
  function onRenameModule(id: string, current: string) {
    const title = prompt("Rename module:", current);
    if (!title?.trim() || title === current) return;
    startTransition(async () => {
      const res = await updateModule(id, { title: title.trim() });
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }

  if (editing) {
    return (
      <BlockEditor lesson={editing} onClose={() => setEditing(null)} />
    );
  }

  return (
    <div className="space-y-7">
      {tree.map((track) => (
        <section key={track.id}>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-tprimary">{track.title}</h2>
            <button
              onClick={() => onNewModule(track.id)}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-tmuted transition-colors hover:border-gold/50 hover:text-gold"
            >
              <PlusIcon className="h-3.5 w-3.5" /> New Module
            </button>
          </div>

          <div className="space-y-2.5">
            {track.modules.length === 0 && (
              <p className="rounded-xl border border-dashed border-border px-4 py-5 text-[13px] text-tfaint">
                No modules yet.
              </p>
            )}
            {track.modules.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => onRenameModule(m.id, m.title)}
                    className="text-left text-[15px] font-semibold text-tprimary hover:text-gold"
                    title="Rename module"
                  >
                    {m.title}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onNewLesson(m.id)}
                      className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[12px] font-medium text-tmuted transition-colors hover:border-gold/50 hover:text-gold"
                    >
                      <PlusIcon className="h-3 w-3" /> New Lesson
                    </button>
                    <button
                      onClick={() => onDeleteModule(m.id, m.title)}
                      className="rounded-md p-1.5 text-tmuted transition-colors hover:bg-[#e0566b]/10 hover:text-[#e0566b]"
                      title="Delete module"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <ul className="mt-2 divide-y divide-border border-t border-border">
                  {m.lessons.map((l) => (
                    <li key={l.id}>
                      <button
                        onClick={() => setEditing(l)}
                        className="group flex w-full items-center gap-2 py-2 text-left"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-tfaint" />
                        <span className="flex-1 text-[13.5px] text-tprimary group-hover:text-gold">
                          {l.title}
                        </span>
                        <span className="text-[11.5px] text-tfaint">
                          {countProblems(l.content)} problems
                        </span>
                      </button>
                    </li>
                  ))}
                  {m.lessons.length === 0 && (
                    <li className="py-2 text-[12.5px] text-tfaint">
                      No lessons yet.
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------------- Students ---------------- */

function StudentsTab({
  profiles,
  totalLessons,
}: {
  profiles: (Profile & { completedCount: number })[];
  totalLessons: number;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function flip(p: Profile) {
    const role = p.role === "staff" ? "student" : "staff";
    setPendingId(p.id);
    startTransition(async () => {
      const res = await toggleRole(p.id, role);
      setPendingId(null);
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border bg-surface text-left text-tmuted">
            <th className="px-4 py-2.5 font-medium">Name</th>
            <th className="px-4 py-2.5 font-medium">Email</th>
            <th className="px-4 py-2.5 font-medium">Role</th>
            <th className="px-4 py-2.5 font-medium">Joined</th>
            <th className="px-4 py-2.5 font-medium">Progress</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5 text-tprimary">
                {p.full_name || "—"}
              </td>
              <td className="px-4 py-2.5 text-tmuted">{p.email}</td>
              <td className="px-4 py-2.5">
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    p.role === "staff"
                      ? "bg-gold/15 text-gold"
                      : "bg-surface text-tmuted",
                  )}
                >
                  {p.role}
                </span>
              </td>
              <td className="px-4 py-2.5 text-tmuted">
                {formatDate(p.created_at)}
              </td>
              <td className="px-4 py-2.5 text-tmuted">
                {p.completedCount}/{totalLessons}
              </td>
              <td className="px-4 py-2.5 text-right">
                <button
                  onClick={() => flip(p)}
                  disabled={pendingId === p.id}
                  className="rounded-lg border border-border px-2.5 py-1 text-[12px] font-medium text-tmuted transition-colors hover:border-gold/50 hover:text-gold disabled:opacity-50"
                >
                  Make {p.role === "staff" ? "student" : "staff"}
                </button>
              </td>
            </tr>
          ))}
          {profiles.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-tfaint">
                No users yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Announcements ---------------- */

function AnnouncementsTab({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function post(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createAnnouncement(title.trim(), body.trim());
      if (res.ok) {
        setTitle("");
        setBody("");
        router.refresh();
      } else {
        setError(res.error ?? "Failed");
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    startTransition(async () => {
      const res = await deleteAnnouncement(id);
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={post}
        className="rounded-2xl border border-border bg-surface p-5"
      >
        <h3 className="mb-3 font-serif text-xl text-tprimary">
          Post Announcement
        </h3>
        <input
          className="mb-3 w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[14px] text-tprimary outline-none placeholder:text-tfaint focus:border-gold"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="min-h-[100px] w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[14px] text-tprimary outline-none placeholder:text-tfaint focus:border-gold"
          placeholder="Write your announcement…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {error && (
          <p className="mt-2 text-[12.5px] text-[#e0566b]">{error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-3 rounded-lg bg-gold px-5 py-2 text-[13.5px] font-semibold text-bg transition-colors hover:bg-gold-hover disabled:opacity-60"
        >
          {pending ? "Posting…" : "Post"}
        </button>
      </form>

      <div className="space-y-3">
        {announcements.map((a) => (
          <article
            key={a.id}
            className="rounded-2xl border border-border bg-surface px-5 py-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-lg text-tprimary">{a.title}</h3>
              <div className="flex items-center gap-3">
                <time className="text-[11.5px] text-tfaint">
                  {formatDate(a.created_at)}
                </time>
                <button
                  onClick={() => remove(a.id)}
                  className="rounded-md p-1 text-tmuted transition-colors hover:bg-[#e0566b]/10 hover:text-[#e0566b]"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-tmuted">
              {a.body}
            </p>
          </article>
        ))}
        {announcements.length === 0 && (
          <p className="text-[13px] text-tfaint">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}
