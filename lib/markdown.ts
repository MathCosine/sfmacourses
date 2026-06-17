import "server-only";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Node, Parent } from "unist";

interface MathNode extends Node {
  type: "inlineMath";
  value: string;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: unknown[];
  };
}

/**
 * Math delimiter rules (predictable, LaTeX-flavoured):
 *
 *   $x$            → inline math, always.
 *   ...$$x$$...    → inline math when it sits *inside* a line of prose, so it
 *                    stays in the flow instead of being bumped to its own line.
 *   $$x$$          → centered display math when it is alone in its paragraph.
 *   $$ … $$ block  → centered display math (remark-math "flow", untouched here).
 *
 * remark-math parses every `$…$` and `$$…$$` that is not on its own lines as an
 * `inlineMath` node, so by default a `$$…$$` written by itself renders as a tiny
 * inline fragment on its own line. This transform promotes those standalone
 * double-dollar spans to real display math while leaving genuinely inline
 * double-dollar spans in place.
 */
function remarkMathDollarRules() {
  return (tree: Node, file: { value?: unknown }) => {
    const src = String(file?.value ?? "");
    visit(tree, (node: Node, _index, parent: Parent | undefined) => {
      if (node.type !== "inlineMath") return;
      const math = node as MathNode;
      const start = math.position?.start?.offset;
      const end = math.position?.end?.offset;
      if (start == null || end == null) return;
      // Only double-dollar spans are candidates for display promotion.
      if (!src.slice(start, end).startsWith("$$")) return;

      const aloneInParagraph =
        parent?.type === "paragraph" &&
        parent.children.filter(
          (c) =>
            !(
              c.type === "text" &&
              !String((c as { value?: unknown }).value ?? "").trim()
            ),
        ).length === 1;
      if (!aloneInParagraph) return;

      // Render as a display-mode math element (rehype-katex keys off the class).
      math.data = math.data ?? {};
      math.data.hName = "div";
      math.data.hProperties = { className: ["math", "math-display"] };
      math.data.hChildren = [{ type: "text", value: math.value }];
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkMathDollarRules)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSlug)
  .use(rehypeKatex, { throwOnError: false, strict: false })
  .use(rehypeStringify);

/**
 * Render a markdown string (with `$inline$` and `$$display$$` math) to an HTML
 * string. Runs only on the server.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  if (!markdown?.trim()) return "";
  try {
    const file = await processor.process(markdown);
    return String(file);
  } catch {
    // Never let a single malformed block crash the whole lesson render.
    const escaped = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<p>${escaped}</p>`;
  }
}
