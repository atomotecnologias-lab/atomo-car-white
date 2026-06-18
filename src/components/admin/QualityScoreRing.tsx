import { cn } from "@/lib/utils";

export function QualityScoreRing({
  value,
  size = 56,
  stroke = 5,
  className,
  showLabel = true,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  showLabel?: boolean;
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;
  const tone =
    value >= 80
      ? "text-performance"
      : value >= 50
        ? "text-warning"
        : "text-destructive";

  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", tone)}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 grid place-items-center">
          <span className={cn("font-display text-xs font-semibold tabular", tone)}>{value}</span>
        </div>
      )}
    </div>
  );
}
