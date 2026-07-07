import { useState } from "react";
import { Camera, Gauge, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { readOdometerFromImage } from "@/lib/ai";
import { Field, inputCls } from "./fields";
import type { StepProps } from "./types";

export function MileageStep({ form, set }: StepProps) {
  const km = Number(form.mileage || 0);
  const [reading, setReading] = useState(false);

  const onPhoto = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    set("mileagePhoto", URL.createObjectURL(file));
    setReading(true);
    try {
      const mileage = await readOdometerFromImage(file);
      if (mileage > 0) {
        set("mileage", String(mileage));
        toast.success(
          `Quilometragem lida: ${new Intl.NumberFormat("pt-BR").format(mileage)} km`,
        );
      } else {
        toast.message("Não consegui ler o KM. Digite manualmente.");
      }
    } catch {
      toast.message("Não consegui ler o KM. Digite manualmente.");
    } finally {
      setReading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="rounded-xl border border-performance/15 bg-performance/[0.04] px-4 py-3 text-xs text-clean">
          Registre a quilometragem exata exibida no painel. A foto serve como
          comprovante e ajuda a auditar o anúncio.
        </div>

        <Field label="Quilometragem atual" required hint="Lida no painel do veículo">
          <div className="relative">
            <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-performance" />
            <input
              type="number"
              inputMode="numeric"
              value={form.mileage}
              onChange={(e) => set("mileage", e.target.value)}
              className={cn(inputCls, "pl-11 font-display text-2xl tabular")}
              placeholder="42500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.18em] text-titanium">
              km
            </span>
          </div>
          {km > 0 && (
            <p className="mt-2 text-xs text-titanium">
              Exibido como{" "}
              <span className="font-display text-performance">
                {new Intl.NumberFormat("pt-BR").format(km)} km
              </span>
            </p>
          )}
        </Field>

        <div className="grid grid-cols-3 gap-2">
          {[20000, 50000, 80000, 100000, 120000, 150000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set("mileage", String(v))}
              className="rounded-lg border border-border bg-carbon py-2 text-xs text-clean/80 hover:border-performance/30 hover:text-clean"
            >
              {new Intl.NumberFormat("pt-BR").format(v)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-titanium">
            Foto do painel (recomendada)
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-performance">
            Leitura por IA
          </span>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-dashed border-border bg-muted">
          {reading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-carbon/70 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-performance" />
              <span className="text-xs text-clean">Lendo hodômetro…</span>
            </div>
          )}
          {form.mileagePhoto ? (
            <>
              <img
                src={form.mileagePhoto}
                alt="Foto do painel"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => set("mileagePhoto", "")}
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-carbon/80 px-2.5 py-1 text-[10px] text-clean hover:bg-carbon"
              >
                <X className="h-3 w-3" /> Remover
              </button>
            </>
          ) : (
            <label className="relative flex h-full cursor-pointer flex-col items-center justify-center gap-3 text-titanium transition-colors hover:text-clean">
              {/* Guia visual de enquadramento */}
              <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-performance/30" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-24 -translate-x-1/2 bg-performance/40" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-px -translate-x-1/2 -translate-y-1/2 bg-performance/40" />

              <div className="relative grid h-14 w-14 place-items-center rounded-full bg-performance/10">
                <Camera className="h-6 w-6 text-performance" />
              </div>
              <div className="text-center">
                <div className="text-sm text-clean">Fotografar o hodômetro</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em]">
                  Centralize o display de KM
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
          <li>· Veículo ligado, display iluminado</li>
          <li>· Sem reflexo do flash sobre o painel</li>
          <li>· Foto nítida, com todos os dígitos visíveis</li>
        </ul>
      </div>
    </div>
  );
}
