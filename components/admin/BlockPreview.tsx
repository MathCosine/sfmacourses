"use client";

import type { PreparedBlock } from "@/lib/prepare";
import { ResourceBlock } from "@/components/blocks/ResourceBlock";
import { VideoBlock } from "@/components/blocks/VideoBlock";
import { CalloutBlock } from "@/components/blocks/CalloutBlock";

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "#2f9e44",
  Medium: "#1c7ed6",
  Hard: "#e8590c",
  "Very Hard": "#c92a2a",
};

/**
 * Renders a single prepared block exactly as it appears on the published
 * lesson page — used by the inline staff editor so "what you see is the wiki".
 * Non-interactive (no status circles / progress writes).
 */
export function BlockPreview({ block }: { block: PreparedBlock }) {
  switch (block.kind) {
    case "text":
      return block.html ? (
        <div className="prose-sfma" dangerouslySetInnerHTML={{ __html: block.html }} />
      ) : (
        <p className="text-[13px] italic text-tfaint">Empty text block.</p>
      );
    case "resource":
      return <ResourceBlock block={block.block} />;
    case "video":
      return block.block.url ? (
        <VideoBlock block={block.block} />
      ) : (
        <p className="text-[13px] italic text-tfaint">Video — add a URL.</p>
      );
    case "callout":
      return <CalloutBlock block={block.prepared} />;
    case "section":
      return (
        <h2 className="mt-1 border-b border-border pb-2 font-serif text-2xl text-tprimary">
          {block.title || (
            <span className="italic text-tfaint">Untitled section</span>
          )}
        </h2>
      );
    case "problem": {
      const p = block.prepared;
      const color = DIFFICULTY_COLOR[p.difficulty] ?? "#1c7ed6";
      return (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span
              className="h-[22px] w-[22px] shrink-0 rounded-full border-2"
              style={{ borderColor: "#cbd2dc" }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-semibold text-tprimary">
                {p.title || <span className="italic text-tfaint">Untitled problem</span>}
              </div>
              {p.source && (
                <div className="truncate text-[12px] text-tmuted">{p.source}</div>
              )}
            </div>
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
              style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
            >
              {p.difficulty}
            </span>
          </div>
          <div className="px-4 py-3.5">
            <div
              className="prose-sfma"
              dangerouslySetInnerHTML={{ __html: p.statementHtml }}
            />
            {(p.hintHtml || p.solutionHtml) && (
              <div className="mt-3 space-y-2">
                {p.hintHtml && (
                  <details className="rounded-lg border border-border bg-bg px-3.5 py-2">
                    <summary className="cursor-pointer text-[12px] font-semibold text-gold">
                      Hint
                    </summary>
                    <div
                      className="prose-sfma mt-2"
                      dangerouslySetInnerHTML={{ __html: p.hintHtml }}
                    />
                  </details>
                )}
                {p.solutionHtml && (
                  <details className="rounded-lg border border-border bg-bg px-3.5 py-2">
                    <summary className="cursor-pointer text-[12px] font-semibold text-green">
                      Solution
                    </summary>
                    <div
                      className="prose-sfma mt-2"
                      dangerouslySetInnerHTML={{ __html: p.solutionHtml }}
                    />
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}
