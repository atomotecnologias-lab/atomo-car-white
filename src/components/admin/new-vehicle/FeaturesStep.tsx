import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FEATURE_SUGGESTIONS } from "@/data/mockBrands";
import { Field, inputCls } from "./fields";
import type { StepProps } from "./types";

export function FeaturesStep({ form, set }: StepProps) {
  const suggestions = FEATURE_SUGGESTIONS[form.brand] ?? FEATURE_SUGGESTIONS.default;
  const [custom, setCustom] = useState("");
  const toggle = (f: string) => {
    set(
      "features",
      form.features.includes(f) ? form.features.filter((x) => x !== f) : [...form.features, f],
    );
  };
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-titanium">
            Sugestões {form.brand ? `para ${form.brand}` : "comuns"}
          </span>
          <span className="text-xs text-titanium">
            {form.features.length} selecionado{form.features.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => {
            const active = form.features.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggle(s)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 sm:py-1.5 text-xs transition-all min-h-[40px] sm:min-h-0",
                  active
                    ? "border-performance bg-performance/15 text-performance"
                    : "border-input bg-carbon text-clean/80 hover:border-performance/40 hover:text-clean",
                )}
              >
                {active && <Check className="h-3 w-3" />}
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Adicionar item personalizado">
        <div className="flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && custom.trim()) {
                e.preventDefault();
                if (!form.features.includes(custom.trim())) {
                  set("features", [...form.features, custom.trim()]);
                }
                setCustom("");
              }
            }}
            className={inputCls}
            placeholder="Ex.: Bancos ventilados"
          />
          <Button
            type="button"
            onClick={() => {
              if (custom.trim() && !form.features.includes(custom.trim())) {
                set("features", [...form.features, custom.trim()]);
                setCustom("");
              }
            }}
            className="h-11 sm:h-auto bg-muted text-clean hover:bg-muted"
          >
            Adicionar
          </Button>
        </div>
      </Field>

      {form.features.length > 0 && (
        <div className="rounded-xl border border-border bg-carbon p-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-titanium">
            Selecionados
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.features.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-md bg-performance/10 px-2 py-1 text-xs text-performance"
              >
                {f}
                <button
                  type="button"
                  onClick={() => toggle(f)}
                  className="text-performance/70 hover:text-performance"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
