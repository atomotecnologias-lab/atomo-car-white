import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDef {
  key: string;
  label: string;
  description?: string;
}

export function Stepper({
  steps,
  currentIndex,
  onStepClick,
  completed,
}: {
  steps: StepDef[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
  completed: Set<string>;
}) {
  return (
    <ol className="space-y-1">
      {steps.map((s, i) => {
        const isCurrent = i === currentIndex;
        const isDone = completed.has(s.key);
        const isReachable = i <= currentIndex || isDone;
        return (
          <li key={s.key}>
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => onStepClick?.(i)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                isCurrent && "bg-performance/10",
                !isCurrent && isReachable && "hover:bg-muted",
                !isReachable && "cursor-not-allowed opacity-50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-medium tabular transition-colors",
                  isCurrent && "border-performance bg-performance text-carbon",
                  isDone && !isCurrent && "border-performance/40 bg-performance/15 text-performance",
                  !isCurrent && !isDone && "border-border text-titanium",
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm font-medium",
                    isCurrent ? "text-clean" : "text-clean/80",
                  )}
                >
                  {s.label}
                </span>
                {s.description && (
                  <span className="mt-0.5 block text-[11px] leading-snug text-titanium">
                    {s.description}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
