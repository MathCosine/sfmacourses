"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  CalloutVariant,
  ContentBlock,
  Difficulty,
  Frequency,
  Lesson,
  Maturity,
} from "@/lib/types";
import { CALLOUT_LABELS, CALLOUT_VARIANTS, DIFFICULTIES } from "@/lib/types";
import { MATURITY_META, MATURITY_OPTIONS } from "@/lib/maturity";
import type { PreparedBlock } from "@/lib/prepare";
import type { LessonLink, ModuleLink } from "@/lib/data";
import { contentBlocks, extractMeta, cn } from "@/lib/utils";
import {
  uploadToCloudinary,
  cloudinaryConfigured,
  optimizedImageUrl,
} from "@/lib/cloudinary";
import {
  updateLesson,
  deleteLesson,
  renderLessonPreview,
  addCrossListing,
  removeCrossListing,
} from "./actions";
import { MarkdownField } from "@/components/admin/MarkdownField";
import { BlockPreview } from "@/components/admin/BlockPreview";
import {
  ArrowUp,
  ArrowDown,
  TrashIcon,
  PlusIcon,
  Check,
  Pencil,
  Close,
  Link2,
  Search,
  Milestone,
  Layers,
  ImageIcon,
} from "@/components/icons";

export const BLOCK_LABEL: Record<ContentBlock["type"], string> = {
  text: "Text",
  resource: "Resource",
  problem: "Problem",
  section: "Section",
  video: "Video",
  image: "Image",
  callout: "Environment",
};

export const BLOCK_HINT: Record<ContentBlock["type"], string> = {
  text: "Prose with markdown + LaTeX.",
  resource: "A linked reference card.",
  problem: "A practice problem with a status circle.",
  section: "A heading that appears in the contents and carries its own status.",
  video: "An embedded YouTube or Vimeo video.",
  image: "An uploaded diagram or figure (PNG/JPG/SVG).",
  callout: "A styled box: theorem, big idea, recipe, example, note or warning.",
};

export const ADD_ORDER: ContentBlock["type"][] = [
  "text",
  "section",
  "callout",
  "problem",
  "image",
  "resource",
  "video",
];

function emptyBlock(type: ContentBlock["type"]): ContentBlock {
  switch (type) {
    case "text":
      return { type: "text", content: "" };
    case "resource":
      return { type: "resource", source: "AoPS", stars: 5, title: "", description: "" };
    case "problem":
      return {
        type: "problem",
        title: "",
        source: "",
        difficulty: "Easy",
        statement: "",
        hint: "",
        solution: "",
      };
    case "section":
      return { type: "section", title: "" };
    case "video":
      return { type: "video", url: "", title: "", caption: "" };
    case "image":
      return { type: "image", url: "", alt: "", caption: "" };
    case "callout":
      return { type: "callout", variant: "theorem", title: "", body: "" };
  }
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] text-tprimary outline-none transition-colors placeholder:text-tfaint focus:border-gold";
const labelCls = "mb-1 block text-[11.5px] font-medium text-tmuted";

export function BlockEditor({
  lesson,
  catalog,
  moduleCatalog,
  initialCrossModuleIds,
  onClose,
  onDirtyChange,
  onRegisterAdd,
}: {
  lesson: Lesson;
  catalog: LessonLink[];
  moduleCatalog: ModuleLink[];
  initialCrossModuleIds: string[];
  onClose: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onRegisterAdd?: (fn: ((type: ContentBlock["type"]) => void) | null) => void;
}) {
  const router = useRouter();
  const meta = extractMeta(lesson.content);
  const [title, setTitle] = useState(lesson.title);
  const [author, setAuthor] = useState(meta.author);
  const [frequency, setFrequency] = useState<Frequency>(meta.frequency);
  const [prereqNote, setPrereqNote] = useState(meta.prereqNote);
  const [prereqLessonIds, setPrereqLessonIds] = useState<string[]>(
    meta.prereqLessonIds,
  );
  const [maturity, setMaturity] = useState<Maturity>(meta.maturity);
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    contentBlocks(lesson.content),
  );
  const [editing, setEditing] = useState<number | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [prepared, setPrepared] = useState<PreparedBlock[]>([]);
  const [rendering, setRendering] = useState(true);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  // Live "wiki" preview — re-rendered (debounced) whenever the blocks change.
  useEffect(() => {
    let active = true;
    setRendering(true);
    const t = setTimeout(async () => {
      try {
        const out = await renderLessonPreview(blocks);
        if (active) setPrepared(out);
      } finally {
        if (active) setRendering(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [blocks]);

  // Let a parent (the admin navigator) know when there are unsaved edits.
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  // Expose a "append a block and edit it" handler so the admin sidebar can
  // act as the block palette while a chapter is open.
  useEffect(() => {
    onRegisterAdd?.((type) => add(type, blocks.length));
    return () => onRegisterAdd?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.length, onRegisterAdd]);

  function update(updater: (prev: ContentBlock[]) => ContentBlock[]) {
    setBlocks(updater);
    setDirty(true);
  }
  function patchBlock(i: number, patch: Partial<ContentBlock>) {
    update((prev) =>
      prev.map((b, idx) => (idx === i ? ({ ...b, ...patch } as ContentBlock) : b)),
    );
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    update((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setEditing((cur) =>
      cur === i ? j : cur === j ? i : cur,
    );
  }
  function remove(i: number) {
    update((prev) => prev.filter((_, idx) => idx !== i));
    setEditing((cur) =>
      cur === null ? null : cur === i ? null : cur > i ? cur - 1 : cur,
    );
  }
  function add(type: ContentBlock["type"], at: number) {
    update((prev) => {
      const next = [...prev];
      next.splice(at, 0, emptyBlock(type));
      return next;
    });
    setInsertAt(null);
    setEditing(at);
  }

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await updateLesson(lesson.id, {
        title,
        content: blocks,
        author,
        frequency,
        prereqNote,
        prereqLessonIds,
        maturity,
      });
      if (res.ok) {
        setMsg("Saved ✓");
        setDirty(false);
        router.refresh();
      } else {
        setMsg(res.error ?? "Save failed");
      }
    });
  }

  function onDelete() {
    if (!confirm(`Delete chapter “${lesson.title}”? This cannot be undone.`))
      return;
    startTransition(async () => {
      const res = await deleteLesson(lesson.id);
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setMsg(res.error ?? "Delete failed");
      }
    });
  }

  return (
    <div>
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 -mx-2 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-bg/95 px-2 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-tmuted transition-colors hover:text-tprimary"
          >
            ← Back
          </button>
          <h3 className="font-serif text-lg text-tprimary">Edit Chapter</h3>
          {rendering ? (
            <span className="text-[11.5px] text-tfaint">rendering…</span>
          ) : dirty ? (
            <span className="text-[11.5px] text-tfaint">unsaved changes</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {msg && (
            <span
              className={`text-[12.5px] ${
                msg.startsWith("Saved") ? "text-green" : "text-danger"
              }`}
            >
              {msg}
            </span>
          )}
          <button
            onClick={onDelete}
            disabled={pending}
            className="rounded-lg border border-danger/40 px-3 py-1.5 text-[12.5px] font-medium text-danger transition-colors hover:bg-danger/10"
          >
            Delete
          </button>
          <button
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-gold px-4 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-gold-hover disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Chapter meta */}
      <div className="mb-2 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className={labelCls}>Chapter title</label>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
          />
        </div>
        <div>
          <label className={labelCls}>Author</label>
          <input
            className={inputCls}
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
              setDirty(true);
            }}
          />
        </div>
        <div>
          <label className={labelCls}>Frequency</label>
          <select
            className={inputCls}
            value={frequency}
            onChange={(e) => {
              setFrequency(e.target.value as Frequency);
              setDirty(true);
            }}
          >
            <option value="essential">● Essential</option>
            <option value="important">●● Important</option>
            <option value="supplemental">●●● Supplemental</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Readiness</label>
          <select
            className={inputCls}
            value={maturity}
            onChange={(e) => {
              setMaturity(e.target.value as Maturity);
              setDirty(true);
            }}
          >
            {MATURITY_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {MATURITY_META[m].label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] leading-snug text-tfaint">
            {MATURITY_META[maturity].desc}
          </p>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="mb-2 rounded-xl border border-border bg-surface p-4">
        <div className="mb-1 flex items-center gap-2">
          <Milestone className="h-4 w-4 text-gold" />
          <span className="text-[13px] font-semibold text-tprimary">
            Recommended prerequisites
          </span>
          <span className="text-[11.5px] text-tfaint">optional</span>
        </div>
        <p className="mb-3 text-[12px] text-tmuted">
          Shown to readers at the top of the chapter. Write any topics they
          should know (bullet lists work), and/or link chapters from anywhere on
          the site.
        </p>
        <div className="mb-3">
          <label className={labelCls}>Topics / notes</label>
          <MarkdownField
            value={prereqNote}
            onChange={(v) => {
              setPrereqNote(v);
              setDirty(true);
            }}
            minHeight={70}
            placeholder={"e.g.\n- Comfort with fractions and percents\n- Basic factoring"}
          />
        </div>
        <LessonLinker
          catalog={catalog}
          selectedIds={prereqLessonIds}
          currentLessonId={lesson.id}
          onChange={(ids) => {
            setPrereqLessonIds(ids);
            setDirty(true);
          }}
        />
      </div>

      {/* Cross-listing */}
      <div className="mb-2 rounded-xl border border-border bg-surface p-4">
        <div className="mb-1 flex items-center gap-2">
          <Layers className="h-4 w-4 text-gold" />
          <span className="text-[13px] font-semibold text-tprimary">
            Also list this chapter in…
          </span>
          <span className="text-[11.5px] text-tfaint">optional</span>
        </div>
        <p className="mb-3 text-[12px] text-tmuted">
          Add this chapter to other courses or units. It stays a single page —
          edits and student progress are shared everywhere it appears. Changes
          here save immediately.
        </p>
        <CrossListEditor
          lessonId={lesson.id}
          homeModuleId={lesson.module_id}
          moduleCatalog={moduleCatalog}
          initialIds={initialCrossModuleIds}
        />
      </div>

      <p className="mb-3 px-1 text-[12px] text-tfaint">
        This is how the page looks on the site. Hover a block to edit, move or
        delete it; use the <span className="font-semibold text-tmuted">+</span>{" "}
        buttons to insert.
      </p>

      {/* The page (wiki preview + inline editing) */}
      <div>
        {blocks.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-[13px] text-tfaint">
            This chapter is empty — insert a block below to start building.
          </div>
        )}

        {blocks.map((block, i) => (
          <Fragment key={i}>
            <InsertBar
              open={insertAt === i}
              onToggle={() => setInsertAt((c) => (c === i ? null : i))}
              onPick={(t) => add(t, i)}
            />
            {editing === i ? (
              <EditCard
                block={block}
                prepared={prepared[i]}
                onPatch={(patch) => patchBlock(i, patch)}
                onDone={() => setEditing(null)}
                onMoveUp={() => move(i, -1)}
                onMoveDown={() => move(i, 1)}
                onDelete={() => remove(i)}
                canUp={i > 0}
                canDown={i < blocks.length - 1}
              />
            ) : (
              <PreviewRow
                label={BLOCK_LABEL[block.type]}
                prepared={prepared[i]}
                onEdit={() => setEditing(i)}
                onMoveUp={() => move(i, -1)}
                onMoveDown={() => move(i, 1)}
                onDelete={() => remove(i)}
                canUp={i > 0}
                canDown={i < blocks.length - 1}
              />
            )}
          </Fragment>
        ))}

        <InsertBar
          open={insertAt === blocks.length}
          onToggle={() =>
            setInsertAt((c) => (c === blocks.length ? null : blocks.length))
          }
          onPick={(t) => add(t, blocks.length)}
          alwaysVisible
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Insert */

function InsertBar({
  open,
  onToggle,
  onPick,
  alwaysVisible,
}: {
  open: boolean;
  onToggle: () => void;
  onPick: (type: ContentBlock["type"]) => void;
  alwaysVisible?: boolean;
}) {
  return (
    <div className={`group/insert relative my-1 ${alwaysVisible ? "" : ""}`}>
      {!open ? (
        <div className="flex items-center">
          <div
            className={`h-px flex-1 bg-border transition-opacity ${
              alwaysVisible ? "opacity-60" : "opacity-0 group-hover/insert:opacity-60"
            }`}
          />
          <button
            onClick={onToggle}
            title="Insert a block here"
            className={`mx-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-tmuted shadow-card transition-all hover:border-gold/50 hover:text-gold ${
              alwaysVisible
                ? "opacity-100"
                : "opacity-0 group-hover/insert:opacity-100"
            }`}
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
          <div
            className={`h-px flex-1 bg-border transition-opacity ${
              alwaysVisible ? "opacity-60" : "opacity-0 group-hover/insert:opacity-60"
            }`}
          />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-2.5 shadow-card">
          <span className="px-1 text-[11.5px] font-medium text-tmuted">Insert:</span>
          {ADD_ORDER.map((t) => (
            <button
              key={t}
              onClick={() => onPick(t)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-tprimary transition-colors hover:border-gold/50 hover:text-gold"
            >
              <PlusIcon className="h-3 w-3 text-gold" />
              {BLOCK_LABEL[t]}
            </button>
          ))}
          <button
            onClick={onToggle}
            title="Cancel"
            className="ml-auto rounded-md p-1.5 text-tfaint transition-colors hover:bg-bg hover:text-tprimary"
          >
            <Close className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Preview row */

function PreviewRow({
  label,
  prepared,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
  canUp,
  canDown,
}: {
  label: string;
  prepared: PreparedBlock | undefined;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canUp: boolean;
  canDown: boolean;
}) {
  return (
    <div className="group relative rounded-xl border border-transparent px-3 py-1 transition-colors hover:border-border hover:bg-surface-2/40">
      {/* Hover toolbar */}
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5 opacity-0 shadow-card transition-opacity group-hover:opacity-100">
        <span className="px-1.5 text-[10px] font-bold uppercase tracking-wide text-tfaint">
          {label}
        </span>
        <IconBtn onClick={onMoveUp} disabled={!canUp} title="Move up">
          <ArrowUp className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn onClick={onMoveDown} disabled={!canDown} title="Move down">
          <ArrowDown className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn onClick={onEdit} title="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn onClick={onDelete} danger title="Delete">
          <TrashIcon className="h-3.5 w-3.5" />
        </IconBtn>
      </div>

      <button
        onClick={onEdit}
        className="block w-full cursor-text text-left"
        title="Click to edit"
      >
        {prepared ? (
          <BlockPreview block={prepared} />
        ) : (
          <div className="py-3 text-[13px] text-tfaint">Rendering…</div>
        )}
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- Edit card */

function EditCard({
  block,
  prepared,
  onPatch,
  onDone,
  onMoveUp,
  onMoveDown,
  onDelete,
  canUp,
  canDown,
}: {
  block: ContentBlock;
  prepared: PreparedBlock | undefined;
  onPatch: (patch: Partial<ContentBlock>) => void;
  onDone: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canUp: boolean;
  canDown: boolean;
}) {
  return (
    <div className="rounded-xl border border-gold/40 bg-surface p-4 shadow-lift ring-1 ring-gold/15">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-gold/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
            {BLOCK_LABEL[block.type]}
          </span>
          <span className="hidden text-[11.5px] text-tfaint sm:inline">
            {BLOCK_HINT[block.type]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn onClick={onMoveUp} disabled={!canUp} title="Move up">
            <ArrowUp className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn onClick={onMoveDown} disabled={!canDown} title="Move down">
            <ArrowDown className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn onClick={onDelete} danger title="Delete block">
            <TrashIcon className="h-3.5 w-3.5" />
          </IconBtn>
          <button
            onClick={onDone}
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-gold-hover"
          >
            <Check className="h-3.5 w-3.5" /> Done
          </button>
        </div>
      </div>

      <BlockFields block={block} onChange={onPatch} />

      {/* Live block preview */}
      {prepared && (
        <div className="mt-4 border-t border-dashed border-border pt-3">
          <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-tfaint">
            Preview
          </div>
          <BlockPreview block={prepared} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------- Cross-list editor */

function CrossListEditor({
  lessonId,
  homeModuleId,
  moduleCatalog,
  initialIds,
}: {
  lessonId: string;
  homeModuleId: string;
  moduleCatalog: ModuleLink[];
  initialIds: string[];
}) {
  const [ids, setIds] = useState<string[]>(initialIds);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const byId = new Map(moduleCatalog.map((m) => [m.id, m]));
  const selected = ids
    .map((id) => byId.get(id))
    .filter((m): m is ModuleLink => !!m);

  const needle = q.trim().toLowerCase();
  const results = moduleCatalog
    .filter(
      (m) =>
        m.id !== homeModuleId &&
        !ids.includes(m.id) &&
        (!needle ||
          m.title.toLowerCase().includes(needle) ||
          m.trackTitle.toLowerCase().includes(needle)),
    )
    .slice(0, 8);

  function add(moduleId: string) {
    setErr(null);
    setQ("");
    setIds((prev) => [...prev, moduleId]); // optimistic
    startTransition(async () => {
      const res = await addCrossListing(lessonId, moduleId);
      if (!res.ok) {
        setIds((prev) => prev.filter((x) => x !== moduleId));
        setErr(res.error ?? "Could not add. Run supabase/cross-listings.sql.");
      }
    });
  }
  function remove(moduleId: string) {
    setErr(null);
    setIds((prev) => prev.filter((x) => x !== moduleId)); // optimistic
    startTransition(async () => {
      const res = await removeCrossListing(lessonId, moduleId);
      if (!res.ok) {
        setIds((prev) => [...prev, moduleId]);
        setErr(res.error ?? "Could not remove.");
      }
    });
  }

  return (
    <div>
      <label className={labelCls}>Appears in these units {busy && "· saving…"}</label>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 py-1 pl-2 pr-1 text-[12px] text-tprimary"
            >
              <Layers className="h-3.5 w-3.5 text-gold" />
              <span className="font-medium">{m.title}</span>
              <span className="text-tfaint">· {m.trackTitle}</span>
              <button
                onClick={() => remove(m.id)}
                title="Remove from this unit"
                className="rounded p-0.5 text-tfaint transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Close className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <Search className="h-4 w-4 text-tfaint" />
          <input
            value={q}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search a course/unit to add this chapter to…"
            className="flex-1 bg-transparent text-[13px] text-tprimary outline-none placeholder:text-tfaint"
          />
        </div>
        {open && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-lift">
            {results.map((m) => (
              <button
                key={m.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(m.id);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-bg"
              >
                <PlusIcon className="h-3.5 w-3.5 shrink-0 text-gold" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-tprimary">
                    {m.title}
                  </span>
                  <span className="block truncate text-[11.5px] text-tmuted">
                    {m.trackTitle}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {err && <p className="mt-2 text-[12px] text-danger">{err}</p>}
    </div>
  );
}

/* ---------------------------------------------------------- Lesson linker */

function LessonLinker({
  catalog,
  selectedIds,
  currentLessonId,
  onChange,
}: {
  catalog: LessonLink[];
  selectedIds: string[];
  currentLessonId: string;
  onChange: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const byId = new Map(catalog.map((l) => [l.id, l]));
  const selected = selectedIds
    .map((id) => byId.get(id))
    .filter((l): l is LessonLink => !!l);

  const needle = q.trim().toLowerCase();
  const results = catalog
    .filter(
      (l) =>
        l.id !== currentLessonId &&
        !selectedIds.includes(l.id) &&
        (!needle ||
          l.title.toLowerCase().includes(needle) ||
          l.trackTitle.toLowerCase().includes(needle) ||
          l.moduleTitle.toLowerCase().includes(needle)),
    )
    .slice(0, 8);

  function addId(id: string) {
    onChange([...selectedIds, id]);
    setQ("");
  }
  function removeId(id: string) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  return (
    <div>
      <label className={labelCls}>Linked chapters</label>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((l) => (
            <span
              key={l.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 py-1 pl-2 pr-1 text-[12px] text-tprimary"
            >
              <Link2 className="h-3.5 w-3.5 text-gold" />
              <span className="font-medium">{l.title}</span>
              <span className="text-tfaint">· {l.trackTitle}</span>
              <button
                onClick={() => removeId(l.id)}
                title="Remove"
                className="rounded p-0.5 text-tfaint transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Close className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <Search className="h-4 w-4 text-tfaint" />
          <input
            value={q}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search any chapter to link as a prerequisite…"
            className="flex-1 bg-transparent text-[13px] text-tprimary outline-none placeholder:text-tfaint"
          />
        </div>
        {open && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-lift">
            {results.map((l) => (
              <button
                key={l.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addId(l.id);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-bg"
              >
                <PlusIcon className="h-3.5 w-3.5 shrink-0 text-gold" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-tprimary">
                    {l.title}
                  </span>
                  <span className="block truncate text-[11.5px] text-tmuted">
                    {l.trackTitle} · {l.moduleTitle}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({
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
      className={`rounded-md p-1.5 transition-colors disabled:opacity-30 ${
        danger
          ? "text-tmuted hover:bg-danger/10 hover:text-danger"
          : "text-tmuted hover:bg-bg hover:text-tprimary"
      }`}
    >
      {children}
    </button>
  );
}

/** Drag/drop + click-to-upload image field, backed by Cloudinary. */
function ImageField({
  url,
  onUploaded,
}: {
  url: string;
  onUploaded: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const configured = cloudinaryConfigured();

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("That doesn't look like an image file.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      onUploaded(await uploadToCloudinary(file));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  if (url) {
    return (
      <div>
        <div className="overflow-hidden rounded-xl border border-border bg-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={optimizedImageUrl(url, 800)}
            alt=""
            className="mx-auto block max-h-64 w-auto"
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-tmuted transition-colors hover:text-tprimary">
            {busy ? "Uploading…" : "Replace"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          <button
            onClick={() => onUploaded("")}
            className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-tmuted transition-colors hover:text-danger"
          >
            Remove
          </button>
          {err && <span className="text-[12px] text-danger">{err}</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors",
          drag ? "border-gold bg-gold/5" : "border-border-strong hover:border-gold/50",
        )}
      >
        <ImageIcon className="h-6 w-6 text-tfaint" />
        <div className="text-[13px] font-medium text-tprimary">
          {busy ? "Uploading…" : "Click to upload or drag an image here"}
        </div>
        <div className="text-[11.5px] text-tfaint">PNG, JPG, SVG or GIF</div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {!configured && (
        <p className="mt-2 text-[11.5px] text-tmuted">
          Heads up: image uploads aren't configured yet — set the Cloudinary env
          vars (see <span className="font-mono">.env.example</span>).
        </p>
      )}
      {err && <p className="mt-2 text-[12px] text-danger">{err}</p>}
    </div>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (patch: Partial<ContentBlock>) => void;
}) {
  if (block.type === "text") {
    return (
      <MarkdownField
        value={block.content}
        onChange={(v) => onChange({ content: v })}
        placeholder="Write the lesson text. Use the toolbar for LaTeX."
      />
    );
  }

  if (block.type === "section") {
    return (
      <div>
        <label className={labelCls}>Section heading</label>
        <input
          className={inputCls}
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Introduction"
        />
      </div>
    );
  }

  if (block.type === "callout") {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Environment</label>
          <select
            className={inputCls}
            value={block.variant}
            onChange={(e) =>
              onChange({ variant: e.target.value as CalloutVariant })
            }
          >
            {CALLOUT_VARIANTS.map((v) => (
              <option key={v} value={v}>
                {CALLOUT_LABELS[v]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Heading (optional)</label>
          <input
            className={inputCls}
            value={block.title ?? ""}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder={CALLOUT_LABELS[block.variant]}
          />
        </div>
        <div className="sm:col-span-3">
          <label className={labelCls}>Body</label>
          <MarkdownField
            value={block.body}
            onChange={(v) => onChange({ body: v })}
            minHeight={90}
            placeholder="The statement / idea / steps (supports LaTeX)."
          />
        </div>
      </div>
    );
  }

  if (block.type === "video") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Video URL (YouTube or Vimeo)</label>
          <input
            className={inputCls}
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </div>
        <div>
          <label className={labelCls}>Title (optional)</label>
          <input
            className={inputCls}
            value={block.title ?? ""}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls}>Caption (optional)</label>
          <input
            className={inputCls}
            value={block.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div className="grid gap-3">
        <ImageField
          url={block.url}
          onUploaded={(url) => onChange({ url })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Alt text (for accessibility)</label>
            <input
              className={inputCls}
              value={block.alt ?? ""}
              onChange={(e) => onChange({ alt: e.target.value })}
              placeholder="Describe the diagram"
            />
          </div>
          <div>
            <label className={labelCls}>Caption (optional)</label>
            <input
              className={inputCls}
              value={block.caption ?? ""}
              onChange={(e) => onChange({ caption: e.target.value })}
              placeholder="Shown beneath the image"
            />
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "resource") {
    return (
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className={labelCls}>Source</label>
          <input
            className={inputCls}
            value={block.source}
            onChange={(e) => onChange({ source: e.target.value })}
            placeholder="AoPS"
          />
        </div>
        <div>
          <label className={labelCls}>Stars</label>
          <select
            className={inputCls}
            value={block.stars}
            onChange={(e) => onChange({ stars: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-4">
          <label className={labelCls}>Title</label>
          <input
            className={inputCls}
            value={block.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div className="sm:col-span-4">
          <label className={labelCls}>Description</label>
          <input
            className={inputCls}
            value={block.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
        <div className="sm:col-span-4">
          <label className={labelCls}>URL (optional)</label>
          <input
            className={inputCls}
            value={block.url ?? ""}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://…"
          />
        </div>
      </div>
    );
  }

  // problem
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className={labelCls}>Title</label>
        <input
          className={inputCls}
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Source</label>
          <input
            className={inputCls}
            value={block.source}
            onChange={(e) => onChange({ source: e.target.value })}
            placeholder="AMC 8 2019 #15"
          />
        </div>
        <div>
          <label className={labelCls}>Difficulty</label>
          <select
            className={inputCls}
            value={block.difficulty}
            onChange={(e) =>
              onChange({ difficulty: e.target.value as Difficulty })
            }
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Statement</label>
        <MarkdownField
          value={block.statement}
          onChange={(v) => onChange({ statement: v })}
          minHeight={90}
          placeholder="The problem statement (supports LaTeX)."
        />
      </div>
      <div>
        <label className={labelCls}>Hint (optional)</label>
        <MarkdownField
          value={block.hint ?? ""}
          onChange={(v) => onChange({ hint: v })}
          minHeight={70}
        />
      </div>
      <div>
        <label className={labelCls}>Solution (optional)</label>
        <MarkdownField
          value={block.solution ?? ""}
          onChange={(v) => onChange({ solution: v })}
          minHeight={70}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Solution link (optional)</label>
        <input
          className={inputCls}
          type="url"
          value={block.solutionUrl ?? ""}
          onChange={(e) => onChange({ solutionUrl: e.target.value })}
          placeholder="https://artofproblemsolving.com/… or a video link"
        />
        <p className="mt-1 text-[11.5px] text-tfaint">
          Link to a solution elsewhere (AoPS thread, video, article). Shown as a
          button — use instead of, or alongside, a written solution.
        </p>
      </div>
    </div>
  );
}
