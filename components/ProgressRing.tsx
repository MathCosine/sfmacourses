interface ProgressRingProps {
  value: number; // completed
  total: number;
  size?: number;
  stroke?: number;
  showFraction?: boolean;
  /** Arc color for the in-progress state (defaults to the gold accent). */
  color?: string;
}

export function ProgressRing({
  value,
  total,
  size = 56,
  stroke = 5,
  showFraction = true,
  color,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? value / total : 0;
  const offset = circumference * (1 - pct);
  const complete = total > 0 && value >= total;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={complete ? "var(--color-green)" : (color ?? "var(--color-gold)")}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      {showFraction && (
        <span
          className="absolute font-mono text-[11px] font-medium"
          style={{ color: complete ? "var(--color-green)" : "var(--color-tprimary)" }}
        >
          {value}/{total}
        </span>
      )}
    </div>
  );
}
