import { useState } from "react";
import { Camera, CheckCircle2, Loader2, ScanLine, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatPlate, isValidPlate, lookupPlate } from "@/lib/plate-lookup";
import { enrichVehicle, readPlateFromImage } from "@/lib/ai";
import { Field, inputCls } from "./fields";
import type { StepProps } from "./types";

export function PlateStep({ form, set }: StepProps) {
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [reading, setReading] = useState(false);
  const valid = isValidPlate(form.plate);

  const onPlateChange = (raw: string) => {
    set("plate", formatPlate(raw));
    if (form.plateLookupDone) set("plateLookupDone", false);
  };

  const onPhoto = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    set("platePhoto", URL.createObjectURL(file));
    setReading(true);
    try {
      const plate = await readPlateFromImage(file);
      if (isValidPlate(plate)) {
        set("plate", formatPlate(plate));
        set("plateLookupDone", false);
        toast.success(`Placa lida: ${formatPlate(plate)}`);
        await runLookup(plate);
      } else {
        toast.message("Não consegui ler a placa. Digite manualmente.");
      }
    } catch {
      toast.message("Não consegui ler a placa. Digite manualmente.");
    } finally {
      setReading(false);
    }
  };

  const removePhoto = () => set("platePhoto", "");

  const runLookup = async (plateOverride?: string) => {
    const plate = plateOverride ?? form.plate;
    if (!isValidPlate(plate)) {
      toast.error("Informe uma placa válida (Mercosul ou antiga).");
      return;
    }
    setLoading(true);
    try {
      const r = await lookupPlate(plate);
      set("brand", r.brand);
      set("model", r.model);
      set("version", r.version);
      set("yearManufacture", String(r.yearManufacture));
      set("yearModel", String(r.yearModel));
      set("color", r.color);
      set("fuel", r.fuel);
      set("plateLookupDone", true);
      toast.success(`Dados encontrados: ${r.brand} ${r.model} ${r.yearModel}`);
      await enrichWithAI(r.brand, r.model, r.version, r.yearModel, r.fuel);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na consulta da placa");
    } finally {
      setLoading(false);
    }
  };

  const enrichWithAI = async (
    brand: string,
    model: string,
    version: string,
    yearModel: number,
    fuel: string,
  ) => {
    setEnriching(true);
    try {
      const ai = await enrichVehicle({ brand, model, version, yearModel });
      if (ai.version) set("version", ai.version);
      if (ai.transmission) set("transmission", ai.transmission);
      // só sobrescreve combustível se a placa não trouxe um confiável
      if (ai.fuel && !fuel) set("fuel", ai.fuel);
      if (ai.doors) set("doors", String(ai.doors));
      if (ai.features.length > 0) {
        const merged = Array.from(new Set([...form.features, ...ai.features]));
        set("features", merged);
      }
      toast.success("Ficha completada automaticamente — revise e ajuste.");
    } catch {
      toast.message("Não foi possível completar com IA. Preencha manualmente.");
    } finally {
      setEnriching(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="rounded-xl border border-performance/15 bg-performance/[0.04] px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-clean">
            <Sparkles className="h-3.5 w-3.5 text-performance" />
            <span>
              Comece pela placa — vamos consultar marca, modelo e ano automaticamente.
            </span>
          </div>
        </div>

        <Field label="Placa do veículo" required hint="Formato Mercosul ou antigo">
          <div className="relative">
            <input
              value={form.plate}
              onChange={(e) => onPlateChange(e.target.value)}
              inputMode="text"
              autoCapitalize="characters"
              className={cn(
                inputCls,
                "pl-12 font-display text-xl sm:text-2xl tracking-[0.3em] sm:tracking-[0.35em] uppercase tabular",
              )}
              placeholder="ABC-1D23"
              maxLength={8}
              autoFocus
            />
            <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-performance" />
            {form.plate && (
              <span
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-medium uppercase tracking-[0.18em]",
                  valid ? "text-performance" : "text-amber-300",
                )}
              >
                {valid ? "válida" : "incompleta"}
              </span>
            )}
          </div>
        </Field>

        <Button
          type="button"
          onClick={() => runLookup()}
          disabled={!valid || loading || enriching || reading}
          className="w-full bg-performance text-carbon hover:bg-racing disabled:bg-white/10 disabled:text-titanium"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Consultando base nacional...
            </>
          ) : enriching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analisando ficha com IA...
            </>
          ) : form.plateLookupDone ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Consultar novamente
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Buscar dados pela placa
            </>
          )}
        </Button>

        {form.plateLookupDone && (
          <div className="rounded-xl border border-performance/25 bg-performance/[0.06] p-4">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-performance">
              <CheckCircle2 className="h-3 w-3" /> Dados pré-preenchidos
            </div>
            <h4 className="mt-2 font-display text-xl font-semibold text-clean">
              {form.brand} {form.model}
            </h4>
            <p className="text-sm text-titanium">
              {form.version} · {form.yearManufacture}/{form.yearModel} · {form.color}
            </p>
            <p className="mt-3 text-[11px] text-titanium">
              Câmbio, combustível, portas e opcionais foram sugeridos pela IA. Revise tudo nas próximas etapas.
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-titanium">
            Foto da placa (opcional)
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-performance">
            Leitura por IA
          </span>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-dashed border-white/[0.1] bg-gradient-to-b from-carbon to-[#0a0d0b]">
          {reading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-carbon/70 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-performance" />
              <span className="text-xs text-clean">Lendo placa…</span>
            </div>
          )}
          {form.platePhoto ? (
            <div className="relative h-full w-full">
              <img
                src={form.platePhoto}
                alt="Foto da placa"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-carbon/80 px-2.5 py-1 text-[10px] text-clean hover:bg-carbon"
              >
                <X className="h-3 w-3" /> Remover
              </button>
            </div>
          ) : (
            <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-3 text-titanium transition-colors hover:text-clean">
              <div className="relative grid h-14 w-14 place-items-center rounded-full bg-performance/10">
                <Camera className="h-6 w-6 text-performance" />
              </div>
              <div className="text-center">
                <div className="text-sm text-clean">Toque para fotografar a placa</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em]">
                  Mantenha enquadrada e legível
                </div>
              </div>
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onPhoto(e.target.files)}
              />
            </label>
          )}
        </div>

        <ul className="mt-3 space-y-1.5 text-[11px] text-titanium">
          <li>· Boa iluminação, sem reflexos diretos</li>
          <li>· Placa ocupando o centro do quadro</li>
          <li>· Todos os 7 caracteres visíveis</li>
        </ul>
      </div>
    </div>
  );
}
