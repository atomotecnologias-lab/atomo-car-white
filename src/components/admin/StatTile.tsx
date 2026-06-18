import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatTile({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  accent,
  className,
  children,
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  icon?: LucideIcon;
  accent?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-premium p-6 transition-colors hover:border-white/[0.12]",
        accent && "bg-gradient-to-br from-premium to-[#0F1411]",
        className,
      )}
    >
      {accent && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-performance/15 blur-3xl"
        />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-titanium">
            {label}
          </div>
          <div className="mt-3 font-display text-3xl font-semibold tabular text-clean">
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-titanium">{hint}</div>}
        </div>
        {Icon && (
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-performance">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {trend && (
        <div className="relative mt-4 inline-flex items-center gap-1 text-xs">
          <span className={trend.positive ? "text-performance" : "text-destructive"}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
          <span className="text-titanium">vs. mês passado</span>
        </div>
      )}

      {children}
    </div>
  );
}
