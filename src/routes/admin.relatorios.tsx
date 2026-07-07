import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Car,
  CircleDollarSign,
  Clock,
  Percent,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, formatBRLExact } from "@/lib/format";
import { agingTone, daysInStock } from "@/lib/aging";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { listVehicles } from "@/services/vehiclesService";
import { listSales } from "@/services/salesService";
import { listTeamMembers } from "@/services/teamService";
import { listAllAcquisitions, listAllCosts } from "@/services/costsService";

export const Route = createFileRoute("/admin/relatorios")({
  component: ReportsPage,
});

type PeriodKey = "30d" | "90d" | "6m" | "all";

const PERIODS: { key: PeriodKey; label: string; days: number | null }[] = [
  { key: "30d", label: "30 dias", days: 30 },
  { key: "90d", label: "90 dias", days: 90 },
  { key: "6m", label: "6 meses", days: 183 },
  { key: "all", label: "Tudo", days: null },
];

const MONTH_LABEL = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function ReportsPage() {
  const [period, setPeriod] = useState<PeriodKey>("6m");

  const { data: sales = [] } = useQuery({ queryKey: ["sales"], queryFn: listSales });
  const { data: vehicles = [] } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: listVehicles,
  });
  const { data: members = [] } = useQuery({ queryKey: ["team"], queryFn: listTeamMembers });
  const { data: acquisitions = [] } = useQuery({
    queryKey: ["all-acquisitions"],
    queryFn: listAllAcquisitions,
  });
  const { data: costs = [] } = useQuery({ queryKey: ["all-costs"], queryFn: listAllCosts });

  const filteredSales = useMemo(() => {
    const days = PERIODS.find((p) => p.key === period)?.days;
    if (!days) return sales;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffIso = cutoff.toISOString().slice(0, 10);
    return sales.filter((s) => s.soldAt >= cutoffIso);
  }, [sales, period]);

  // ── Resumo executivo
  const revenue = filteredSales.reduce((sum, s) => sum + s.salePrice, 0);
  const netProfit = filteredSales.reduce((sum, s) => sum + s.netProfit, 0);
  const marginPct = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const avgTicket = filteredSales.length > 0 ? revenue / filteredSales.length : 0;

  // ── Série mensal (6 meses)
  const now = new Date();
  const monthly = useMemo(() => {
    const list: { month: string; revenue: number; profit: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const bucket = sales.filter((s) => s.soldAt.startsWith(key));
      list.push({
        month: key,
        revenue: bucket.reduce((sum, s) => sum + s.salePrice, 0),
        profit: bucket.reduce((sum, s) => sum + s.netProfit, 0),
        count: bucket.length,
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales]);
  const maxRevenue = Math.max(1, ...monthly.map((m) => m.revenue));

  // ── Ranking de vendedores (REAL, das vendas)
  const ranking = useMemo(() => {
    const byId = new Map<
      string,
      { name: string; count: number; revenue: number; profit: number; commission: number }
    >();
    for (const s of filteredSales) {
      const id = s.sellerId ?? "none";
      const name = s.sellerId
        ? (members.find((m) => m.id === s.sellerId)?.name ?? "Vendedor")
        : "Venda da casa";
      const row = byId.get(id) ?? { name, count: 0, revenue: 0, profit: 0, commission: 0 };
      row.count += 1;
      row.revenue += s.salePrice;
      row.profit += s.netProfit;
      row.commission += s.commissionAmount;
      byId.set(id, row);
    }
    return [...byId.values()].sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales, members]);

  // ── Estoque parado com capital
  const acqByVehicle = new Map(acquisitions.map((a) => [a.vehicleId, a.acquisitionPrice]));
  const costsByVehicle = new Map<string, number>();
  for (const c of costs) {
    costsByVehicle.set(c.vehicleId, (costsByVehicle.get(c.vehicleId) ?? 0) + c.amount);
  }
  const staleStock = vehicles
    .filter((v) => v.status !== "sold" && v.status !== "inactive")
    .map((v) => ({
      vehicle: v,
      days: daysInStock(v),
      invested: (acqByVehicle.get(v.id) ?? 0) + (costsByVehicle.get(v.id) ?? 0),
    }))
    .filter((r) => r.days > 45)
    .sort((a, b) => b.days - a.days);

  return (
    <>
      <AdminTopbar
        title="Relatórios"
        subtitle="Números reais da operação — vendas, lucro e estoque"
        actions={
          <div className="flex gap-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  period === p.key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />
      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Resumo executivo */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi icon={CircleDollarSign} label="Receita" value={formatBRL(revenue)} hint={`${filteredSales.length} vendas no período`} />
          <Kpi
            icon={TrendingUp}
            label="Lucro líquido"
            value={formatBRL(netProfit)}
            tone={netProfit >= 0 ? "positive" : "negative"}
            hint={`margem ${marginPct.toFixed(1)}%`}
          />
          <Kpi icon={Car} label="Ticket médio" value={formatBRL(avgTicket)} />
          <Kpi
            icon={Percent}
            label="Lucro médio por carro"
            value={formatBRLExact(filteredSales.length ? netProfit / filteredSales.length : 0)}
          />
        </div>

        {/* Receita x lucro por mês */}
        <section className="rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Receita e lucro por mês
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/40" /> Receita
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Lucro
              </span>
            </div>
          </header>
          <div className="p-5">
            <div className="flex items-end justify-between gap-2 sm:gap-4">
              {monthly.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="relative flex h-36 w-full items-end justify-center">
                    <div
                      title={`Receita ${formatBRLExact(m.revenue)}`}
                      className="w-2/3 max-w-[36px] rounded-t bg-muted-foreground/25"
                      style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                    />
                    <div
                      title={`Lucro ${formatBRLExact(m.profit)}`}
                      className="absolute bottom-0 w-2/3 max-w-[36px] rounded-t bg-primary"
                      style={{ height: `${(Math.max(0, m.profit) / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {MONTH_LABEL[Number(m.month.slice(5, 7)) - 1]}
                  </span>
                  <span className="font-display text-[10px] font-semibold tabular text-foreground">
                    {m.count} {m.count === 1 ? "venda" : "vendas"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* Ranking de vendedores */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <header className="border-b border-border px-5 py-3.5">
              <h3 className="inline-flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                <Trophy className="h-4 w-4 text-warning" />
                Ranking de vendedores
              </h3>
            </header>
            {ranking.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma venda no período.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {ranking.map((r, i) => (
                  <li key={r.name} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-xs font-bold",
                        i === 0 ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i + 1}º
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.count} venda{r.count === 1 ? "" : "s"} · comissão{" "}
                        {formatBRLExact(r.commission)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-sm font-semibold tabular text-foreground">
                        {formatBRL(r.revenue)}
                      </div>
                      <div
                        className={cn(
                          "text-[11px] tabular",
                          r.profit >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        lucro {formatBRL(r.profit)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Estoque parado */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <header className="border-b border-border px-5 py-3.5">
              <h3 className="inline-flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                <Clock className="h-4 w-4 text-warning" />
                Estoque parado (+45 dias)
              </h3>
            </header>
            {staleStock.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Nenhum veículo parado acima de 45 dias.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {staleStock.slice(0, 6).map(({ vehicle: v, days, invested }) => {
                  const tone = agingTone(days);
                  return (
                    <li key={v.id}>
                      <Link
                        to="/admin/veiculos/$id"
                        params={{ id: v.id }}
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="h-9 w-13 shrink-0 overflow-hidden rounded-md bg-muted">
                          {v.mainImage && (
                            <img src={v.mainImage} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">
                            {v.brand} {v.model}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {invested > 0 ? `${formatBRL(invested)} investidos` : "sem custos lançados"}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 font-display text-xs font-semibold tabular",
                            tone === "critical"
                              ? "bg-destructive/10 text-destructive"
                              : tone === "warning"
                                ? "bg-warning/15 text-warning"
                                : "bg-warning/10 text-warning",
                          )}
                        >
                          {days}d
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Car;
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div
        className={cn(
          "mt-2 font-display text-2xl font-bold tabular",
          tone === "positive" && "text-success",
          tone === "negative" && "text-destructive",
          !tone && "text-foreground",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
