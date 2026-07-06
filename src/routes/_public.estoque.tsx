import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { listPublishedVehicles } from "@/services/vehiclesService";
import { VehicleGrid } from "@/components/public/VehicleGrid";
import { VehicleFilters, EMPTY_FILTERS, type FiltersState } from "@/components/public/VehicleFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const estoqueSearchSchema = z.object({
  q: fallback(z.string().optional(), undefined),
  brand: fallback(z.string().optional(), undefined),
  transmission: fallback(z.string().optional(), undefined),
  fuel: fallback(z.string().optional(), undefined),
  priceMax: fallback(z.string().optional(), undefined),
  yearMin: fallback(z.string().optional(), undefined),
  featured: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/_public/estoque")({
  validateSearch: zodValidator(estoqueSearchSchema),
  head: () => ({
    meta: [
      { title: "Estoque — Atomo Car" },
      { name: "description", content: "Confira nosso estoque de seminovos e usados com procedência verificada." },
      { property: "og:title", content: "Estoque — Atomo Car" },
      { property: "og:description", content: "Veículos selecionados, prontos para visita." },
      { property: "og:url", content: "https://atomocar.com.br/estoque" },
    ],
    links: [
      { rel: "canonical", href: "https://atomocar.com.br/estoque" },
    ],
  }),
  component: EstoquePage,
});

type SortKey = "recent" | "price_asc" | "price_desc" | "km_asc" | "km_desc";

function EstoquePage() {
  const search = Route.useSearch();
  const { data: vehicles = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["vehicles", "published"],
    queryFn: listPublishedVehicles,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const brands = useMemo(
    () => [...new Set(vehicles.map((v) => v.brand))].sort(),
    [vehicles],
  );

  const [filters, setFilters] = useState<FiltersState>(() => ({
    ...EMPTY_FILTERS,
    q: search.q ?? "",
    brand: search.brand ?? "all",
    transmission: search.transmission ?? "all",
    fuel: search.fuel ?? "all",
    priceMax: search.priceMax ?? "all",
    yearMin: search.yearMin ?? "all",
  }));
  const [sort, setSort] = useState<SortKey>("recent");

  // Sync when search params change (back/forward, chip clicks while on page)
  useEffect(() => {
    setFilters({
      ...EMPTY_FILTERS,
      q: search.q ?? "",
      brand: search.brand ?? "all",
      transmission: search.transmission ?? "all",
      fuel: search.fuel ?? "all",
      priceMax: search.priceMax ?? "all",
      yearMin: search.yearMin ?? "all",
    });
  }, [search.q, search.brand, search.transmission, search.fuel, search.priceMax, search.yearMin]);

  const filtered = useMemo(() => {
    let list = vehicles;
    const q = filters.q.trim().toLowerCase();
    if (q) {
      list = list.filter((v) =>
        `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(q),
      );
    }
    if (filters.brand !== "all") list = list.filter((v) => v.brand === filters.brand);
    if (filters.transmission !== "all") list = list.filter((v) => v.transmission === filters.transmission);
    if (filters.fuel !== "all") list = list.filter((v) => v.fuel === filters.fuel);
    if (filters.priceMax !== "all") list = list.filter((v) => v.price <= Number(filters.priceMax));
    if (filters.yearMin !== "all") list = list.filter((v) => v.yearModel >= Number(filters.yearMin));

    list = [...list];
    switch (sort) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price); break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price); break;
      case "km_asc":
        list.sort((a, b) => a.mileage - b.mileage); break;
      case "km_desc":
        list.sort((a, b) => b.mileage - a.mileage); break;
      default:
        list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return list;
  }, [vehicles, filters, sort]);

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            Estoque
          </div>
          <h1 className="mt-2 font-display text-4xl font-medium text-clean sm:text-5xl">
            Veículos disponíveis
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            {vehicles.length} {vehicles.length === 1 ? "veículo" : "veículos"} no estoque agora.
            Use os filtros para refinar.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[280px_1fr] lg:px-8">
        <details className="rounded-xl border border-border bg-card lg:hidden">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-clean">
            Filtros & ordenação
          </summary>
          <div className="border-t border-border p-4">
            <VehicleFilters brands={brands} value={filters} onChange={setFilters} />
          </div>
        </details>
        <div className="hidden lg:block">
          <VehicleFilters brands={brands} value={filters} onChange={setFilters} />
        </div>

        <div>
          <div className="mb-5 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-clean tabular">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "resultado" : "resultados"}
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline">Ordenar por</span>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="price_asc">Menor preço</SelectItem>
                  <SelectItem value="price_desc">Maior preço</SelectItem>
                  <SelectItem value="km_asc">Menor km</SelectItem>
                  <SelectItem value="km_desc">Maior km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-border bg-card">
                  <div className="aspect-[16/10] bg-muted" />
                  <div className="space-y-3 p-4">
                    <div className="h-2.5 w-1/3 rounded bg-muted" />
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-2.5 w-full rounded bg-muted" />
                    <div className="h-5 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">Não foi possível carregar o estoque.</p>
              <button
                onClick={() => refetch()}
                className="mt-4 text-sm text-accent hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <VehicleGrid vehicles={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}
