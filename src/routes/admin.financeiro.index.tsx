import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Loader2, TriangleAlert, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, formatBRLExact, formatDateBR } from "@/lib/format";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import {
  getMonthlyCashflow,
  getOpenTotals,
  listEntries,
} from "@/services/financeService";

export const Route = createFileRoute("/admin/financeiro/")({
  component: FinanceOverviewPage,
});

const MONTH_LABEL = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function monthLabel(key: string): string {
  const m = Number(key.slice(5, 7));
  return MONTH_LABEL[m - 1] ?? key;
}

function FinanceOverviewPage() {
  const { data: totals, isLoading: loadingTotals } = useQuery({
    queryKey: ["finance", "open-totals"],
    queryFn: getOpenTotals,
  });
  const { data: cashflow = [], isLoading: loadingFlow } = useQuery({
    queryKey: ["finance", "cashflow"],
    queryFn: () => getMonthlyCashflow(6),
  });
  const { data: openEntries = [] } = useQuery({
    queryKey: ["entries", "open-short"],
    queryFn: () => listEntries({ openOnly: true }),
  });

  const isLoading = loadingTotals || loadingFlow;
  const maxFlow = Math.max(1, ...cashflow.map((m) => Math.max(m.inflow, m.outflow)));
  const upcoming = openEntries
    .filter((e) => e.kind === "payable")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);

  return (
    <>
      <AdminTopbar
        title="Financeiro"
        subtitle="Fluxo de caixa, contas e saúde financeira da loja"
      />
      <div className="flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
        {isLoading ? (
          <div className="grid place-items-center rounded-2xl border border-border bg-card py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* KPIs de abertura */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi
                label="Contas vencidas"
                value={formatBRLExact(totals?.payableOverdue ?? 0)}
                tone={totals && totals.payableOverdue > 0 ? "negative" : undefined}
                icon={TriangleAlert}
                link="/admin/financeiro/pagar"
              />
              <Kpi
                label="A pagar (hoje + 7 dias)"
                value={formatBRLExact((totals?.payableToday ?? 0) + (totals?.payableNext7Days ?? 0))}
                icon={ArrowUpRight}
                link="/admin/financeiro/pagar"
              />
              <Kpi
                label="A pagar em aberto"
                value={formatBRLExact(totals?.payableOpenTotal ?? 0)}
                icon={ArrowUpRight}
                link="/admin/financeiro/pagar"
              />
              <Kpi
                label="A receber em aberto"
                value={formatBRLExact(totals?.receivableOpenTotal ?? 0)}
                tone="positive"
                icon={ArrowDownLeft}
                link="/admin/financeiro/receber"
              />
            </div>

            {/* Fluxo de caixa 6 meses */}
            <section className="rounded-2xl border border-border bg-card">
              <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Fluxo de caixa — últimos 6 meses
                  </h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    entradas e saídas realizadas (lançamentos pagos)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-success" /> Entradas
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-destructive/70" /> Saídas
                  </span>
                </div>
              </header>
              <div className="p-5">
                <div className="flex items-end justify-between gap-2 sm:gap-4">
                  {cashflow.map((m) => (
                    <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-36 w-full items-end justify-center gap-1">
                        <div
                          title={`Entradas ${formatBRLExact(m.inflow)}`}
                          className="w-1/3 max-w-[26px] rounded-t bg-success transition-all"
                          style={{ height: `${(m.inflow / maxFlow) * 100}%` }}
                        />
                        <div
                          title={`Saídas ${formatBRLExact(m.outflow)}`}
                          className="w-1/3 max-w-[26px] rounded-t bg-destructive/70 transition-all"
                          style={{ height: `${(m.outflow / maxFlow) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {monthLabel(m.month)}
                      </span>
                      <span
                        className={cn(
                          "font-display text-[11px] font-semibold tabular",
                          m.net >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {m.net >= 0 ? "+" : ""}
                        {formatBRL(m.net)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Próximos compromissos */}
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h3 className="font-display text-sm font-semibold text-foreground">
                  Próximos compromissos
                </h3>
                <Link
                  to="/admin/financeiro/pagar"
                  className="text-xs text-primary hover:underline"
                >
                  Ver todas →
                </Link>
              </header>
              {upcoming.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  Nenhuma conta em aberto. 🎉
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {upcoming.map((e) => (
                    <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                      <span
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                          e.status === "overdue"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {e.status === "overdue" ? (
                          <TriangleAlert className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {e.description}
                        </div>
                        <div
                          className={cn(
                            "text-[11px]",
                            e.status === "overdue"
                              ? "font-medium text-destructive"
                              : "text-muted-foreground",
                          )}
                        >
                          {e.status === "overdue" ? "VENCIDA — " : "vence "}
                          {formatDateBR(e.dueDate)}
                        </div>
                      </div>
                      <span className="font-display text-sm font-semibold tabular text-foreground">
                        {formatBRLExact(e.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Atalho para custos */}
            <Link
              to="/admin/financeiro/custos"
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Wrench className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">Custos por veículo</div>
                <div className="text-[11px] text-muted-foreground">
                  Quanto foi investido em cada carro do pátio
                </div>
              </div>
              <span className="text-primary">→</span>
            </Link>
          </>
        )}
      </div>
    </>
  );
}

function Kpi({
  label,
  value,
  tone,
  icon: Icon,
  link,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
  icon: typeof ArrowUpRight;
  link: string;
}) {
  return (
    <Link
      to={link}
      className={cn(
        "rounded-2xl border p-4 transition-colors hover:border-primary/40",
        tone === "negative" ? "border-destructive/30 bg-destructive/5" : "border-border bg-card",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "negative"
              ? "text-destructive"
              : tone === "positive"
                ? "text-success"
                : "text-muted-foreground",
          )}
        />
      </div>
      <div
        className={cn(
          "mt-2 font-display text-xl font-semibold tabular",
          tone === "negative" ? "text-destructive" : tone === "positive" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </div>
    </Link>
  );
}
