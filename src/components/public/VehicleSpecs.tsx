import type { Vehicle } from "@/types";
import { formatKm, formatYear, fuelLabel, transmissionLabel } from "@/lib/format";

export function VehicleSpecs({ vehicle }: { vehicle: Vehicle }) {
  const rows: { label: string; value: string }[] = [
    { label: "Marca", value: vehicle.brand },
    { label: "Modelo", value: vehicle.model },
    { label: "Versão", value: vehicle.version },
    { label: "Ano fab./mod.", value: formatYear(vehicle.yearManufacture, vehicle.yearModel) },
    { label: "Quilometragem", value: formatKm(vehicle.mileage) },
    { label: "Câmbio", value: transmissionLabel(vehicle.transmission) },
    { label: "Combustível", value: fuelLabel(vehicle.fuel) },
    { label: "Cor", value: vehicle.color },
    { label: "Portas", value: String(vehicle.doors) },
    ...(vehicle.plateFinal ? [{ label: "Final de placa", value: vehicle.plateFinal }] : []),
  ];

  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="bg-card px-5 py-3.5">
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {r.label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-clean tabular">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
