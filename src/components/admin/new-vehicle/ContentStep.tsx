import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { generateContent } from "@/lib/ai";
import { Field, inputCls } from "./fields";
import type { StepProps } from "./types";

export function ContentStep({ form, set }: StepProps) {
  const [loading, setLoading] = useState(false);
  const canSuggest = Boolean(form.brand && form.model && form.yearModel);

  const fallbackGenerate = () => {
    const yr = form.yearModel || form.yearManufacture;
    const short = `${form.brand} ${form.model} ${form.version} ${yr} — ${
      form.color || "cor única"
    }${form.mileage ? `, ${Number(form.mileage).toLocaleString("pt-BR")} km` : ""}.`.slice(0, 180);
    const featuresLine =
      form.features.length > 0
        ? `Vem completíssimo, com ${form.features.slice(0, 6).join(", ")}.`
        : "";
    const full = [
      `${form.brand} ${form.model} ${form.version} ${yr}, revisado e pronto para rodar.`,
      featuresLine,
      "Aceitamos seu usado na troca e oferecemos as melhores condições de financiamento da região.",
      "Agende uma visita ou chame no WhatsApp para mais informações.",
    ]
      .filter(Boolean)
      .join("\n\n");
    set("descriptionShort", short);
    set("descriptionFull", full);
  };

  const generate = async () => {
    setLoading(true);
    try {
      const r = await generateContent({
        brand: form.brand,
        model: form.model,
        version: form.version,
        yearModel: Number(form.yearModel) || undefined,
        mileage: Number(form.mileage) || undefined,
        color: form.color,
        transmission: form.transmission || undefined,
        fuel: form.fuel || undefined,
        features: form.features,
      });
      if (r.descriptionShort) set("descriptionShort", r.descriptionShort);
      if (r.descriptionFull) set("descriptionFull", r.descriptionFull);
      toast.success("Conteúdo gerado por IA — revise e ajuste.");
    } catch {
      fallbackGenerate();
      toast.message("IA indisponível — geramos um rascunho a partir dos dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-performance/15 bg-performance/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-performance" />
          <span className="text-sm text-clean">Gerar descrições profissionais com IA</span>
        </div>
        <Button
          type="button"
          onClick={generate}
          disabled={!canSuggest || loading}
          className="h-11 w-full sm:h-auto sm:w-auto bg-performance text-carbon hover:bg-racing disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Gerando com IA…
            </>
          ) : (
            "Gerar conteúdo assistido"
          )}
        </Button>
      </div>

      <Field
        label="Descrição curta"
        hint="Aparece nos cards e em buscas. Até 180 caracteres."
        required
      >
        <textarea
          value={form.descriptionShort}
          onChange={(e) => set("descriptionShort", e.target.value.slice(0, 180))}
          rows={2}
          className={cn(inputCls, "resize-none h-[100px] sm:h-auto")}
          placeholder="Ex.: Compass Limited 2024 com baixa quilometragem, único dono..."
        />
        <div className="mt-1 text-right text-[10px] text-titanium tabular">
          {form.descriptionShort.length}/180
        </div>
      </Field>

      <Field label="Descrição completa" hint="Mínimo 80 caracteres. Use parágrafos." required>
        <textarea
          value={form.descriptionFull}
          onChange={(e) => set("descriptionFull", e.target.value)}
          rows={5}
          className={cn(inputCls, "resize-y h-auto min-h-[160px] sm:min-h-[200px]")}
          placeholder="Detalhe estado, manutenção, opcionais..."
        />
        <div className="mt-1 text-right text-[10px] text-titanium tabular">
          {form.descriptionFull.length} caracteres
        </div>
      </Field>
    </div>
  );
}
