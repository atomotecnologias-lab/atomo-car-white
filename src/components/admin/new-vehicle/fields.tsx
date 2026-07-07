import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputCls =
  "w-full h-11 sm:h-auto rounded-lg border border-input bg-carbon px-4 py-2.5 text-sm text-clean placeholder:text-titanium/70 transition-colors focus:border-performance/40 focus:outline-none focus:ring-2 focus:ring-performance/20";

export function Field({
  label,
  children,
  required,
  hint,
  className,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-[0.14em] text-titanium">
        <span>
          {label}
          {required && <span className="ml-1 text-performance">*</span>}
        </span>
        {hint && <span className="text-[10px] normal-case tracking-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export function ChoiceGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | "";
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "h-11 sm:h-auto rounded-lg border px-3 sm:px-3.5 py-2.5 sm:py-2 text-xs font-medium transition-all",
              active
                ? "border-performance bg-performance/15 text-performance"
                : "border-input bg-carbon text-clean/80 hover:border-performance/30 hover:text-clean",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-carbon p-3">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-titanium">
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold text-clean tabular">{value}</div>
    </div>
  );
}

export function ProgressCard({
  current,
  total,
  score,
}: {
  current: number;
  total: number;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-performance/5 to-transparent p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-performance">
          Progresso
        </span>
        <span className="font-display text-xs text-titanium tabular">
          {current}/{total}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-performance to-racing transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-titanium">
            Qualidade prevista
          </div>
          <div className="mt-0.5 font-display text-2xl font-semibold text-clean tabular">
            {score}%
          </div>
        </div>
        <Sparkles className="h-5 w-5 text-performance/60" />
      </div>
    </div>
  );
}
