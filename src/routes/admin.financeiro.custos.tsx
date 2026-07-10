import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronDown, Clock, Loader2, Search, Wrench } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { COST_TYPE_LABEL } from "@/components/admin/CostsMarginTab";
import { formatBRL, formatBRLExact, formatDateBR } from "@/lib/format";
import { agingTone, daysInStock } from "@/lib/aging";
import { listAllCosts, listAllAcquisitions } from "@/services/costsService";
import { listSales } from "@/services/salesService";
import { listVehicles } from "@/services/vehiclesService";
import type { Sale } from "@/types/sale";
import type { VehicleCost } from "@/types/finance";
import type { Vehicle } from "@/types/vehicle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/financeiro/custos")({
  component: VehicleCostsPage,
});

type StatusKind = "stock" | "sold" | "reserved";
type StatusFilter = "all" | "stock" | "sold";
type SortKey = "invested" | "margin_desc" | "margin_asc" | "days";

interface Row {
  vehicle: Vehicle;
  costs: VehicleCost[];
  costsTotal: number;
  acquisition: number | null;
  invested: number;
  sale: Sale | null;
  status: StatusKind;
  isSold: boolean;
  announced: number;
  saleValue: number | null;
  /** margem prevista (pátio) ou real (vendido); null se não dá para calcular */
  margin: number | null;
  days: number;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: "invested", label: "Maior investido" },
  { key: "margin_desc", label: "Maior margem" },
  { key: "margin_asc", label: "Menor margem" },
  { key: "days", label: "Mais tempo no pátio" },
];

const STATUS_LABEL: Record<StatusKind, string> = {
  stock: "No pátio",
  sold: "Vendido",
  reserved: "Reservado",
};

function VehicleCostsPage() {
  const { data: costs = [], isLoading: loadingCosts } = useQuery({
    queryKey: ["all-costs"],
    queryFn: listAllCosts,
  });
  const { data: acquisitions = [] } = useQuery({
    queryKey: ["all-acquisitions"],
    queryFn: listAllAcquisitions,
  });
  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: listVehicles,
    staleTime: 5 * 60 * 1000,
  });
  const { data: sales = [] } = useQuery({ queryKey: ["sales"], queryFn: listSales });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("invested");

  const isLoading = loadingCosts || loadingVehicles;

  // ── monta as linhas para TODOS os veículos ──
  const rows = useMemo<Row[]>(() => {
    const acqByVehicle = new Map(acquisitions.map((a) => [a.vehicleId, a.acquisitionPrice]));
    const costsByVehicle = new Map<string, VehicleCost[]>();
    for (const c of costs) {
      const list = costsByVehicle.get(c.vehicleId) ?? [];
      list.push(c);
      costsByVehicle.set(c.vehicleId, list);
    }
    const saleByVehicle = new Map(sales.map((s) => [s.vehicleId, s]));

    return vehicles
      .filter((v) => v.status !== "inactive")
      .map((v): Row => {
        const vehicleCosts = costsByVehicle.get(v.id) ?? [];
        const costsTotal = vehicleCosts.reduce((sum, c) => sum + c.amount, 0);
        const acquisition = acqByVehicle.get(v.id) ?? null;
        const invested = (acquisition ?? 0) + costsTotal;
        const sale = saleByVehicle.get(v.id) ?? null;
        const isSold = v.status === "sold";
        const status: StatusKind = isSold ? "sold" : v.status === "reserved" ? "reserved" : "stock";
        const margin = isSold
          ? (sale ? sale.grossProfit : null)
          : acquisition !== null
            ? v.price - invested
            : null;
        return {
          vehicle: v,
          costs: vehicleCosts,
          costsTotal,
          acquisition,
          invested,
          sale,
          status,
          isSold,
          announced: v.price,
          saleValue: sale ? sale.salePrice : null,
          margin,
          days: daysInStock(v),
        };
      });
  }, [vehicles, costs, acquisitions, sales]);

  // ── totais (sempre sobre todos, independem do filtro/busca) ──
  const grandTotalCosts = costs.reduce((sum, c) => sum + c.amount, 0);
  const stockRows = rows.filter((r) => !r.isSold);
  const capitalInStock = stockRows.reduce((sum, r) => sum + r.invested, 0);
  const projectedMargin = stockRows.reduce((sum, r) => sum + (r.margin ?? 0), 0);

  // ── busca + filtro + ordenação ──
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows;
    if (statusFilter === "stock") list = list.filter((r) => !r.isSold);
    else if (statusFilter === "sold") list = list.filter((r) => r.isSold);
    if (q) {
      list = list.filter((r) => {
        const hay = `${r.vehicle.brand} ${r.vehicle.model} ${r.vehicle.version} ${STATUS_LABEL[r.status]} ${r.sale?.buyerName ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "margin_desc":
          return (b.margin ?? -Infinity) - (a.margin ?? -Infinity);
        case "margin_asc":
          return (a.margin ?? Infinity) - (b.margin ?? Infinity);
        case "days":
          return b.days - a.days;
        default:
          return b.invested - a.invested;
      }
    });
    return sorted;
  }, [rows, search, statusFilter, sort]);

  const countAll = rows.length;
  const countStock = rows.filter((r) => !r.isSold).length;
  const countSold = rows.filter((r) => r.isSold).length;

  return (
    <>
      <AdminTopbar
        title="Custos por veículo"
        subtitle="Quanto foi investido, e quanto rende, em cada carro"
      />
      <div className="flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
        {isLoading ? (
          <div className="grid place-items-center rounded-2xl border border-border bg-card py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-border bg-card py-20 text-center">
            <Wrench className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum veículo cadastrado ainda.</p>
          </div>
        ) : (
          <>
            {/* Totais */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <TotalCard
                label="Capital em estoque"
                value={formatBRL(capitalInStock)}
                hint={`${countStock} ${countStock === 1 ? "carro" : "carros"} no pátio · aquisição + custos`}
                highlight
              />
              <TotalCard
                label="Custos totais lançados"
                value={formatBRL(grandTotalCosts)}
                hint={`${costs.length} lançamentos`}
              />
              <TotalCard
                label="Margem prevista no pátio"
                value={formatBRL(projectedMargin)}
                hint="se vender pelo preço anunciado"
                tone={projectedMargin >= 0 ? "positive" : "negative"}
              />
            </div>

            {/* Barra: busca + filtros + ordenar */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar veículo, modelo ou comprador…"
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                  Todos <Count n={countAll} />
                </FilterChip>
                <FilterChip active={statusFilter === "stock"} onClick={() => setStatusFilter("stock")}>
                  No pátio <Count n={countStock} />
                </FilterChip>
                <FilterChip active={statusFilter === "sold"} onClick={() => setStatusFilter("sold")}>
                  Vendidos <Count n={countSold} />
                </FilterChip>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-full border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="Ordenar por"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista */}
            {visible.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border border-border bg-card py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum veículo encontrado com esses filtros.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visible.map((row) => (
                  <VehicleCostCard key={row.vehicle.id} row={row} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function VehicleCostCard({ row }: { row: Row }) {
  const [open, setOpen] = useState(false);
  const { vehicle: v, costs, costsTotal, acquisition, invested, isSold, saleValue, margin, days, sale } = row;
  const marginPositive = (margin ?? 0) >= 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
        <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          {v.mainImage && <img src={v.mainImage} alt="" className="h-full w-full object-cover" />}
        </div>

        {/* Nome + status + subinfo */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/veiculos/$id"
              params={{ id: v.id }}
              className="truncate font-display text-sm font-semibold text-foreground hover:text-primary"
            >
              {v.brand} {v.model} {v.version}
            </Link>
            <StatusPill kind={row.status} />
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {isSold ? (
              <>
                vendido{sale ? ` em ${formatDateBR(sale.soldAt)}` : ""}
                {sale?.buyerName ? ` · ${sale.buyerName}` : ""}
              </>
            ) : (
              <span className={cn("inline-flex items-center gap-1", agingCls(days))}>
                <Clock className="h-3 w-3" />
                {days} {days === 1 ? "dia" : "dias"} no pátio
              </span>
            )}
          </div>
        </div>

        {/* Números principais */}
        <div className="grid w-full grid-cols-3 gap-3 sm:w-auto sm:min-w-[340px]">
          <Stat label="Investido" value={formatBRL(invested)} />
          <Stat
            label={isSold ? "Vendido por" : "Anunciado"}
            value={isSold ? (saleValue !== null ? formatBRL(saleValue) : "—") : formatBRL(v.price)}
          />
          <Stat
            label={isSold ? "Margem real" : "Margem prevista"}
            value={
              margin !== null
                ? formatBRL(margin)
                : acquisition === null
                  ? "—"
                  : formatBRL(margin ?? 0)
            }
            tone={margin === null ? undefined : marginPositive ? "positive" : "negative"}
            sub={margin === null && acquisition === null ? "sem aquisição" : undefined}
          />
        </div>

        {/* Expandir custos */}
        {costs.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {open ? "ocultar" : `ver ${costs.length} ${costs.length === 1 ? "custo" : "custos"}`}
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
          </button>
        )}
      </div>

      {open && costs.length > 0 && (
        <ul className="divide-y divide-border border-t border-border">
          {costs.map((cost) => (
            <li key={cost.id} className="flex items-center gap-4 px-5 py-2.5">
              <span className="w-28 shrink-0 text-[11px] text-muted-foreground sm:w-32">
                {COST_TYPE_LABEL[cost.costType]}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {cost.description}
              </span>
              <span className="hidden w-24 shrink-0 text-right text-[11px] text-muted-foreground sm:block">
                {formatDateBR(cost.incurredAt)}
              </span>
              <span className="w-28 shrink-0 text-right font-display text-sm tabular text-foreground">
                {formatBRLExact(cost.amount)}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between bg-muted px-5 py-2.5">
            <span className="text-xs font-medium text-muted-foreground">Total de custos</span>
            <span className="font-display text-sm font-semibold tabular text-foreground">
              {formatBRLExact(costsTotal)}
            </span>
          </li>
        </ul>
      )}
    </section>
  );
}

function agingCls(days: number): string {
  const tone = agingTone(days);
  return tone === "critical"
    ? "text-destructive"
    : tone === "warning" || tone === "attention"
      ? "text-warning"
      : "text-muted-foreground";
}

function StatusPill({ kind }: { kind: StatusKind }) {
  const cls =
    kind === "sold"
      ? "bg-success/10 text-success"
      : kind === "reserved"
        ? "bg-warning/10 text-warning"
        : "bg-info/10 text-info";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", cls)}>
      {STATUS_LABEL[kind]}
    </span>
  );
}

function Stat({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
  sub?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="truncate text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "truncate font-display text-sm font-semibold tabular",
          tone === "positive" ? "text-success" : tone === "negative" ? "text-destructive" : "text-foreground",
        )}
      >
        {value}
      </div>
      {sub && <div className="truncate text-[9px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return <span className="text-[10px] opacity-60">({n})</span>;
}

function TotalCard({
  label,
  value,
  hint,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
  tone?: "positive" | "negative";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-display text-2xl font-semibold tabular",
          tone === "positive"
            ? "text-success"
            : tone === "negative"
              ? "text-destructive"
              : highlight
                ? "text-primary"
                : "text-foreground",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
