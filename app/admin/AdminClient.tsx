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
  deleteLesson,
  moveModule,
  moveLesson,
  toggleRole,
  createAnnouncement,
  deleteAnnouncement,
} from "./actions";
import {
  PlusIcon,
  TrashIcon,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from "@/components/icons";

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
  const [editing, setEditing] = useState<Lesson | null>(() => {
    for (const t of tree)
      for (const m of t.modules)
        for (const l of m.lessons) if (l.id === openLessonId) return l;
    return null;
  });

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }

  if (editing) {
    return <BlockEditor lesson={editing} onClose={() => setEditing(null)} />;
  }

  return (
    <div className="space-y-8">
      {tree.map((track) => (
        <section key={track.id}>
          <h2 className="mb-3 font-serif text-2xl text-tprimary">
            {track.title}
          </h2>

          <div className="space-y-2.5">
            {track.modules.map((m, mi) => (
              <div
                key={m.id}
                className="overflow-hidden rounded-xl border border-border bg-surface"
              >
                <div className="flex items-center gap-2 border-b border-border bg-bg/40 px-3 py-2">
                  <span className="text-[15px] font-semibold text-tprimary">
                    {m.title}
                  </span>
                  <span className="text-[11.5px] text-tfaint">
                    Unit · {m.lessons.length} chapters
                  </span>
                  <div className="ml-auto flex items-center gap-0.5">
                    <MiniBtn
                      onClick={() => run(() => moveModule(m.id, -1))}
                      disabled={mi === 0}
                      title="Move unit up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </MiniBtn>
                    <MiniBtn
                      onClick={() => run(() => moveModule(m.id, 1))}
                      disabled={mi === track.modules.length - 1}
                      title="Move unit down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </MiniBtn>
                    <MiniBtn
                      danger
                      title="Delete unit"
                      onClick={() => {
                        if (
                          confirm(
                            `Delete unit “${m.title}” and all its chapters?`,
                          )
                        )
                          run(() => deleteModule(m.id));
                      }}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </MiniBtn>
                  </div>
                </div>

                <ul className="divide-y divide-border">
                  {m.lessons.map((l, li) => (
                    <li
                      key={l.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-bg/40"
                    >
                      <button
                        onClick={() => setEditing(l)}
                        className="group flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-tfaint" />
                        <span className="truncate text-[13.5px] text-tprimary group-hover:text-gold">
                          {l.title}
                        </span>
                        <span className="shrink-0 text-[11.5px] text-tfaint">
                          {countProblems(l.content)} problems
                        </span>
                      </button>
                      <div className="flex items-center gap-0.5">
                        <MiniBtn
                          onClick={() => run(() => moveLesson(l.id, -1))}
                          disabled={li === 0}
                          title="Move chapter up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </MiniBtn>
                        <MiniBtn
                          onClick={() => run(() => moveLesson(l.id, 1))}
                          disabled={li === m.lessons.length - 1}
                          title="Move chapter down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </MiniBtn>
                        <MiniBtn
                          onClick={() => setEditing(l)}
                          title="Edit chapter"
                        >
                          <span className="text-[11px] font-medium">Edit</span>
                        </MiniBtn>
                        <MiniBtn
                          danger
                          title="Delete chapter"
                          onClick={() => {
                            if (confirm(`Delete chapter “${l.title}”?`))
                              run(() => deleteLesson(l.id));
                          }}
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </MiniBtn>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-border px-3 py-2">
                  <InlineAdd
                    placeholder="New chapter title…"
                    onAdd={(title) => run(() => createLesson(m.id, title))}
                  />
                </div>
              </div>
            ))}

            {/* Add unit */}
            <div className="rounded-xl border border-dashed border-border-strong bg-surface/50 px-3 py-2.5">
              <InlineAdd
                placeholder="New unit title…"
                button="Add Unit"
                onAdd={(title) => run(() => createModule(track.id, title))}
              />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function MiniBtn({
  children,
  onClick,
  disabled,
  danger,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-md px-1.5 py-1 transition-colors disabled:opacity-30 ${
        danger
          ? "text-tmuted hover:bg-danger/10 hover:text-danger"
          : "text-tmuted hover:bg-bg hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}

function InlineAdd({
  placeholder,
  button = "Add Chapter",
  onAdd,
}: {
  placeholder: string;
  button?: string;
  onAdd: (title: string) => void;
}) {
  const [value, setValue] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = value.trim();
    if (!t) return;
    onAdd(t);
    setValue("");
  }
  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <PlusIcon className="h-3.5 w-3.5 shrink-0 text-gold" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-tprimary outline-none placeholder:text-tfaint"
      />
      {value.trim() && (
        <button
          type="submit"
          className="shrink-0 rounded-md bg-gold px-2.5 py-1 text-[11.5px] font-semibold text-white transition-colors hover:bg-gold-hover"
        >
          {button}
        </button>
      )}
    </form>
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
        className="card rounded-2xl p-5"
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
          <p className="mt-2 text-[12.5px] text-danger">{error}</p>
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
            className="card rounded-2xl px-5 py-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-lg text-tprimary">{a.title}</h3>
              <div className="flex items-center gap-3">
                <time className="text-[11.5px] text-tfaint">
                  {formatDate(a.created_at)}
                </time>
                <button
                  onClick={() => remove(a.id)}
                  className="rounded-md p-1 text-tmuted transition-colors hover:bg-danger/10 hover:text-danger"
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
