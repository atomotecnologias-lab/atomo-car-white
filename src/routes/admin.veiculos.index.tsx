import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listVehicles } from "@/services/vehiclesService";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { VehicleStatusBadge } from "@/components/admin/VehicleStatusBadge";
import { QualityScoreRing } from "@/components/admin/QualityScoreRing";
import { formatBRL, formatKm, formatYear } from "@/lib/format";
import { agingTone, daysInStock } from "@/lib/aging";

import { PlusCircle, Search, ArrowUpRight, Filter, Share2, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VehicleStatus } from "@/types";

const TABS: { key: "all" | VehicleStatus; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Ativos" },
  { key: "awaiting_photos", label: "Aguardando fotos" },
  { key: "draft", label: "Rascunhos" },
  { key: "reserved", label: "Reservados" },
  { key: "sold", label: "Vendidos" },
];

const CHANNELS = ["Site", "Instagram", "Marketplace", "Google", "OLX"];

function pseudoChannels(id: string): string[] {
  const h = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CHANNELS.filter((_, i) => ((h >> i) & 1) === 1);
}

export const Route = createFileRoute("/admin/veiculos/")({
  component: VehiclesAdminPage,
});

function VehiclesAdminPage() {
  const { data: vehicles = [] } = useQuery({ queryKey: ["admin", "vehicles"], queryFn: listVehicles, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const uniqueBrands = useMemo(() => [...new Set(vehicles.map((v) => v.brand))].sort(), [vehicles]);
  const activeFilterCount = [brandFilter, minPrice, maxPrice].filter(Boolean).length;

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (tab !== "all" && v.status !== tab) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !v.brand.toLowerCase().includes(q) &&
          !v.model.toLowerCase().includes(q) &&
          !v.version.toLowerCase().includes(q)
        )
          return false;
      }
      if (brandFilter && v.brand !== brandFilter) return false;
      if (minPrice && v.price < Number(minPrice)) return false;
      if (maxPrice && v.price > Number(maxPrice)) return false;
      return true;
    });
  }, [vehicles, tab, query, brandFilter, minPrice, maxPrice]);

  return (
    <>
      <AdminTopbar
        title="Estoque"
        subtitle={`${vehicles.length} no estoque · ${vehicles.filter((v) => v.isPublished).length} publicados`}
        actions={
          <Link
            to="/admin/veiculos/novo"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-performance px-4 text-xs font-medium text-carbon transition-colors hover:bg-racing"
          >
            <PlusCircle className="h-4 w-4" />
            Novo veículo
          </Link>
        }
      />

      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-premium p-3">
          <div className="flex w-full items-center gap-1 overflow-x-auto sm:w-auto [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => {
              const count = t.key === "all" ? vehicles.length : vehicles.filter((v) => v.status === t.key).length;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors",
                    active ? "bg-performance/15 text-performance" : "text-titanium hover:bg-white/[0.04] hover:text-clean",
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] tabular",
                      active ? "bg-performance/20" : "bg-white/[0.06]",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-titanium" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar marca, modelo..."
                className="h-9 w-full rounded-lg border border-white/[0.08] bg-carbon pl-9 pr-3 text-sm text-clean placeholder:text-titanium focus:border-performance/40 focus:outline-none sm:w-64"
              />
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className={cn(
                "relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.08] text-titanium hover:text-clean",
                activeFilterCount > 0 && "border-performance/40 text-performance",
              )}
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-performance text-[9px] font-bold text-carbon">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-premium p-14 text-center text-sm text-titanium">
            Nenhum veículo encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((v) => {
              const channels = pseudoChannels(v.id);
              const days = daysInStock(v);
              const tone = agingTone(days);
              return (
                <Link
                  key={v.id}
                  to="/admin/veiculos/$id"
                  params={{ id: v.id }}
                  className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-premium transition-all hover:-translate-y-0.5 hover:border-performance/30"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.04]">
                    <img
                      src={v.mainImage}
                      alt={`${v.brand} ${v.model}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute right-3 top-3">
                      <VehicleStatusBadge status={v.status} />
                    </div>
                    <div className="absolute left-3 top-3">
                      <QualityScoreRing value={v.qualityScore} size={42} stroke={4} />
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-titanium">
                          {v.brand}
                        </div>
                        <div className="truncate font-display text-base font-semibold text-clean">
                          {v.model}
                        </div>
                        <div className="truncate text-xs text-titanium">{v.version}</div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-titanium transition-colors group-hover:text-performance" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-titanium tabular">
                      <span>{formatYear(v.yearManufacture, v.yearModel)}</span>
                      <span className="opacity-50">•</span>
                      <span>{formatKm(v.mileage)}</span>
                      <span className="opacity-50">•</span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1",
                          tone === "attention" && "text-warning",
                          tone === "warning" && "text-warning",
                          tone === "critical" && "font-medium text-destructive",
                        )}
                      >
                        <Calendar className="h-3 w-3" />
                        {days}d
                      </span>
                    </div>

                    <div className="border-t border-white/[0.04] pt-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-titanium">Preço</div>
                      <div className="font-display text-lg font-semibold text-clean tabular">
                        {formatBRL(v.price)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 border-t border-white/[0.04] pt-3">
                      <Share2 className="h-3 w-3 text-titanium" />
                      <div className="flex flex-wrap gap-1">
                        {channels.length === 0 ? (
                          <span className="text-[10px] uppercase tracking-[0.14em] text-titanium">
                            sem publicação
                          </span>
                        ) : (
                          channels.map((c) => (
                            <span
                              key={c}
                              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-titanium"
                            >
                              {c}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />
          <aside className="relative flex h-full w-80 max-w-full flex-col border-l border-white/[0.06] bg-[#0B0F0D] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h3 className="font-display text-base font-semibold text-clean">Filtros avançados</h3>
              <button
                onClick={() => setFilterOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-titanium hover:text-clean"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div>
                <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-titanium">
                  Marca
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setBrandFilter("")}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs transition-all",
                      !brandFilter
                        ? "border-performance bg-performance/15 text-performance"
                        : "border-white/[0.08] text-clean/70 hover:text-clean",
                    )}
                  >
                    Todas
                  </button>
                  {uniqueBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBrandFilter(b === brandFilter ? "" : b)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs transition-all",
                        brandFilter === b
                          ? "border-performance bg-performance/15 text-performance"
                          : "border-white/[0.08] text-clean/70 hover:text-clean",
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-titanium">
                  Faixa de preço
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="mb-1 text-[10px] text-titanium">Mínimo</div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-lg border border-white/[0.08] bg-carbon px-3 py-2 text-sm text-clean placeholder:text-titanium/50 focus:border-performance/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] text-titanium">Máximo</div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Sem limite"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-lg border border-white/[0.08] bg-carbon px-3 py-2 text-sm text-clean placeholder:text-titanium/50 focus:border-performance/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-white/[0.06] p-4">
              <button
                onClick={() => { setBrandFilter(""); setMinPrice(""); setMaxPrice(""); }}
                className="flex-1 rounded-lg border border-white/[0.08] py-2.5 text-sm text-titanium hover:text-clean"
              >
                Limpar
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 rounded-lg bg-performance py-2.5 text-sm font-medium text-carbon hover:bg-racing"
              >
                Aplicar ({filtered.length})
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
