/**
 * Animated hero backdrop: a slowly drifting dot grid plus floating outlined
 * triangles. Pure CSS animations — no JS, no layout cost.
 */
export function HeroBackground() {
  const triangles = [
    { top: "12%", left: "8%", size: 58, rot: -12, delay: "0s", color: "#2563eb" },
    { top: "62%", left: "14%", size: 38, rot: 18, delay: "1.2s", color: "#16a34a" },
    { top: "20%", left: "84%", size: 72, rot: 8, delay: "0.6s", color: "#ca8a04" },
    { top: "70%", left: "78%", size: 46, rot: -20, delay: "1.8s", color: "#2563eb" },
    { top: "40%", left: "92%", size: 30, rot: 4, delay: "2.4s", color: "#16a34a" },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* warm wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% -8%, rgba(37,99,235,0.10), transparent 70%), radial-gradient(38% 40% at 88% 6%, rgba(22,163,74,0.07), transparent 70%)",
        }}
      />
      {/* drifting dot grid, fading toward the bottom */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(rgba(37,99,235,0.18) 1.4px, transparent 1.6px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 78%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 78%)",
          animation: "driftDots 9s linear infinite",
        }}
      />
      {/* floating triangles */}
      {triangles.map((t, i) => (
        <svg
          key={i}
          width={t.size}
          height={t.size}
          viewBox="0 0 100 100"
          className="absolute"
          style={{
            top: t.top,
            left: t.left,
            // @ts-expect-error custom property for keyframe
            "--rot": `${t.rot}deg`,
            animation: `floatY ${7 + i}s ease-in-out ${t.delay} infinite`,
            opacity: 0.5,
          }}
        >
          <polygon
            points="50,6 94,90 6,90"
            fill="none"
            stroke={t.color}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}
