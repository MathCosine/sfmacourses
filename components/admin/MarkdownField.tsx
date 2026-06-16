"use client";

import { useEffect, useRef, useState } from "react";
import { previewMarkdown } from "@/app/admin/actions";

interface Snippet {
  label: string;
  insert: string;
  /** caret offset from the end of the inserted text (negative = inside braces) */
  caret?: number;
  title: string;
}

const SNIPPETS: Snippet[] = [
  { label: "$x$", insert: "$x$", caret: -1, title: "Inline math" },
  { label: "$$", insert: "$$\n\n$$", caret: -3, title: "Display math block" },
  { label: "x²", insert: "^{}", caret: -1, title: "Superscript / exponent" },
  { label: "x₁", insert: "_{}", caret: -1, title: "Subscript" },
  { label: "a∕b", insert: "\\frac{}{}", caret: -3, title: "Fraction" },
  { label: "√", insert: "\\sqrt{}", caret: -1, title: "Square root" },
  { label: "∑", insert: "\\sum_{i=1}^{n} ", title: "Summation" },
  { label: "∫", insert: "\\int_{a}^{b} ", title: "Integral" },
  { label: "≡", insert: "\\equiv ", title: "Congruent" },
  { label: "≤", insert: "\\le ", title: "Less or equal" },
  { label: "·", insert: "\\cdot ", title: "Times dot" },
  { label: "→", insert: "\\to ", title: "Arrow" },
  { label: "B", insert: "**bold**", caret: -2, title: "Bold text" },
  { label: "H", insert: "### Heading\n", title: "Heading" },
];

export function MarkdownField({
  value,
  onChange,
  placeholder,
  minHeight = 120,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);

  // Render preview (debounced) whenever switching to preview or editing in it.
  useEffect(() => {
    if (tab !== "preview") return;
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const out = await previewMarkdown(value);
      if (active) {
        setHtml(out);
        setLoading(false);
      }
    }, 200);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [tab, value]);

  function insert(s: Snippet) {
    const el = ref.current;
    if (!el) {
      onChange(value + s.insert);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    // If text is selected and the snippet wraps (has a caret target), wrap it.
    let inserted = s.insert;
    if (selected && s.caret != null) {
      inserted = s.insert.slice(0, s.caret) + selected + s.insert.slice(s.caret);
    }
    const next = value.slice(0, start) + inserted + value.slice(end);
    onChange(next);
    const pos = selected
      ? start + inserted.length
      : start + inserted.length + (s.caret ?? 0);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {SNIPPETS.map((s) => (
            <button
              key={s.label}
              type="button"
              title={s.title}
              onClick={() => insert(s)}
              className="rounded-md px-2 py-1 font-mono text-[12px] text-tmuted transition-colors hover:bg-gold/10 hover:text-gold"
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 overflow-hidden rounded-md border border-border text-[11.5px] font-medium">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={
                tab === t
                  ? "bg-gold px-2.5 py-1 text-white"
                  : "px-2.5 py-1 text-tmuted hover:text-tprimary"
              }
            >
              {t === "write" ? "Write" : "Preview"}
            </button>
          ))}
        </div>
      </div>

      {tab === "write" ? (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Write markdown with $LaTeX$ here…"}
          spellCheck={false}
          style={{ minHeight }}
          className="w-full resize-y bg-transparent px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-tprimary outline-none placeholder:text-tfaint"
        />
      ) : (
        <div
          className="prose-sfma min-h-[80px] px-3.5 py-3"
          style={{ minHeight }}
        >
          {loading ? (
            <span className="text-[13px] text-tfaint">Rendering…</span>
          ) : html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <span className="text-[13px] text-tfaint">Nothing to preview.</span>
          )}
        </div>
      )}
    </div>
  );
}
