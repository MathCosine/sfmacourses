"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  ContentBlock,
  Difficulty,
  Frequency,
  Lesson,
} from "@/lib/types";
import { DIFFICULTIES } from "@/lib/types";
import { contentBlocks, extractMeta } from "@/lib/utils";
import { updateLesson, deleteLesson } from "./actions";
import { ArrowUp, ArrowDown, TrashIcon, PlusIcon } from "@/components/icons";

const BLOCK_LABEL: Record<ContentBlock["type"], string> = {
  text: "Text",
  resource: "Resource",
  problem: "Problem",
  section: "Section",
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
  }
}

const inputCls =
  "w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13.5px] text-tprimary outline-none transition-colors placeholder:text-tfaint focus:border-gold";
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

  function patchBlock(i: number, patch: Partial<ContentBlock>) {
    setBlocks((prev) =>
      prev.map((b, idx) => (idx === i ? ({ ...b, ...patch } as ContentBlock) : b)),
    );
  }
  function move(i: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function remove(i: number) {
    setBlocks((prev) => prev.filter((_, idx) => idx !== i));
  }
  function add(type: ContentBlock["type"]) {
    setBlocks((prev) => [...prev, emptyBlock(type)]);
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
        setMsg("Saved");
        router.refresh();
      } else {
        setMsg(res.error ?? "Save failed");
      }
    });
  }

  function onDelete() {
    if (!confirm(`Delete lesson “${lesson.title}”? This cannot be undone.`))
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
    <div className="rounded-2xl border border-gold/40 bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-serif text-xl text-tprimary">Edit Lesson</h3>
        <div className="flex items-center gap-2">
          {msg && (
            <span
              className={`text-[12.5px] ${
                msg === "Saved" ? "text-green" : "text-danger"
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
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-tmuted transition-colors hover:text-tprimary"
          >
            Close
          </button>
          <button
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-gold px-4 py-1.5 text-[12.5px] font-semibold text-bg transition-colors hover:bg-gold-hover disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Lesson meta */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className={labelCls}>Title</label>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Author</label>
          <input
            className={inputCls}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Frequency</label>
          <select
            className={inputCls}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
          >
            <option value="essential">● Essential</option>
            <option value="important">●● Important</option>
            <option value="supplemental">●●● Supplemental</option>
          </select>
        </div>
      </div>

      {/* Blocks */}
      <div className="mt-5 space-y-3">
        {blocks.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-[13px] text-tfaint">
            No blocks yet. Add one below.
          </p>
        )}
        {blocks.map((block, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-bg/50 p-3.5"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
                {BLOCK_LABEL[block.type]}
              </span>
              <div className="flex items-center gap-1">
                <IconBtn onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn
                  onClick={() => move(i, 1)}
                  disabled={i === blocks.length - 1}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn onClick={() => remove(i)} danger>
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
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="text-[12px] text-tmuted">Add block:</span>
        {(["text", "resource", "problem", "section"] as const).map((t) => (
          <button
            key={t}
            onClick={() => add(t)}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[12.5px] font-medium text-tmuted transition-colors hover:border-gold/50 hover:text-gold"
          >
            <PlusIcon className="h-3 w-3" />
            {BLOCK_LABEL[t]}
          </button>
        ))}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md p-1.5 transition-colors disabled:opacity-30 ${
        danger
          ? "text-tmuted hover:bg-danger/10 hover:text-danger"
          : "text-tmuted hover:bg-surface hover:text-tprimary"
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
      <div>
        <label className={labelCls}>Markdown (supports $math$ and $$display$$)</label>
        <textarea
          className={`${inputCls} min-h-[120px] font-mono text-[12.5px]`}
          value={block.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Write markdown here…"
        />
      </div>
    );
  }

  if (block.type === "section") {
    return (
      <div>
        <label className={labelCls}>Section Heading</label>
        <input
          className={inputCls}
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Introduction"
        />
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
        <label className={labelCls}>Statement (markdown + math)</label>
        <textarea
          className={`${inputCls} min-h-[80px] font-mono text-[12.5px]`}
          value={block.statement}
          onChange={(e) => onChange({ statement: e.target.value })}
        />
      </div>
      <div>
        <label className={labelCls}>Hint (optional)</label>
        <textarea
          className={`${inputCls} min-h-[60px] font-mono text-[12.5px]`}
          value={block.hint ?? ""}
          onChange={(e) => onChange({ hint: e.target.value })}
        />
      </div>
      <div>
        <label className={labelCls}>Solution (optional)</label>
        <textarea
          className={`${inputCls} min-h-[60px] font-mono text-[12.5px]`}
          value={block.solution ?? ""}
          onChange={(e) => onChange({ solution: e.target.value })}
        />
      </div>
    </div>
  );
}
