import { Link } from "@tanstack/react-router";
import type { Vehicle } from "@/types";
import { formatBRL, formatKm, formatYear, fuelLabel, transmissionLabel, statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Gauge, Fuel, Cog, Calendar, ArrowUpRight } from "lucide-react";

export function VehicleCard({ vehicle, className }: { vehicle: Vehicle; className?: string }) {
  return (
    <Link
      to="/veiculo/$slug"
      params={{ slug: vehicle.slug }}
      className={cn(
        "group block overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-performance hover:shadow-[var(--shadow-elevated)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {vehicle.mainImage ? (
          <img
            src={vehicle.mainImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/[0.03]">
            <span className="text-xs uppercase tracking-widest text-muted-foreground/40">Sem foto</span>
          </div>
        )}
        {vehicle.isFeatured && (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-carbon/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-clean backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Destaque
          </div>
        )}
        {vehicle.status === "reserved" && (
          <div className="absolute right-3 top-3 rounded-full bg-warning/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-clean">
            {statusLabel(vehicle.status)}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {vehicle.brand}
        </div>
        <h3 className="mt-1 font-display text-xl font-medium leading-tight text-clean">
          {vehicle.model}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
          {vehicle.version}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-y border-border py-3 text-xs text-foreground/80">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="tabular">{formatYear(vehicle.yearManufacture, vehicle.yearModel)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="tabular">{formatKm(vehicle.mileage)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cog className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{transmissionLabel(vehicle.transmission)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{fuelLabel(vehicle.fuel)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Preço
            </div>
            <div className="font-display text-2xl font-medium tabular text-clean">
              {formatBRL(vehicle.price)}
            </div>
          </div>
          <div className="inline-flex items-center gap-1 text-xs font-medium text-clean opacity-0 transition-opacity group-hover:opacity-100">
            Ver detalhes
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
