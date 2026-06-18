import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listVehicles } from "@/services/vehiclesService";
import { listLeads } from "@/services/leadsService";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import type { Lead } from "@/types/lead";
import type { Vehicle } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  CircleDollarSign,
  Percent,
  Sparkles,
  Flame,
  Clock,
  Trophy,
  Download,
  ArrowUpRight,
  Target,
  Zap,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/admin/relatorios")({
  component: RelatoriosPage,
});

const PERIODS = [
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "90d", label: "90 dias" },
  { id: "ytd", label: "Ano" },
] as const;
type PeriodId = (typeof PERIODS)[number]["id"];

const SOURCE_LABEL: Record<string, string> = {
  site_vehicle: "Site (Veículo)",
  site_form: "Site (Formulário)",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google",
  other: "Outros",
};

function seeded(key: string, salt = 1) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h * salt) % 1000;
}

function RelatoriosPage() {
  const [period, setPeriod] = useState<PeriodId>("30d");
  const { data: vehicles = [] } = useQuery({ queryKey: ["admin", "vehicles"], queryFn: listVehicles, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });
  const { data: leads = [] } = useQuery({ queryKey: ["admin", "leads"], queryFn: listLeads, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false });

  const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 180;

  // Synthetic evolution series — leads, negotiations, sales
  const series = useMemo(() => buildSeries(days), [days]);
  const totals = useMemo(() => series.reduce(
    (a, p) => ({ leads: a.leads + p.leads, negs: a.negs + p.negs, sales: a.sales + p.sales }),
    { leads: 0, negs: 0, sales: 0 },
  ), [series]);
  const revenue = totals.sales * 78500;
  const ticket = totals.sales > 0 ? revenue / totals.sales : 0;
  const convRate = totals.leads > 0 ? (totals.sales / totals.leads) * 100 : 0;

  // Funnel
  const funnelStages = useMemo(() => {
    const base = totals.leads || 100;
    return [
      { key: "leads", label: "Leads recebidos", value: base, tone: "performance" as const },
      { key: "contacted", label: "Contatados", value: Math.round(base * 0.78), tone: "info" as const },
      { key: "negotiating", label: "Em negociação", value: Math.round(base * 0.42), tone: "warning" as const },
      { key: "proposal", label: "Proposta enviada", value: Math.round(base * 0.21), tone: "yellow" as const },
      { key: "sold", label: "Vendas fechadas", value: Math.max(totals.sales, Math.round(base * 0.11)), tone: "racing" as const },
    ];
  }, [totals]);

  // Mock most-viewed
  const mostWanted = useMemo(() => {
    return [...vehicles]
      .map((v) => ({
        v,
        views: 200 + (seeded(v.id, 13) % 2200),
        leads: 4 + (seeded(v.id, 7) % 22),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [vehicles]);

  // Stale stock with synthetic days
  const staleStock = useMemo(() => {
    return vehicles
      .map((v, i) => ({ v, days: [22, 38, 48, 61, 74, 92, 105, 31][i % 8] }))
      .filter((x) => x.days >= 45)
      .sort((a, b) => b.days - a.days);
  }, [vehicles]);

  // Sales reps mock
  const reps = useMemo(() => [
    { name: "Lucas Henrique", initials: "LH", deals: 8, revenue: 612_000, conv: 32, streak: 4 },
    { name: "Camila Vieira", initials: "CV", deals: 6, revenue: 489_500, conv: 28, streak: 2 },
    { name: "Rafael Boschetti", initials: "RB", deals: 5, revenue: 398_900, conv: 24, streak: 0 },
    { name: "Patricia Lemos", initials: "PL", deals: 4, revenue: 312_800, conv: 19, streak: 1 },
    { name: "Diego Almeida", initials: "DA", deals: 3, revenue: 221_400, conv: 14, streak: 0 },
  ], []);
  const repsMaxRevenue = Math.max(...reps.map((r) => r.revenue));

  // Sources from real leads + synthetic conv
  const sources = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => map.set(l.source, (map.get(l.source) ?? 0) + 1));
    const total = leads.length || 1;
    return Array.from(map.entries())
      .map(([src, count]) => {
        const conv = 8 + (seeded(src, 5) % 28); // 8% — 35%
        return { src, count, share: (count / total) * 100, conv };
      })
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  return (
    <>
      <AdminTopbar
        title="Inteligência Comercial"
        subtitle="Relatórios executivos · decisões com dados"
        actions={
          <div className="flex items-center gap-2">
            <div role="tablist" aria-label="Período" className="hidden items-center gap-1 rounded-lg border border-white/[0.08] bg-premium p-1 md:flex">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={period === p.id}
                  onClick={() => setPeriod(p.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    period === p.id
                      ? "bg-performance/15 text-performance"
                      : "text-titanium hover:text-clean",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <span className="hidden">
              {/* Exportar PDF — funcionalidade futura */}
            </span>
          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Seletor de período — mobile */}
        <div
          role="tablist"
          aria-label="Período"
          className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 md:hidden [&::-webkit-scrollbar]:hidden"
        >
          {PERIODS.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={period === p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "shrink-0 snap-start rounded-lg border px-4 py-2 text-xs font-medium transition-colors",
                period === p.id
                  ? "border-performance/40 bg-performance/15 text-performance"
                  : "border-white/[0.08] text-titanium",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Executive summary */}
        <ExecutiveSummary
          period={period}
          totals={totals}
          revenue={revenue}
          convRate={convRate}
        />

        {/* KPI strip */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={Users} label="Leads recebidos" value={totals.leads.toLocaleString("pt-BR")} delta={+18.4} sub="vs. período anterior" />
          <Kpi icon={Target} label="Negociações" value={totals.negs.toLocaleString("pt-BR")} delta={+9.7} sub="taxa de avanço" />
          <Kpi icon={CircleDollarSign} label="Receita" value={formatBRL(revenue)} delta={+12.1} sub={`${totals.sales} vendas`} accent />
          <Kpi icon={Percent} label="Conversão" value={`${convRate.toFixed(1)}%`} delta={+2.3} sub={`Ticket ${formatBRL(ticket || 0)}`} />
        </section>

        {/* Evolution chart */}
        <EvolutionChart series={series} />

        {/* Funnel + AI insights */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <FunnelChart className="lg:col-span-3" stages={funnelStages} />
          <AiInsights className="lg:col-span-2" />
        </div>

        {/* Most wanted + stale stock */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <MostWanted rows={mostWanted} />
          <StaleStock rows={staleStock} />
        </div>

        {/* Reps + sources */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <RepsRanking className="xl:col-span-3" reps={reps} maxRevenue={repsMaxRevenue} />
          <SourcesPanel className="xl:col-span-2" sources={sources} />
        </div>
      </div>
    </>
  );
}

/* ============================================================== */
/* Synthetic data                                                  */
/* ============================================================== */

function buildSeries(days: number) {
  // Reduce daily resolution for long periods
  const step = days <= 30 ? 1 : days <= 90 ? 3 : 7;
  const pts: { d: string; leads: number; negs: number; sales: number }[] = [];
  for (let i = days - 1; i >= 0; i -= step) {
    const t = Date.now() - i * 86400000;
    const date = new Date(t);
    // Curve with weekly oscillation + growth trend
    const phase = Math.sin((i / days) * Math.PI * 4);
    const trend = 1 - i / (days * 2.2);
    const leads = Math.round(18 + 14 * phase + 26 * trend);
    const negs = Math.round(leads * (0.42 + 0.06 * Math.sin(i / 5)));
    const sales = Math.max(1, Math.round(negs * (0.28 + 0.05 * Math.cos(i / 4))));
    pts.push({
      d: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      leads,
      negs,
      sales,
    });
  }
  return pts;
}

/* ============================================================== */
/* Components                                                      */
/* ============================================================== */

function ExecutiveSummary({
  period,
  totals,
  revenue,
  convRate,
}: {
  period: PeriodId;
  totals: { leads: number; negs: number; sales: number };
  revenue: number;
  convRate: number;
}) {
  const label = PERIODS.find((p) => p.id === period)?.label.toLowerCase();
  return (
    <section
      aria-label="Resumo executivo"
      className="relative overflow-hidden rounded-2xl border border-performance/20 bg-gradient-to-br from-premium via-premium to-[#0E1B14] p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-performance/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-racing/10 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-performance/15 text-performance">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-performance">
              resumo executivo · últimos {label}
            </span>
          </div>
          <p className="mt-3 font-display text-xl leading-snug text-clean lg:text-2xl">
            Sua revenda gerou{" "}
            <span className="text-performance">{formatBRL(revenue)}</span> em{" "}
            <strong className="text-clean">{totals.sales} vendas</strong>, com{" "}
            <strong className="text-clean">{totals.leads.toLocaleString("pt-BR")}</strong> leads e{" "}
            <strong className="text-clean">{convRate.toFixed(1)}%</strong> de conversão.
          </p>
          <p className="mt-2 text-sm text-titanium">
            Crescimento consistente em leads orgânicos. O funil mostra perda relevante entre{" "}
            <span className="text-clean">Negociação</span> e <span className="text-clean">Proposta</span> — foco
            em scripts e follow-up estruturado pode liberar receita adicional.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone="up" label={`+${(12.1).toFixed(1)}% receita`} />
          <Pill tone="up" label={`+${(18.4).toFixed(1)}% leads`} />
          <Pill tone="warn" label="2 alertas de estoque" />
        </div>
      </div>
    </section>
  );
}

function Pill({ tone, label }: { tone: "up" | "down" | "warn"; label: string }) {
  const t =
    tone === "up"
      ? "bg-performance/12 text-performance border-performance/30"
      : tone === "warn"
        ? "bg-warning/12 text-warning border-warning/30"
        : "bg-destructive/12 text-destructive border-destructive/30";
  const Icon = tone === "down" ? TrendingDown : tone === "warn" ? AlertTriangle : TrendingUp;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium",
        t,
      )}
    >
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  sub,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  delta: number;
  sub?: string;
  accent?: boolean;
}) {
  const positive = delta >= 0;
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-premium p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-performance/40",
        accent && "bg-gradient-to-br from-premium to-[#0F1411]",
      )}
    >
      {accent && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-performance/15 blur-3xl"
        />
      )}
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-titanium">{label}</div>
          <div className="mt-3 font-display text-3xl font-semibold tabular text-clean">{value}</div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-performance/15 text-performance">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="relative mt-3 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            positive
              ? "bg-performance/12 text-performance"
              : "bg-destructive/12 text-destructive",
          )}
        >
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {positive ? "+" : ""}
          {delta.toFixed(1)}%
        </span>
        {sub && <span className="truncate text-[11px] text-titanium">{sub}</span>}
      </div>
    </div>
  );
}

/* ---------- Evolution chart ---------- */

function EvolutionChart({
  series,
}: {
  series: { d: string; leads: number; negs: number; sales: number }[];
}) {
  const W = 1000;
  const H = 280;
  const padX = 40;
  const padY = 24;
  const maxY = Math.max(...series.map((p) => Math.max(p.leads, p.negs, p.sales))) * 1.15;
  const stepX = (W - padX * 2) / Math.max(series.length - 1, 1);
  const yScale = (v: number) => H - padY - (v / maxY) * (H - padY * 2);

  const lineFor = (key: "leads" | "negs" | "sales") =>
    series.map((p, i) => `${i === 0 ? "M" : "L"} ${padX + i * stepX} ${yScale(p[key])}`).join(" ");
  const areaFor = (key: "leads" | "negs" | "sales") =>
    `${lineFor(key)} L ${padX + (series.length - 1) * stepX} ${H - padY} L ${padX} ${H - padY} Z`;

  const gridY = [0, 0.25, 0.5, 0.75, 1].map((p) => H - padY - p * (H - padY * 2));

  return (
    <section
      aria-label="Evolução de leads, negociações e vendas"
      className="overflow-hidden rounded-2xl border border-white/[0.06] bg-premium"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-6 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-clean">Evolução do funil</h2>
          <p className="text-xs text-titanium">Leads · Negociações · Vendas no período selecionado.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px]">
          <Legend color="bg-performance" label="Leads" />
          <Legend color="bg-info" label="Negociações" />
          <Legend color="bg-racing" label="Vendas" />
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Gráfico de evolução">
          <defs>
            <linearGradient id="grad-leads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-performance)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-performance)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad-negs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad-sales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-racing)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-racing)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridY.map((y, i) => (
            <line
              key={i}
              x1={padX}
              x2={W - padX}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 4"
            />
          ))}
          {[0.25, 0.5, 0.75, 1].map((p, i) => (
            <text
              key={i}
              x={padX - 8}
              y={H - padY - p * (H - padY * 2) + 4}
              textAnchor="end"
              fontSize="10"
              fill="rgba(255,255,255,0.35)"
            >
              {Math.round((maxY * p) / 5) * 5}
            </text>
          ))}

          <path d={areaFor("leads")} fill="url(#grad-leads)" />
          <path d={areaFor("negs")} fill="url(#grad-negs)" />
          <path d={areaFor("sales")} fill="url(#grad-sales)" />

          <path d={lineFor("leads")} fill="none" stroke="var(--color-performance)" strokeWidth="2" />
          <path d={lineFor("negs")} fill="none" stroke="var(--color-info)" strokeWidth="2" />
          <path d={lineFor("sales")} fill="none" stroke="var(--color-racing)" strokeWidth="2.5" />

          {series.map((p, i) =>
            i % Math.ceil(series.length / 8) === 0 ? (
              <text
                key={i}
                x={padX + i * stepX}
                y={H - 6}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(255,255,255,0.4)"
              >
                {p.d}
              </text>
            ) : null,
          )}

          {series.map((p, i) => (
            <circle
              key={`s-${i}`}
              cx={padX + i * stepX}
              cy={yScale(p.sales)}
              r="2.5"
              fill="var(--color-racing)"
            />
          ))}
        </svg>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-titanium">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      {label}
    </span>
  );
}

/* ---------- Funnel ---------- */

function FunnelChart({
  className,
  stages,
}: {
  className?: string;
  stages: { key: string; label: string; value: number; tone: "performance" | "info" | "warning" | "yellow" | "racing" }[];
}) {
  const max = stages[0].value || 1;
  const toneClass: Record<string, string> = {
    performance: "from-performance to-performance/60",
    info: "from-info to-info/60",
    warning: "from-warning to-warning/60",
    yellow: "from-yellow-300 to-yellow-300/60",
    racing: "from-racing to-performance",
  };
  return (
    <section
      aria-label="Funil de conversão"
      className={cn("rounded-2xl border border-white/[0.06] bg-premium", className)}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-clean">Funil de conversão</h2>
          <p className="text-xs text-titanium">Taxa de avanço entre etapas do pipeline.</p>
        </div>
        <span className="rounded-full bg-performance/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-performance tabular">
          {((stages[stages.length - 1].value / max) * 100).toFixed(1)}% e2e
        </span>
      </div>
      <ol className="space-y-3 p-6">
        {stages.map((s, i) => {
          const width = (s.value / max) * 100;
          const prev = i > 0 ? stages[i - 1].value : null;
          const advance = prev ? (s.value / prev) * 100 : 100;
          return (
            <li key={s.key} className="relative">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-clean">{s.label}</span>
                <span className="flex items-center gap-3">
                  {i > 0 && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]",
                        advance >= 60
                          ? "bg-performance/12 text-performance"
                          : advance >= 35
                            ? "bg-warning/12 text-warning"
                            : "bg-destructive/12 text-destructive",
                      )}
                    >
                      {advance.toFixed(0)}% avanço
                    </span>
                  )}
                  <span className="tabular text-titanium">{s.value}</span>
                </span>
              </div>
              <div
                className="relative h-10 overflow-hidden rounded-lg bg-white/[0.03]"
                style={{ width: `${Math.max(width, 4)}%`, transition: "width 600ms ease" }}
              >
                <div
                  className={cn(
                    "h-full bg-gradient-to-r",
                    toneClass[s.tone],
                  )}
                />
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="font-display text-sm font-semibold text-carbon mix-blend-screen">
                    {((s.value / max) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ---------- AI Insights ---------- */

function AiInsights({ className }: { className?: string }) {
  const items = [
    {
      icon: Zap,
      title: "Reduzir preço do Honda City 2020 em R$ 2.500",
      reason: "67 dias em estoque, 8 leads sem conversão. Mediana do mercado caiu 4%.",
      tone: "warning" as const,
    },
    {
      icon: Flame,
      title: "Reativar 3 leads em Negociação há mais de 5 dias",
      reason: "Janela ideal de fechamento expirando — alta probabilidade de perda.",
      tone: "danger" as const,
    },
    {
      icon: Target,
      title: "Investir mais em Instagram",
      reason: "Canal com maior taxa de conversão (32%) e menor custo por lead.",
      tone: "performance" as const,
    },
    {
      icon: Sparkles,
      title: "Gerar conteúdo para o Renegade 2021",
      reason: "Veículo mais procurado da semana — ainda sem reels publicado.",
      tone: "info" as const,
    },
  ];
  return (
    <section
      aria-label="Insights da IA"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-performance/25 bg-gradient-to-br from-premium to-[#0E1B14]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-performance/20 blur-3xl"
      />
      <div className="relative flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-performance/15 text-performance">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-clean">Insights da IA</h2>
            <p className="text-[11px] text-titanium">Recomendações automáticas para o período.</p>
          </div>
        </div>
        <span className="rounded-full border border-performance/30 bg-performance/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-performance tabular">
          ao vivo
        </span>
      </div>
      <ul className="relative divide-y divide-white/[0.04]">
        {items.map((it, i) => {
          const Icon = it.icon;
          const tone =
            it.tone === "danger"
              ? "bg-destructive/12 text-destructive"
              : it.tone === "warning"
                ? "bg-warning/12 text-warning"
                : it.tone === "info"
                  ? "bg-info/12 text-info"
                  : "bg-performance/12 text-performance";
          return (
            <li key={i} className="group flex gap-3 px-6 py-4 transition-colors hover:bg-white/[0.02]">
              <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg", tone)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-clean">{it.title}</div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-titanium">{it.reason}</p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-titanium opacity-0 transition-opacity group-hover:opacity-100" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- Most wanted ---------- */

function MostWanted({ rows }: { rows: { v: Vehicle; views: number; leads: number }[] }) {
  const max = Math.max(...rows.map((r) => r.views), 1);
  return (
    <section aria-label="Veículos mais procurados" className="rounded-2xl border border-white/[0.06] bg-premium">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-clean">Veículos mais procurados</h2>
          <p className="text-xs text-titanium">Top 5 por visualizações e leads recebidos.</p>
        </div>
        <Trophy className="h-4 w-4 text-performance" />
      </div>
      <ul className="divide-y divide-white/[0.04]">
        {rows.map((r, i) => (
          <li key={r.v.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-performance/10 font-display text-xs font-semibold text-performance">
              {i + 1}
            </span>
            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
              <img src={r.v.mainImage} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-clean">
                {r.v.brand} {r.v.model}
              </div>
              <div className="truncate text-[11px] text-titanium">
                {r.v.yearModel} · {formatBRL(r.v.price)}
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-performance to-racing"
                  style={{ width: `${(r.views / max) * 100}%` }}
                />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-display text-sm font-semibold tabular text-clean">{r.views.toLocaleString("pt-BR")}</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-titanium">{r.leads} leads</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Stale stock ---------- */

function StaleStock({ rows }: { rows: { v: Vehicle; days: number }[] }) {
  const bucket = (d: number) =>
    d >= 90
      ? { label: "+90 dias", tone: "destructive" }
      : d >= 60
        ? { label: "+60 dias", tone: "warning" }
        : { label: "+45 dias", tone: "yellow" };

  const counts = {
    d45: rows.filter((r) => r.days >= 45 && r.days < 60).length,
    d60: rows.filter((r) => r.days >= 60 && r.days < 90).length,
    d90: rows.filter((r) => r.days >= 90).length,
  };

  return (
    <section aria-label="Veículos parados em estoque" className="rounded-2xl border border-white/[0.06] bg-premium">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-clean">Estoque parado</h2>
          <p className="text-xs text-titanium">Veículos com baixa rotatividade — atenção comercial.</p>
        </div>
        <div className="hidden gap-1.5 sm:flex">
          <span className="rounded-full bg-yellow-300/10 px-2 py-0.5 text-[10px] text-yellow-300">45d · {counts.d45}</span>
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] text-warning">60d · {counts.d60}</span>
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive">90d · {counts.d90}</span>
        </div>
      </div>
      <ul className="divide-y divide-white/[0.04]">
        {rows.length === 0 && (
          <li className="px-6 py-8 text-center text-xs text-titanium">Estoque saudável — nenhum veículo parado.</li>
        )}
        {rows.slice(0, 6).map((r) => {
          const b = bucket(r.days);
          const toneBadge =
            b.tone === "destructive"
              ? "bg-destructive/15 text-destructive border-destructive/30"
              : b.tone === "warning"
                ? "bg-warning/15 text-warning border-warning/30"
                : "bg-yellow-300/15 text-yellow-300 border-yellow-300/30";
          return (
            <li key={r.v.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]">
              <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                <img src={r.v.mainImage} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-clean">
                  {r.v.brand} {r.v.model}
                </div>
                <div className="truncate text-[11px] text-titanium">{formatBRL(r.v.price)}</div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  toneBadge,
                )}
              >
                <Clock className="h-3 w-3" /> {r.days}d
              </span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]", toneBadge)}>
                {b.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- Reps ranking ---------- */

function RepsRanking({
  className,
  reps,
  maxRevenue,
}: {
  className?: string;
  reps: { name: string; initials: string; deals: number; revenue: number; conv: number; streak: number }[];
  maxRevenue: number;
}) {
  return (
    <section aria-label="Ranking de vendedores" className={cn("rounded-2xl border border-white/[0.06] bg-premium", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-clean">Ranking de vendedores</h2>
          <p className="text-xs text-titanium">Performance individual no período.</p>
        </div>
        <Trophy className="h-4 w-4 text-performance" />
      </div>
      {/* Mobile: cards empilhados */}
      <div className="space-y-2 p-4 md:hidden">
        {reps.map((r, i) => (
          <div key={r.name} className="rounded-xl border border-white/[0.06] bg-carbon p-3">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-xs font-semibold",
                  i === 0 ? "bg-performance/20 text-performance" : "bg-white/[0.04] text-titanium",
                )}
              >
                {i + 1}
              </span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-performance/30 to-racing/20 text-xs font-medium text-clean">
                {r.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-clean">{r.name}</div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-titanium">comercial</div>
              </div>
              {r.streak > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-performance/10 px-2 py-0.5 text-[10px] text-performance">
                  <Flame className="h-3 w-3" /> {r.streak}
                </span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.04] pt-3 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-titanium">Vendas</div>
                <div className="font-display text-sm font-semibold tabular text-clean">{r.deals}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-titanium">Receita</div>
                <div className="font-display text-sm font-semibold tabular text-clean">{formatBRL(r.revenue)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-titanium">Conversão</div>
                <div
                  className={cn(
                    "font-display text-sm font-semibold tabular",
                    r.conv >= 25 ? "text-performance" : r.conv >= 15 ? "text-warning" : "text-destructive",
                  )}
                >
                  {r.conv}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.16em] text-titanium">
              <th className="px-6 py-3 font-medium">#</th>
              <th className="px-2 py-3 font-medium">Vendedor</th>
              <th className="px-4 py-3 text-right font-medium">Vendas</th>
              <th className="px-4 py-3 text-right font-medium">Receita</th>
              <th className="px-4 py-3 font-medium">Conversão</th>
              <th className="px-6 py-3 text-right font-medium">Sequência</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {reps.map((r, i) => (
              <tr key={r.name} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-6 py-3">
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full font-display text-xs font-semibold",
                      i === 0
                        ? "bg-performance/20 text-performance"
                        : "bg-white/[0.04] text-titanium",
                    )}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-performance/30 to-racing/20 text-xs font-medium text-clean">
                      {r.initials}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-clean">{r.name}</div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-titanium">comercial</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-display text-sm font-semibold tabular text-clean">
                  {r.deals}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="font-display text-sm font-semibold tabular text-clean">{formatBRL(r.revenue)}</div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-performance to-racing"
                      style={{ width: `${(r.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tabular",
                      r.conv >= 25
                        ? "bg-performance/12 text-performance"
                        : r.conv >= 15
                          ? "bg-warning/12 text-warning"
                          : "bg-destructive/12 text-destructive",
                    )}
                  >
                    {r.conv}%
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  {r.streak > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-performance/10 px-2 py-0.5 text-[10px] text-performance">
                      <Flame className="h-3 w-3" /> {r.streak} sem.
                    </span>
                  ) : (
                    <span className="text-[10px] text-titanium">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------- Sources panel ---------- */

function SourcesPanel({
  className,
  sources,
}: {
  className?: string;
  sources: { src: string; count: number; share: number; conv: number }[];
}) {
  const colors: Record<string, string> = {
    site_vehicle: "bg-performance",
    site_form: "bg-racing",
    whatsapp: "bg-info",
    instagram: "bg-yellow-300",
    facebook: "bg-purple-400",
    google: "bg-warning",
    other: "bg-white/40",
  };
  return (
    <section aria-label="Origem dos leads" className={cn("rounded-2xl border border-white/[0.06] bg-premium", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-clean">Origem dos leads</h2>
          <p className="text-xs text-titanium">Volume e taxa de conversão por canal.</p>
        </div>
      </div>

      {/* stacked bar */}
      <div className="px-6 pt-5">
        <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.04]">
          {sources.map((s) => (
            <div
              key={s.src}
              className={cn("h-full", colors[s.src] ?? "bg-white/40")}
              style={{ width: `${s.share}%` }}
              title={`${SOURCE_LABEL[s.src] ?? s.src}: ${s.share.toFixed(0)}%`}
            />
          ))}
        </div>
      </div>

      <ul className="divide-y divide-white/[0.04] px-2 py-3">
        {sources.map((s) => (
          <li key={s.src} className="flex items-center gap-3 px-4 py-3">
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", colors[s.src] ?? "bg-white/40")} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-clean">{SOURCE_LABEL[s.src] ?? s.src}</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-titanium">
                {s.count} leads · {s.share.toFixed(0)}% do total
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tabular",
                s.conv >= 25
                  ? "bg-performance/12 text-performance"
                  : s.conv >= 15
                    ? "bg-warning/12 text-warning"
                    : "bg-destructive/12 text-destructive",
              )}
            >
              {s.conv}% conv.
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
