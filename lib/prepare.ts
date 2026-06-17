import "server-only";
import type { ContentBlock, ResourceBlock, VideoBlock } from "./types";
import { CALLOUT_LABELS } from "./types";
import { renderMarkdown } from "./markdown";
import { headingId } from "./utils";
import type { PreparedProblem } from "@/components/blocks/ProblemBlock";
import type { PreparedCallout } from "@/components/blocks/CalloutBlock";

export type PreparedBlock =
  | { kind: "text"; html: string }
  | { kind: "resource"; block: ResourceBlock }
  | { kind: "video"; block: VideoBlock }
  | { kind: "section"; id: string; title: string; sectionIndex: number }
  | { kind: "callout"; prepared: PreparedCallout }
  | { kind: "problem"; problemIndex: number; prepared: PreparedProblem };

/**
 * Render every block's markdown to HTML on the server and assign stable
 * per-block indices (used as the key for per-problem / per-section tracking).
 */
export async function prepareBlocks(
  blocks: ContentBlock[],
): Promise<PreparedBlock[]> {
  const out: PreparedBlock[] = [];
  let problemIndex = 0;
  let sectionIndex = 0;

  for (const block of blocks) {
    if (block.type === "text") {
      out.push({ kind: "text", html: await renderMarkdown(block.content) });
    } else if (block.type === "resource") {
      out.push({ kind: "resource", block });
    } else if (block.type === "video") {
      out.push({ kind: "video", block });
    } else if (block.type === "callout") {
      out.push({
        kind: "callout",
        prepared: {
          variant: block.variant,
          label: block.title?.trim() || CALLOUT_LABELS[block.variant],
          html: await renderMarkdown(block.body),
        },
      });
    } else if (block.type === "section") {
      out.push({
        kind: "section",
        id: headingId(block.title),
        title: block.title,
        sectionIndex,
      });
      sectionIndex += 1;
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
