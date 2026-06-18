import type { Fuel, Transmission } from "@/types";
import { ChoiceGroup, Field, inputCls } from "./fields";
import type { StepProps } from "./types";

export function SpecsStep({ form, set }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Field label="Câmbio" required>
        <ChoiceGroup
          value={form.transmission}
          onChange={(v) => set("transmission", v as Transmission)}
          options={[
            { value: "automatic", label: "Automático" },
            { value: "manual", label: "Manual" },
            { value: "cvt", label: "CVT" },
            { value: "automated", label: "Automatizado" },
          ]}
        />
      </Field>
      <Field label="Combustível" required>
        <ChoiceGroup
          value={form.fuel}
          onChange={(v) => set("fuel", v as Fuel)}
          options={[
            { value: "flex", label: "Flex" },
            { value: "gasoline", label: "Gasolina" },
            { value: "diesel", label: "Diesel" },
            { value: "hybrid", label: "Híbrido" },
            { value: "electric", label: "Elétrico" },
          ]}
        />
      </Field>
      <Field label="Cor" required>
        <input
          value={form.color}
          onChange={(e) => set("color", e.target.value)}
          className={inputCls}
          placeholder="Branco Polar, Preto Carbono..."
        />
      </Field>
      <Field label="Portas">
        <ChoiceGroup
          value={form.doors}
          onChange={(v) => set("doors", v)}
          options={[
            { value: "2", label: "2" },
            { value: "4", label: "4" },
          ]}
        />
      </Field>
    </div>
  );
}
