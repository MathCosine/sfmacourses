"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  CalloutVariant,
  ContentBlock,
  Difficulty,
  Frequency,
  Lesson,
} from "@/lib/types";
import { CALLOUT_LABELS, CALLOUT_VARIANTS, DIFFICULTIES } from "@/lib/types";
import { contentBlocks, extractMeta } from "@/lib/utils";
import { updateLesson, deleteLesson } from "./actions";
import { MarkdownField } from "@/components/admin/MarkdownField";
import { ArrowUp, ArrowDown, TrashIcon, PlusIcon } from "@/components/icons";

const BLOCK_LABEL: Record<ContentBlock["type"], string> = {
  text: "Text",
  resource: "Resource",
  problem: "Problem",
  section: "Section",
  video: "Video",
  callout: "Environment",
};

const BLOCK_HINT: Record<ContentBlock["type"], string> = {
  text: "Prose with markdown + LaTeX.",
  resource: "A linked reference card.",
  problem: "A practice problem with a status circle.",
  section: "A heading that appears in the contents and carries its own status.",
  video: "An embedded YouTube or Vimeo video.",
  callout: "A styled box: theorem, big idea, recipe, example, note or warning.",
};

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
    case "callout":
      return { type: "callout", variant: "theorem", title: "", body: "" };
  }
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] text-tprimary outline-none transition-colors placeholder:text-tfaint focus:border-gold";
const labelCls = "mb-1 block text-[11.5px] font-medium text-tmuted";

export function BlockEditor({
  lesson,
  onClose,
}: {
  lesson: Lesson;
  onClose: () => void;
}) {
  const router = useRouter();
  const meta = extractMeta(lesson.content);
  const [title, setTitle] = useState(lesson.title);
  const [author, setAuthor] = useState(meta.author);
  const [frequency, setFrequency] = useState<Frequency>(meta.frequency);
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    contentBlocks(lesson.content),
  );
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

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
    update((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function remove(i: number) {
    update((prev) => prev.filter((_, idx) => idx !== i));
  }
  function add(type: ContentBlock["type"]) {
    update((prev) => [...prev, emptyBlock(type)]);
  }

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await updateLesson(lesson.id, {
        title,
        content: blocks,
        author,
        frequency,
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
      <div className="sticky top-0 z-20 -mx-2 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-bg/90 px-2 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-tmuted transition-colors hover:text-tprimary"
          >
            ← Back
          </button>
          <h3 className="font-serif text-lg text-tprimary">Edit Chapter</h3>
          {dirty && (
            <span className="text-[11.5px] text-tfaint">unsaved changes</span>
          )}
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
      <div className="mb-6 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-3">
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
        <div className="sm:col-span-2">
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
      </div>

      {/* Blocks */}
      <div className="space-y-3">
        {blocks.length === 0 && (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-[13px] text-tfaint">
            This chapter is empty. Add a block below to start building.
          </p>
        )}
        {blocks.map((block, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface p-4 shadow-card"
          >
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
                <IconBtn onClick={() => move(i, -1)} disabled={i === 0} title="Move up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn
                  onClick={() => move(i, 1)}
                  disabled={i === blocks.length - 1}
                  title="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn onClick={() => remove(i)} danger title="Delete block">
                  <TrashIcon className="h-3.5 w-3.5" />
                </IconBtn>
              </div>
            </div>
            <BlockFields
              block={block}
              onChange={(patch) => patchBlock(i, patch)}
            />
          </div>
        ))}
      </div>

      {/* Add block */}
      <div className="mt-5 rounded-xl border border-dashed border-border-strong bg-surface/60 p-4">
        <div className="mb-2.5 text-[12px] font-medium text-tmuted">
          Add a block
        </div>
        <div className="flex flex-wrap gap-2">
          {(["text", "section", "callout", "problem", "resource", "video"] as const).map(
            (t) => (
              <button
                key={t}
                onClick={() => add(t)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-[12.5px] font-medium text-tprimary transition-colors hover:border-gold/50 hover:text-gold"
              >
                <PlusIcon className="h-3.5 w-3.5 text-gold" />
                {BLOCK_LABEL[t]}
              </button>
            ),
          )}
        </div>
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
    </div>
  );
}
