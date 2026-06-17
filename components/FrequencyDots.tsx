import type { Frequency } from "@/lib/types";

const META: Record<Frequency, { filled: number; label: string }> = {
  // More filled dots = more important / more frequent, like usaco.guide.
  essential: { filled: 3, label: "Essential" },
  important: { filled: 2, label: "Important" },
  supplemental: { filled: 1, label: "Supplemental" },
};

export function FrequencyDots({
  frequency,
  showLabel = true,
}: {
  frequency: Frequency;
  showLabel?: boolean;
}) {
  const { filled, label } = META[frequency] ?? META.important;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: i < filled ? "var(--color-green)" : "#cbd2dc" }}
          />
        ))}
      </span>
      {showLabel && (
        <span className="text-[12px] font-semibold text-green">{label}</span>
      )}
    </span>
  );
}
