import { MATURITY_META } from "@/lib/maturity";
import type { Maturity } from "@/lib/types";

/** A small pill: colored dot + label. Theme-aware via color-mix. */
export function MaturityBadge({
  maturity,
  className = "",
}: {
  maturity: Maturity;
  className?: string;
}) {
  const m = MATURITY_META[maturity];
  return (
    <span
      title={m.desc}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${className}`}
      style={{
        color: m.color,
        background: `color-mix(in srgb, ${m.color} 14%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

/** Just the colored dot — for tight spots like the sidebar. */
export function MaturityDot({ maturity }: { maturity: Maturity }) {
  const m = MATURITY_META[maturity];
  return (
    <span
      title={`${m.label} — ${m.desc}`}
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ background: m.color }}
    />
  );
}
