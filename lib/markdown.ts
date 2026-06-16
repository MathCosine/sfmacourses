import "server-only";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
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
