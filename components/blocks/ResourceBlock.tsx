import type { ResourceBlock as ResourceBlockType } from "@/lib/types";
import { Star } from "@/components/icons";

export function ResourceBlock({ block }: { block: ResourceBlockType }) {
  const stars = Math.max(0, Math.min(5, Math.round(block.stars || 0)));
  const card = (
    <div
      className="my-5 rounded-2xl border px-4.5 py-4 shadow-card transition-shadow hover:shadow-lift"
      style={{
        background: "var(--color-resource)",
        borderColor: "var(--color-resource-border)",
      }}
    >
      <div className="mb-1 flex items-center gap-2.5">
        <span className="rounded-md bg-green/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green">
          {block.source}
        </span>
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              filled={i < stars}
              className="h-3.5 w-3.5"
              style={{ color: i < stars ? "var(--color-gold)" : "var(--color-tfaint)" }}
            />
          ))}
        </span>
      </div>
      <div className="text-[15px] font-semibold text-tprimary">
        {block.title}
      </div>
      {block.description && (
        <p className="mt-0.5 text-[13.5px] leading-relaxed text-tmuted">
          {block.description}
        </p>
      )}
    </div>
  );

  if (block.url) {
    return (
      <a
        href={block.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline transition-opacity hover:opacity-90"
      >
        {card}
      </a>
    );
  }
  return card;
}
