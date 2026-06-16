import "server-only";
import type { ContentBlock, ResourceBlock } from "./types";
import { renderMarkdown } from "./markdown";
import { headingId } from "./utils";
import type { PreparedProblem } from "@/components/blocks/ProblemBlock";

export type PreparedBlock =
  | { kind: "text"; html: string }
  | { kind: "resource"; block: ResourceBlock }
  | { kind: "section"; id: string; title: string }
  | { kind: "problem"; problemIndex: number; prepared: PreparedProblem };

/**
 * Render every block's markdown to HTML on the server and assign problem
 * indices (used as the stable key for per-problem completion tracking).
 */
export async function prepareBlocks(
  blocks: ContentBlock[],
): Promise<PreparedBlock[]> {
  const out: PreparedBlock[] = [];
  let problemIndex = 0;

  for (const block of blocks) {
    if (block.type === "text") {
      out.push({ kind: "text", html: await renderMarkdown(block.content) });
    } else if (block.type === "resource") {
      out.push({ kind: "resource", block });
    } else if (block.type === "section") {
      out.push({ kind: "section", id: headingId(block.title), title: block.title });
    } else if (block.type === "problem") {
      const prepared: PreparedProblem = {
        title: block.title,
        source: block.source,
        difficulty: block.difficulty,
        statementHtml: await renderMarkdown(block.statement),
        hintHtml: block.hint ? await renderMarkdown(block.hint) : undefined,
        solutionHtml: block.solution
          ? await renderMarkdown(block.solution)
          : undefined,
      };
      out.push({ kind: "problem", problemIndex, prepared });
      problemIndex += 1;
    }
  }

  return out;
}
