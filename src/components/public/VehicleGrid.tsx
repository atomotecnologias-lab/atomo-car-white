import type { Vehicle } from "@/types";
import { VehicleCard } from "./VehicleCard";

export function VehicleGrid({ vehicles }: { vehicles: Vehicle[] }) {
  if (vehicles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
        <div className="font-display text-xl text-clean">Nenhum veículo encontrado</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Tente ajustar os filtros ou voltar mais tarde — nosso estoque é atualizado com frequência.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} />
      ))}
    </div>
  );
}
