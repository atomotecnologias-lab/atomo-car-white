import { useState } from "react";
import { Loader2, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { suggestPrice, type PriceResult } from "@/lib/ai";
import type { VehicleStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { ChoiceGroup, Field, inputCls } from "./fields";
import type { StepProps } from "./types";

export function PriceStep({ form, set }: StepProps) {
  const priceNum = Number(String(form.price).replace(/[^\d]/g, "") || 0);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<PriceResult | null>(null);
  const canSuggest = Boolean(form.brand && form.model && form.yearModel);

  const runSuggest = async () => {
    setLoading(true);
    try {
      const r = await suggestPrice({
        brand: form.brand,
        model: form.model,
        version: form.version,
        yearModel: Number(form.yearModel) || undefined,
        mileage: Number(form.mileage) || undefined,
      });
      setSuggestion(r);
    } catch {
      toast.error("Não foi possível gerar a sugestão de preço.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Field label="Preço de venda (R$)" required className="md:col-span-2">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-sm text-titanium">
            R$
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className={cn(inputCls, "pl-11 font-display text-lg sm:text-xl tabular")}
            placeholder="89900"
          />
        </div>
        {priceNum > 0 && (
          <p className="mt-2 text-xs text-titanium">
            Exibido como{" "}
            <span className="font-display text-performance">{formatBRL(priceNum)}</span>
          </p>
        )}

        <div className="mt-3 rounded-xl border border-white/[0.06] bg-carbon/40 p-3">
          <Button
            type="button"
            variant="outline"
            onClick={runSuggest}
            disabled={!canSuggest || loading}
            className="h-11 w-full sm:h-auto sm:w-auto border-performance/30 text-performance hover:bg-performance/10"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Estimando…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Sugerir faixa com IA
              </>
            )}
          </Button>

          {suggestion && (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                <span className="text-titanium">Faixa de mercado:</span>
                <span className="font-display text-clean">
                  {formatBRL(suggestion.min)} – {formatBRL(suggestion.max)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-titanium">
                  Sugerido:{" "}
                  <span className="font-display text-performance">
                    {formatBRL(suggestion.suggested)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => set("price", String(suggestion.suggested))}
                  className="rounded-lg border border-performance/30 bg-performance/10 px-3 py-1.5 text-xs text-performance hover:bg-performance/15"
                >
                  Usar valor sugerido
                </button>
              </div>
              <p className="text-[10px] text-titanium">
                Estimativa de mercado gerada por IA — confirme antes de publicar.
              </p>
            </div>
          )}
        </div>
      </Field>
      <Field label="Status inicial" required>
        <ChoiceGroup
          value={form.status}
          onChange={(v) => set("status", v as VehicleStatus)}
          options={[
            { value: "draft", label: "Rascunho" },
            { value: "awaiting_photos", label: "Aguardando fotos" },
            { value: "active", label: "Publicar agora" },
          ]}
        />
      </Field>
      <Field label="Destaque na vitrine">
        <button
          type="button"
          onClick={() => set("isFeatured", !form.isFeatured)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors",
            form.isFeatured
              ? "border-performance/40 bg-performance/10 text-performance"
              : "border-white/[0.08] bg-carbon text-clean/80 hover:text-clean",
          )}
        >
          <span className="inline-flex items-center gap-2">
            <Star
              className={cn("h-4 w-4", form.isFeatured && "fill-performance")}
              strokeWidth={1.5}
            />
            {form.isFeatured ? "Em destaque" : "Marcar como destaque"}
          </span>
          <span className="text-xs text-titanium">Aparece na home</span>
        </button>
      </Field>
    </div>
  );
}
