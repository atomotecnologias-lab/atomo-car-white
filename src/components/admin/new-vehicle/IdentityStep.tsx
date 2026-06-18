import { CheckCircle2 } from "lucide-react";
import { MOCK_BRANDS } from "@/data/mockBrands";
import { Field, inputCls } from "./fields";
import type { StepProps } from "./types";

export function IdentityStep({ form, set }: StepProps) {
  const brandOptions =
    form.brand && !MOCK_BRANDS.includes(form.brand)
      ? [form.brand, ...MOCK_BRANDS]
      : MOCK_BRANDS;
  return (
    <div className="space-y-5">
      {form.plateLookupDone && (
        <div className="flex items-center gap-2 rounded-xl border border-performance/20 bg-performance/[0.05] px-4 py-3 text-xs text-clean">
          <CheckCircle2 className="h-3.5 w-3.5 text-performance" />
          <span>
            Dados pré-preenchidos pela placa <strong>{form.plate}</strong>. Revise e ajuste se
            necessário.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Marca" required>
          <select
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
            className={inputCls}
          >
            <option value="">Selecione...</option>
            {brandOptions.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Modelo" required>
          <input
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
            className={inputCls}
            placeholder="Compass, Corolla, T-Cross..."
          />
        </Field>
        <Field label="Versão" required className="md:col-span-2">
          <input
            value={form.version}
            onChange={(e) => set("version", e.target.value)}
            className={inputCls}
            placeholder="Limited 2.0 Turbo Diesel 4x4"
          />
        </Field>
        <Field label="Ano de fabricação" required>
          <input
            type="number"
            value={form.yearManufacture}
            onChange={(e) => set("yearManufacture", e.target.value)}
            className={inputCls}
            placeholder="2023"
          />
        </Field>
        <Field label="Ano modelo" required>
          <input
            type="number"
            value={form.yearModel}
            onChange={(e) => set("yearModel", e.target.value)}
            className={inputCls}
            placeholder="2024"
          />
        </Field>
      </div>
    </div>
  );
}
