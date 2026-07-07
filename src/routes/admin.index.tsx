import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  HandCoins,
  PlusCircle,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Warehouse,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, formatBRLExact } from "@/lib/format";
import { agingTone, daysInStock } from "@/lib/aging";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { listVehicles } from "@/services/vehiclesService";
import { listAllAcquisitions, listAllCosts } from "@/services/costsService";
import { listSales, listMySales } from "@/services/salesService";
import { getOpenTotals } from "@/services/financeService";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateBR } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

const MONTH_LABEL = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function DashboardPage() {
  const { role } = useAuth();
  return role === "owner" ? <OwnerDashboard /> : <SellerDashboard />;
}

/* ═══════════════ DASHBOARD DO VENDEDOR (sem dados de dinheiro da loja) ═══════════════ */

function SellerDashboard() {
  const { member } = useAuth();
  const { data: vehicles = [] } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: listVehicles,
    staleTime: 5 * 60 * 1000,
  });
  const { data: mySales = [] } = useQuery({ queryKey: ["my-sales"], queryFn: listMySales });

  const inStock = vehicles.filter((v) => v.status !== "sold" && v.status !== "inactive");
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthSales = mySales.filter((s) => s.soldAt.startsWith(monthKey));
  const commissionTotal = mySales.reduce((sum, s) => sum + s.commissionAmount, 0);

  return (
    <>
      <AdminTopbar
        title={member ? `Olá, ${member.name.split(" ")[0]}` : "Meu painel"}
        subtitle="Seu estoque e suas vendas."
        actions={
          <Button asChild size="sm">
            <Link to="/admin/veiculos/novo">
              <PlusCircle className="h-4 w-4" />
              Novo veículo
            </Link>
          </Button>
        }
      />
      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MoneyKpi
            icon={Warehouse}
            label="Veículos no pátio"
            value={String(inStock.length)}
            hint={`${inStock.filter((v) => v.isPublished).length} publicados no site`}
            link="/admin/veiculos"
          />
          <MoneyKpi
            icon={HandCoins}
            label="Minhas vendas no mês"
            value={String(monthSales.length)}
            hint={`${mySales.length} no total`}
            link="/admin/veiculos"
            tone="positive"
          />
          <MoneyKpi
            icon={TrendingUp}
            label="Minhas comissões"
            value={formatBRL(commissionTotal)}
            hint="acumulado"
            link="/admin/veiculos"
            featured
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* Minhas vendas */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <header className="border-b border-border px-5 py-3.5">
              <h3 className="font-display text-sm font-semibold text-foreground">Minhas vendas</h3>
            </header>
            {mySales.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma venda registrada em seu nome ainda.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {mySales.slice(0, 6).map((s) => {
                  const v = vehicles.find((x) => x.id === s.vehicleId);
                  return (
                    <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="h-9 w-13 shrink-0 overflow-hidden rounded-md bg-muted">
                        {v?.mainImage && (
                          <img src={v.mainImage} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {v ? `${v.brand} ${v.model}` : "Veículo"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {formatDateBR(s.soldAt)} · {s.buyerName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-sm font-semibold tabular text-foreground">
                          {formatBRL(s.salePrice)}
                        </div>
                        <div className="text-[11px] tabular text-success">
                          comissão {formatBRLExact(s.commissionAmount)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Estoque com aging (sem custos) */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h3 className="font-display text-sm font-semibold text-foreground">
                Estoque para vender
              </h3>
              <Link to="/admin/veiculos" className="text-xs text-primary hover:underline">
                Ver todos →
              </Link>
            </header>
            <ul className="divide-y divide-border">
              {inStock
                .map((v) => ({ v, days: daysInStock(v) }))
                .sort((a, b) => b.days - a.days)
                .slice(0, 6)
                .map(({ v, days }) => {
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
                          <div className="text-[11px] text-muted-foreground">{formatBRL(v.price)}</div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 font-display text-xs font-semibold tabular",
                            tone === "healthy" && "bg-success/10 text-success",
                            tone === "attention" && "bg-warning/10 text-warning",
                            tone === "warning" && "bg-warning/15 text-warning",
                            tone === "critical" && "bg-destructive/10 text-destructive",
                          )}
                        >
                          {days}d
                        </span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

/* ═══════════════ DASHBOARD DO DONO ═══════════════ */

function OwnerDashboard() {
  const { data: vehicles = [] } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: listVehicles,
    staleTime: 5 * 60 * 1000,
  });
  const { data: acquisitions = [] } = useQuery({
    queryKey: ["all-acquisitions"],
    queryFn: listAllAcquisitions,
  });
  const { data: costs = [] } = useQuery({ queryKey: ["all-costs"], queryFn: listAllCosts });
  const { data: sales = [] } = useQuery({ queryKey: ["sales"], queryFn: listSales });
  const { data: openTotals } = useQuery({
    queryKey: ["finance", "open-totals"],
    queryFn: getOpenTotals,
  });

  // ── Capital em estoque: Σ (aquisição + custos) dos não vendidos
  const acqByVehicle = new Map(acquisitions.map((a) => [a.vehicleId, a.acquisitionPrice]));
  const costsByVehicle = new Map<string, number>();
  for (const c of costs) {
    costsByVehicle.set(c.vehicleId, (costsByVehicle.get(c.vehicleId) ?? 0) + c.amount);
  }
  const inStock = vehicles.filter((v) => v.status !== "sold" && v.status !== "inactive");
  const investedOf = (id: string) => (acqByVehicle.get(id) ?? 0) + (costsByVehicle.get(id) ?? 0);
  const capitalInStock = inStock.reduce((sum, v) => sum + investedOf(v.id), 0);

  // ── Lucro do mês + série de 6 meses + comparativo com o mês anterior
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthSales = sales.filter((s) => s.soldAt.startsWith(monthKey));
  const monthNetProfit = monthSales.reduce((sum, s) => sum + s.netProfit, 0);

  const profitSeries: { month: string; profit: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = sales.filter((s) => s.soldAt.startsWith(key));
    profitSeries.push({
      month: key,
      profit: bucket.reduce((sum, s) => sum + s.netProfit, 0),
      count: bucket.length,
    });
  }
  const maxProfit = Math.max(1, ...profitSeries.map((m) => Math.abs(m.profit)));
  const prevMonthProfit = profitSeries[4]?.profit ?? 0;
  const momDelta =
    prevMonthProfit > 0 ? ((monthNetProfit - prevMonthProfit) / prevMonthProfit) * 100 : null;

  // ── Margem média das vendas
  const avgMargin =
    sales.length > 0 ? sales.reduce((sum, s) => sum + s.netProfit, 0) / sales.length : 0;

  // ── Aging: dinheiro parado por faixa (60/90/120) + prazo médio
  const stock = inStock.map((v) => ({ vehicle: v, days: daysInStock(v), invested: investedOf(v.id) }));
  const bucket = (min: number, max: number) => {
    const items = stock.filter((r) => r.days > min && r.days <= max);
    return { count: items.length, capital: items.reduce((s, r) => s + r.invested, 0) };
  };
  const b61_90 = bucket(60, 90);
  const b91_120 = bucket(90, 120);
  const b120 = { ...bucket(120, Infinity) };
  const staleVehicles = stock.filter((r) => r.days > 60).sort((a, b) => b.days - a.days);
  const staleCapital = staleVehicles.reduce((sum, r) => sum + r.invested, 0);
  const over90 = stock.filter((r) => r.days > 90);
  const over90Capital = over90.reduce((s, r) => s + r.invested, 0);
  const avgDaysInStock =
    stock.length > 0 ? Math.round(stock.reduce((s, r) => s + r.days, 0) / stock.length) : 0;

  // ── Financeiro
  const payableOverdue = openTotals?.payableOverdue ?? 0;
  const payableUpcoming7 = (openTotals?.payableToday ?? 0) + (openTotals?.payableNext7Days ?? 0);
  const payableOpen = openTotals?.payableOpenTotal ?? 0;
  const receivableOpen = openTotals?.receivableOpenTotal ?? 0;
  const receivableOverdue = openTotals?.receivableOverdue ?? 0;
  const cashForecast = receivableOpen - payableOpen; // sobra (+) ou falta (−) prevista

  // ── Atenção hoje: só o que exige ação
  type Attention = {
    severity: "red" | "amber";
    title: string;
    value?: string;
    icon: typeof Banknote;
    link: string;
  };
  const attention: Attention[] = [];
  if (payableOverdue > 0)
    attention.push({
      severity: "red",
      icon: TriangleAlert,
      title: "Contas vencidas",
      value: formatBRL(payableOverdue),
      link: "/admin/financeiro/pagar",
    });
  if (receivableOverdue > 0)
    attention.push({
      severity: "red",
      icon: ArrowDownLeft,
      title: "Recebimentos atrasados",
      value: formatBRL(receivableOverdue),
      link: "/admin/financeiro/receber",
    });
  if (over90.length > 0)
    attention.push({
      severity: "amber",
      icon: Clock,
      title: `${over90.length} ${over90.length === 1 ? "veículo parado" : "veículos parados"} há +90 dias`,
      value: formatBRL(over90Capital),
      link: "/admin/veiculos",
    });
  if (monthSales.length === 0 && now.getDate() > 10)
    attention.push({
      severity: "amber",
      icon: TrendingDown,
      title: "Nenhuma venda ainda este mês",
      link: "/admin/vendas/nova",
    });

  const health: "green" | "amber" | "red" = attention.some((a) => a.severity === "red")
    ? "red"
    : attention.length > 0
      ? "amber"
      : "green";

  return (
    <>
      <AdminTopbar
        title="Central de Operações"
        subtitle="Tudo que importa da sua loja, num só lugar."
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/veiculos/novo">
                <PlusCircle className="h-4 w-4" />
                Novo veículo
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/vendas/nova">
                <HandCoins className="h-4 w-4" />
                Registrar venda
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
        {/* ── SAÚDE DA LOJA (veredito em ≤5s) ── */}
        <HealthBar health={health} attentionCount={attention.length} />

        {/* ── ATENÇÃO HOJE (só quando há pendências) ── */}
        {attention.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <header className="border-b border-border px-5 py-3">
              <h3 className="inline-flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                <TriangleAlert className="h-4 w-4 text-warning" />
                Atenção hoje
              </h3>
            </header>
            <ul className="divide-y divide-border">
              {attention.map((a, i) => (
                <li key={i}>
                  <Link
                    to={a.link}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                        a.severity === "red"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning",
                      )}
                    >
                      <a.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                      {a.title}
                    </span>
                    {a.value && (
                      <span
                        className={cn(
                          "font-display text-sm font-semibold tabular",
                          a.severity === "red" ? "text-destructive" : "text-warning",
                        )}
                      >
                        {a.value}
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── PLACAR DO MÊS: 4 números de dinheiro ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MoneyKpi
            icon={TrendingUp}
            label="Lucro do mês"
            value={formatBRL(monthNetProfit)}
            hint={
              momDelta !== null
                ? `${momDelta >= 0 ? "▲" : "▼"} ${Math.abs(momDelta).toFixed(0)}% vs. mês passado`
                : `${monthSales.length} venda${monthSales.length === 1 ? "" : "s"} em ${MONTH_LABEL[now.getMonth()]}`
            }
            link="/admin/vendas"
            tone={monthNetProfit >= 0 ? "positive" : "negative"}
          />
          <MoneyKpi
            icon={ArrowDownLeft}
            label="Você tem a receber"
            value={formatBRL(receivableOpen)}
            hint={receivableOverdue > 0 ? `${formatBRL(receivableOverdue)} atrasado` : "tudo em dia"}
            link="/admin/financeiro/receber"
          />
          <MoneyKpi
            icon={ArrowUpRight}
            label="A vencer (7 dias)"
            value={formatBRL(payableUpcoming7)}
            hint={
              payableOverdue > 0
                ? `${formatBRL(payableOverdue)} vencidas`
                : `${formatBRL(payableOpen)} no total`
            }
            link="/admin/financeiro/pagar"
            tone={payableOverdue > 0 ? "negative" : undefined}
          />
          <MoneyKpi
            icon={Warehouse}
            label="Capital em estoque"
            value={formatBRL(capitalInStock)}
            hint={`parado no pátio · ${inStock.length} ${inStock.length === 1 ? "carro" : "carros"}`}
            link="/admin/financeiro/custos"
          />
        </div>

        {/* ── LUCRO POR MÊS + PREVISÃO DE CAIXA ── */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <section className="rounded-2xl border border-border bg-card xl:col-span-3">
            <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">Lucro por mês</h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  margem média de {formatBRLExact(avgMargin)} por carro vendido
                </p>
              </div>
              {momDelta !== null && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    momDelta >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                  )}
                >
                  {momDelta >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(momDelta).toFixed(0)}% vs. mês passado
                </span>
              )}
            </header>
            <div className="p-5">
              <div className="flex items-end justify-between gap-2">
                {profitSeries.map((m, idx) => {
                  const isCurrent = idx === profitSeries.length - 1;
                  return (
                    <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-28 w-full items-end justify-center">
                        <div
                          title={`${formatBRLExact(m.profit)} · ${m.count} vendas`}
                          className={cn(
                            "w-2/3 max-w-[34px] rounded-t transition-all",
                            m.profit < 0
                              ? "bg-destructive/70"
                              : isCurrent
                                ? "bg-primary ring-2 ring-primary/30 ring-offset-1"
                                : "bg-primary/45",
                          )}
                          style={{
                            height: `${Math.max(4, (Math.abs(m.profit) / maxProfit) * 100)}%`,
                          }}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-wide",
                          isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {MONTH_LABEL[Number(m.month.slice(5, 7)) - 1]}
                      </span>
                      <span
                        className={cn(
                          "font-display text-[10px] font-semibold tabular",
                          m.profit >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {formatBRL(m.profit)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Previsão de caixa */}
          <section className="flex flex-col rounded-2xl border border-border bg-card xl:col-span-2">
            <header className="border-b border-border px-5 py-3.5">
              <h3 className="inline-flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                <CircleDollarSign className="h-4 w-4 text-primary" />
                Previsão de caixa
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">o que ainda entra e sai</p>
            </header>
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {cashForecast >= 0 ? "Sobra prevista" : "Falta prevista"}
                </div>
                <div
                  className={cn(
                    "mt-1 font-display text-3xl font-bold tabular",
                    cashForecast >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {formatBRL(cashForecast)}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <ArrowDownLeft className="h-3.5 w-3.5 text-success" /> A receber
                  </span>
                  <span className="font-display tabular text-foreground">
                    {formatBRL(receivableOpen)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <ArrowUpRight className="h-3.5 w-3.5 text-destructive" /> A pagar
                  </span>
                  <span className="font-display tabular text-foreground">
                    − {formatBRL(payableOpen)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── DINHEIRO PARADO NO PÁTIO (por faixa) ── */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h3 className="inline-flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                <Clock className="h-4 w-4 text-warning" />
                Dinheiro parado no pátio
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                prazo médio de estoque: {avgDaysInStock} dias
              </p>
            </div>
            <Link to="/admin/veiculos" className="text-xs text-primary hover:underline">
              Ver veículos parados →
            </Link>
          </header>

          {/* Faixas 60-90 / 90-120 / 120+ */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            <BucketTile label="61–90 dias" bucket={b61_90} tone="attention" />
            <BucketTile label="91–120 dias" bucket={b91_120} tone="warning" />
            <BucketTile label="+120 dias" bucket={b120} tone="critical" />
          </div>

          {staleVehicles.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Estoque saudável — todos os carros com menos de 60 dias. 🎉
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {staleVehicles.slice(0, 4).map(({ vehicle: v, days, invested }) => {
                const tone = agingTone(days);
                const margin = invested > 0 ? v.price - invested : null;
                return (
                  <li key={v.id}>
                    <Link
                      to="/admin/veiculos/$id"
                      params={{ id: v.id }}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {v.mainImage && (
                          <img src={v.mainImage} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {v.brand} {v.model}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          investido {invested > 0 ? formatBRL(invested) : "—"} · anunciado{" "}
                          {formatBRL(v.price)}
                          {margin !== null && (
                            <span className={margin >= 0 ? "text-success" : "text-destructive"}>
                              {" "}
                              · margem {formatBRL(margin)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 font-display text-xs font-semibold tabular",
                          tone === "critical"
                            ? "bg-destructive/10 text-destructive"
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

        {/* ── AÇÕES RÁPIDAS ── */}
        <div>
          <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Ações rápidas</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <QuickAction
              icon={HandCoins}
              title="Registrar venda"
              desc="Lucro e comissão na hora"
              link="/admin/vendas/nova"
              featured
            />
            <QuickAction
              icon={PlusCircle}
              title="Novo veículo"
              desc="Cadastro guiado com placa"
              link="/admin/veiculos/novo"
            />
            <QuickAction
              icon={Wrench}
              title="Lançar custo"
              desc="Lavagem, mecânica, docs"
              link="/admin/financeiro/custos"
            />
          </div>
        </div>
      </div>
    </>
  );
}

/** Veredito de saúde da loja em uma linha — verde/âmbar/vermelho. */
function HealthBar({
  health,
  attentionCount,
}: {
  health: "green" | "amber" | "red";
  attentionCount: number;
}) {
  const cfg = {
    green: {
      cls: "border-success/30 bg-success/10 text-success",
      icon: CheckCircle2,
      title: "Sua loja está saudável",
      sub: "Nada vencido e sem capital muito parado.",
    },
    amber: {
      cls: "border-warning/40 bg-warning/10 text-warning",
      icon: TriangleAlert,
      title: "Alguns pontos pedem atenção",
      sub: `${attentionCount} ${attentionCount === 1 ? "item" : "itens"} em “Atenção hoje” abaixo.`,
    },
    red: {
      cls: "border-destructive/40 bg-destructive/10 text-destructive",
      icon: TriangleAlert,
      title: "Sua loja precisa de ação hoje",
      sub: `${attentionCount} ${attentionCount === 1 ? "pendência" : "pendências"} para resolver — veja abaixo.`,
    },
  }[health];
  const Icon = cfg.icon;
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border px-5 py-3.5", cfg.cls)}>
      <Icon className="h-5 w-5 shrink-0" />
      <div className="min-w-0">
        <div className="font-display text-sm font-semibold">{cfg.title}</div>
        <div className="text-[12px] text-foreground/70">{cfg.sub}</div>
      </div>
    </div>
  );
}

/** Faixa de aging: nº de carros + capital parado. */
function BucketTile({
  label,
  bucket,
  tone,
}: {
  label: string;
  bucket: { count: number; capital: number };
  tone: "attention" | "warning" | "critical";
}) {
  const empty = bucket.count === 0;
  return (
    <div className="px-4 py-3 text-center">
      <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-display text-xl font-bold tabular",
          empty
            ? "text-muted-foreground/50"
            : tone === "critical"
              ? "text-destructive"
              : "text-warning",
        )}
      >
        {bucket.count}
      </div>
      <div className="text-[11px] text-muted-foreground">
        {empty ? "—" : formatBRL(bucket.capital)}
      </div>
    </div>
  );
}

/* ───────────────────────── componentes ───────────────────────── */

function MoneyKpi({
  icon: Icon,
  label,
  value,
  hint,
  link,
  tone,
  featured,
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
  hint?: string;
  link: string;
  tone?: "positive" | "negative";
  featured?: boolean;
}) {
  return (
    <Link
      to={link}
      className={cn(
        "group rounded-2xl border p-4 transition-all hover:-translate-y-0.5",
        featured
          ? "border-primary/30 bg-primary/5 hover:border-primary/50"
          : tone === "negative"
            ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
            : "border-border bg-card hover:border-primary/40",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <Icon
          className={cn(
            "h-4 w-4",
            featured
              ? "text-primary"
              : tone === "negative"
                ? "text-destructive"
                : tone === "positive"
                  ? "text-success"
                  : "text-muted-foreground",
          )}
        />
      </div>
      <div
        className={cn(
          "mt-2 font-display text-2xl font-bold tabular",
          featured
            ? "text-primary"
            : tone === "negative"
              ? "text-destructive"
              : tone === "positive"
                ? "text-success"
                : "text-foreground",
        )}
      >
        {value}
      </div>
      {hint && (
        <div
          className={cn(
            "mt-1 text-[11px]",
            /vencid|atrasad/i.test(hint) ? "font-semibold text-destructive" : "text-muted-foreground",
          )}
        >
          {hint}
        </div>
      )}
    </Link>
  );
}

function QuickAction({
  icon: Icon,
  title,
  desc,
  link,
  featured,
}: {
  icon: typeof Banknote;
  title: string;
  desc: string;
  link: string;
  featured?: boolean;
}) {
  return (
    <Link
      to={link}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border p-4 transition-all hover:-translate-y-0.5",
        featured
          ? "border-primary bg-primary hover:bg-primary/90"
          : "border-border bg-card hover:border-primary/40",
      )}
    >
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
          featured ? "bg-white/15 text-primary-foreground" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div
          className={cn(
            "text-sm font-semibold",
            featured ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {title}
        </div>
        <div
          className={cn(
            "truncate text-[11px]",
            featured ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {desc}
        </div>
      </div>
    </Link>
  );
}
