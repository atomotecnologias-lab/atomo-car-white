import type { Vehicle } from "@/types";
import { Link } from "@tanstack/react-router";
import { formatBRL, formatKm, formatYear } from "@/lib/format";
import { ArrowUpRight } from "lucide-react";

/**
 * Asymmetric featured grid: 1 large card + smaller cards.
 */
export function FeaturedVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  if (vehicles.length === 0) return null;
  const [hero, ...rest] = vehicles;
  const others = rest.slice(0, 3);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <FeatureBig vehicle={hero} />
      <div className="grid gap-5">
        {others.map((v) => (
          <FeatureSmall key={v.id} vehicle={v} />
        ))}
      </div>
    </div>
  );
}

function FeatureBig({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link
      to="/veiculo/$slug"
      params={{ slug: vehicle.slug }}
      className="group relative overflow-hidden rounded-xl bg-carbon"
    >
      <div className="aspect-[4/5] lg:aspect-auto lg:h-full">
        <img
          src={vehicle.mainImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="h-full w-full object-cover opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-7 text-clean">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
          Em destaque
        </div>
        <h3 className="mt-2 font-display text-3xl font-medium leading-tight sm:text-4xl">
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="mt-1 text-sm text-clean/75">{vehicle.version}</p>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-clean/75 tabular">
            <span>{formatYear(vehicle.yearManufacture, vehicle.yearModel)}</span>
            <span className="opacity-50">•</span>
            <span>{formatKm(vehicle.mileage)}</span>
            <span className="opacity-50">•</span>
            <span>{vehicle.color}</span>
          </div>
          <div className="font-display text-2xl text-clean tabular">{formatBRL(vehicle.price)}</div>
        </div>
      </div>
    </Link>
  );
}

function FeatureSmall({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link
      to="/veiculo/$slug"
      params={{ slug: vehicle.slug }}
      className="group grid gap-4 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-performance sm:grid-cols-[200px_1fr]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted sm:aspect-auto">
        <img
          src={vehicle.mainImage}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col justify-between p-5 pr-6">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {vehicle.brand}
          </div>
          <h4 className="mt-0.5 font-display text-lg font-medium text-clean">
            {vehicle.model} <span className="text-muted-foreground">{vehicle.version}</span>
          </h4>
          <div className="mt-2 text-xs text-muted-foreground tabular">
            {formatYear(vehicle.yearManufacture, vehicle.yearModel)} • {formatKm(vehicle.mileage)}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="font-display text-xl text-clean tabular">{formatBRL(vehicle.price)}</div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-clean" />
        </div>
      </div>
    </Link>
  );
}
