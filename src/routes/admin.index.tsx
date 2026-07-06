import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listVehicles } from "@/services/vehiclesService";
import { listLeads } from "@/services/leadsService";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import type { Vehicle } from "@/types";
import type { Lead, LeadStatus } from "@/types/lead";
import {
  Car,
  Users,
  Clock,
  Repeat2,
  PlusCircle,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  Camera,
  CircleDollarSign,
  MessageCircleWarning,
  Megaphone,
  Eye,
  UserPlus,
  CheckCircle2,
  TrendingUp,
  Flame,
  Activity,
  Send,
  FileText,
  Wand2,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
function hoursSince(iso?: string) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
}
// deterministic pseudo-random per id
function seeded(id: string, salt = 1) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h * salt) % 1000;
}

function DashboardPage() {
  const { data: vehicles = [], isLoading: vLoading } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: listVehicles,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const { data: leads = [], isLoading: lLoading } = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: listLeads,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Forçar "idade" sintética distribuída para demonstrar estoque envelhecido
  const aged = vehicles.map((v, i) => ({
    v,
    days: [12, 28, 45, 58, 65, 72, 88, 21][i % 8],
    views: 120 + seeded(v.id, 7) % 900,
    leadsCount: seeded(v.id, 3) % 5,
  }));

  const active = vehicles.filter((v) => v.status === "active" || v.status === "reserved");
  const published = vehicles.filter((v) => v.isPublished).length;
  const awaitingPub = vehicles.filter((v) => !v.isPublished && v.status !== "sold").length;
  const awaitingPhotos = vehicles.filter((v) => v.status === "awaiting_photos" || v.images.length < 5).length;
  const unanswered = leads.filter(
    (l) => l.status === "new" && (hoursSince(l.lastContactAt) ?? 999) > 4,
  );
  const stale = aged.filter((a) => a.days > 60);
  const tradeIns = leads.filter((l) => /troca/i.test(l.message));

  return (
    <>
      <AdminTopbar
        title="Atomo Car — Central de Operações"
        subtitle="Estoque, leads e ações da IA em um só lugar."
        actions={
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-transparent text-clean hover:bg-white/[0.06] hover:text-clean hover:border-performance/40"
            >
              <Link to="/admin/veiculos">
                <Car className="h-4 w-4" />
                Ver estoque
              </Link>
            </Button>
            <Button asChild className="bg-performance text-carbon hover:bg-racing">
              <Link to="/admin/veiculos/novo">
                <PlusCircle className="h-4 w-4" />
                Novo veículo
              </Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* BLOCO 1 — Resumo Executivo */}
        <section
          aria-label="Resumo executivo"
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
          {vLoading ? (
            <>
              <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
            </>
          ) : (
            <>
              <KpiCard
                icon={Car}
                label="Veículos disponíveis"
                value={active.length}
                accent
                to="/admin/veiculos"
                footer={
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1 text-performance">
                      <span className="h-1.5 w-1.5 rounded-full bg-performance" />
                      {published} publicados
                    </span>
                    <span className="inline-flex items-center gap-1 text-warning">
                      <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                      {awaitingPub} aguardando
                    </span>
                  </div>
                }
                tooltip="Total de veículos ativos no estoque, com status de publicação."
              />
              <KpiCard
                icon={Users}
                label="Leads aguardando contato"
                value={unanswered.length}
                to="/admin/leads/atendimentos"
                urgency={unanswered.length > 2 ? "high" : unanswered.length > 0 ? "medium" : "low"}
                footer={
                  <span className="text-[11px] text-titanium">
                    {unanswered.length > 0
                      ? `Resposta nas próximas 2h aumenta conversão em 38%.`
                      : `Pipeline em dia — siga prospectando.`}
                  </span>
                }
                tooltip="Leads novos sem retorno há mais de 4 horas."
              />
              <KpiCard
                icon={Clock}
                label="Veículos acima de 60 dias"
                value={stale.length}
                to="/admin/veiculos"
                search={{ aging: "60" }}
                urgency={stale.length > 2 ? "high" : stale.length > 0 ? "medium" : "low"}
                footer={
                  <span className="text-[11px] text-titanium">
                    Dinheiro parado — avalie preço, fotos e impulsionamento.
                  </span>
                }
                tooltip="Veículos com mais de 60 dias no estoque. Estoque envelhecido reduz margem."
              />
              <KpiCard
                icon={Repeat2}
                label="Oportunidades de troca"
                value={tradeIns.length}
                to="/admin/leads"
                search={{ filter: "trade" }}
                trend={{ value: "+12% mês", positive: true }}
                footer={
                  <span className="text-[11px] text-titanium">
                    Clientes oferecendo veículo na negociação.
                  </span>
                }
                tooltip="Leads que mencionam veículo na troca. Ótima fonte de novo estoque."
              />
            </>
          )}
        </section>

        {/* BLOCO 2 — Hoje na operação */}
        <section
          aria-label="Hoje na operação"
          className="relative overflow-hidden rounded-2xl border border-performance/20 bg-gradient-to-br from-premium via-premium to-[#0E1B14]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-performance/15 blur-3xl"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-performance/15 text-performance">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-semibold text-clean">Hoje na operação</h2>
                <p className="text-[11px] text-titanium">Resumo operacional do dia — atualização em tempo real.</p>
              </div>
            </div>
            <span className="rounded-full border border-performance/30 bg-performance/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-performance tabular">
              ao vivo
            </span>
          </div>
          <div className="relative grid grid-cols-2 divide-x divide-y divide-white/[0.04] sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-5">
            <OpItem icon={Car} value={active.length} label="ativos" tone="performance" />
            <OpItem icon={Send} value={awaitingPub} label="aguardando publicação" tone="warning" />
            <OpItem icon={MessageCircleWarning} value={unanswered.length} label="leads sem retorno" tone="danger" />
            <OpItem icon={Clock} value={stale.length} label="acima de 60 dias" tone="warning" />
            <OpItem icon={Repeat2} value={tradeIns.length} label="oportunidades de troca" tone="info" />
          </div>
        </section>

        {/* BLOCO 3 + 6 lado a lado */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AttentionQueue
            className="lg:col-span-2"
            vehicles={aged}
            unanswered={unanswered}
            awaitingPhotos={awaitingPhotos}
          />
          <AiAssistant aged={aged} unanswered={unanswered} />
        </div>

        {/* BLOCO 4 — Estoque que precisa de atenção */}
        <StockAttentionTable rows={aged.filter((a) => a.days > 40 || a.leadsCount === 0).slice(0, 6)} loading={vLoading} />

        {/* BLOCO 5 — Pipeline comercial */}
        <PipelineBoard leads={leads} vehicles={vehicles} loading={lLoading} />

        {/* BLOCO 7 — Ações rápidas */}
        <section aria-label="Ações rápidas">
          <header className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-clean">Ações rápidas</h2>
              <p className="text-xs text-titanium">Fluxos mais usados do dia a dia.</p>
            </div>
          </header>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <QuickAction icon={PlusCircle} title="Novo veículo" desc="Cadastro guiado em 5 etapas" to="/admin/veiculos/novo" />
            <QuickAction icon={UserPlus} title="Novo lead" desc="Cadastrar contato manual" to="/admin/leads" />
            <QuickAction icon={Send} title="Publicar anúncios" desc="Aprovar fila pendente" to="/admin/marketing/publicacoes" />
            <QuickAction icon={Wand2} title="Gerar conteúdo" desc="IA para Instagram e WhatsApp" to="/admin/marketing/conteudo" />
            <QuickAction icon={Car} title="Ver estoque" desc="Operação e produção" to="/admin/veiculos" />
            <QuickAction icon={TrendingUp} title="Ver pipeline" desc="CRM e atendimentos" to="/admin/leads" />
          </div>
        </section>
      </div>
    </>
  );
}

/* ====================== Components ====================== */

function KpiSkeleton() {
  return (
    <div className="h-[140px] animate-pulse rounded-2xl border border-white/[0.06] bg-premium/60" />
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  footer,
  accent,
  urgency,
  trend,
  tooltip,
  to,
  search,
}: {
  icon: typeof Car;
  label: string;
  value: string | number;
  footer?: React.ReactNode;
  accent?: boolean;
  urgency?: "low" | "medium" | "high";
  trend?: { value: string; positive?: boolean };
  tooltip?: string;
  to?: string;
  search?: Record<string, string>;
}) {
  const urgencyRing =
    urgency === "high"
      ? "ring-1 ring-destructive/40"
      : urgency === "medium"
        ? "ring-1 ring-warning/30"
        : "";
  const iconTone =
    urgency === "high"
      ? "bg-destructive/15 text-destructive"
      : urgency === "medium"
        ? "bg-warning/15 text-warning"
        : "bg-performance/15 text-performance";
  const className = cn(
    "group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-premium p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-performance/40 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] sm:p-5",
    accent && "bg-gradient-to-br from-premium to-[#0F1411]",
    urgencyRing,
    to && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-performance/40",
  );
  const inner = (
    <>
      {accent && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-performance/15 blur-3xl"
        />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-titanium">{label}</div>
          <div className="mt-3 font-display text-2xl font-semibold tabular text-clean sm:text-3xl">{value}</div>
        </div>
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg sm:h-10 sm:w-10", iconTone)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="relative mt-3 min-h-[1.25rem]">
        {trend && (
          <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-performance">
            <TrendingUp className="h-3 w-3" /> {trend.value}
          </span>
        )}
        {footer}
      </div>
      {to && (
        <ArrowUpRight
          aria-hidden
          className="absolute right-4 bottom-4 h-3.5 w-3.5 text-titanium opacity-0 transition-opacity group-hover:opacity-100"
        />
      )}
    </>
  );
  if (to) {
    return (
      <Link to={to} search={search as never} title={tooltip} className={className} aria-label={`${label} — abrir`}>
        {inner}
      </Link>
    );
  }
  return (
    <div title={tooltip} className={className}>
      {inner}
    </div>
  );
}


function OpItem({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Car;
  value: number;
  label: string;
  tone: "performance" | "warning" | "danger" | "info";
}) {
  const toneClass: Record<string, string> = {
    performance: "text-performance bg-performance/10",
    warning: "text-warning bg-warning/10",
    danger: "text-destructive bg-destructive/10",
    info: "text-info bg-info/10",
  };
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", toneClass[tone])}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="font-display text-xl font-semibold tabular text-clean">{value}</div>
        <div className="text-[11px] text-titanium">{label}</div>
      </div>
    </div>
  );
}

type AgedRow = { v: Vehicle; days: number; views: number; leadsCount: number };

function AttentionQueue({
  className,
  vehicles,
  unanswered,
  awaitingPhotos,
}: {
  className?: string;
  vehicles: AgedRow[];
  unanswered: Lead[];
  awaitingPhotos: number;
}) {
  type Item = {
    id: string;
    priority: "alta" | "média" | "baixa";
    type: string;
    icon: typeof AlertTriangle;
    label: string;
    reason: string;
    action: string;
    to: string;
  };
  const items: Item[] = [];

  unanswered.slice(0, 2).forEach((l) =>
    items.push({
      id: `lead-${l.id}`,
      priority: "alta",
      type: "Lead quente",
      icon: Flame,
      label: `${l.name} aguardando retorno`,
      reason: `Sem resposta há ${hoursSince(l.lastContactAt) ?? 0}h · ${l.message}`,
      action: "Responder agora",
      to: "/admin/leads",
    }),
  );
  vehicles
    .filter((a) => a.days > 60)
    .slice(0, 2)
    .forEach(({ v, days }) =>
      items.push({
        id: `stale-${v.id}`,
        priority: "alta",
        type: "Estoque parado",
        icon: Clock,
        label: `${v.brand} ${v.model} há ${days} dias em estoque`,
        reason: `Avaliar redução de preço atual: ${formatBRL(v.price)}`,
        action: "Resolver",
        to: `/admin/veiculos/${v.id}`,
      }),
    );
  vehicles
    .filter((a) => a.v.images.length < 8)
    .slice(0, 2)
    .forEach(({ v }) =>
      items.push({
        id: `photo-${v.id}`,
        priority: "média",
        type: "Fotos",
        icon: Camera,
        label: `${v.brand} ${v.model} — fotos internas incompletas`,
        reason: `${v.images.length} fotos · recomendado mínimo 8 para anúncio premium`,
        action: "Resolver",
        to: `/admin/veiculos/${v.id}`,
      }),
    );
  vehicles
    .filter((a) => !a.v.isPublished)
    .slice(0, 1)
    .forEach(({ v }) =>
      items.push({
        id: `pub-${v.id}`,
        priority: "média",
        type: "Anúncio",
        icon: Send,
        label: `${v.brand} ${v.model} pendente de publicação`,
        reason: "Anúncio em rascunho — não está visível no site.",
        action: "Publicar",
        to: `/admin/veiculos/${v.id}`,
      }),
    );
  vehicles
    .filter((a) => a.v.descriptionFull && a.v.descriptionFull.length < 200)
    .slice(0, 1)
    .forEach(({ v }) =>
      items.push({
        id: `desc-${v.id}`,
        priority: "baixa",
        type: "Conteúdo",
        icon: FileText,
        label: `${v.brand} ${v.model} sem descrição completa`,
        reason: "IA pode gerar descrição persuasiva em 1 clique.",
        action: "Gerar com IA",
        to: `/admin/marketing/conteudo`,
      }),
    );

  return (
    <section
      aria-label="Centro de atenção"
      className={cn("rounded-2xl border border-white/[0.06] bg-premium", className)}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-destructive/15 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-clean">Centro de atenção</h2>
            <p className="text-xs text-titanium">Fila inteligente priorizada — resolva da mais crítica.</p>
          </div>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-titanium tabular">
          {items.length} pendências
        </span>
      </div>
      <ul className="divide-y divide-white/[0.04]">
        {items.length === 0 && (
          <li className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-performance" />
            <p className="text-sm font-medium text-clean">Operação em dia</p>
            <p className="text-xs text-titanium">Nenhuma pendência crítica no momento.</p>
          </li>
        )}
        {items.map((a) => {
          const Icon = a.icon;
          const prTone =
            a.priority === "alta"
              ? "bg-destructive/15 text-destructive border-destructive/30"
              : a.priority === "média"
                ? "bg-warning/15 text-warning border-warning/30"
                : "bg-info/15 text-info border-info/30";
          return (
            <li key={a.id} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]">
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg border", prTone)}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em]", prTone)}>
                    {a.priority}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-titanium">{a.type}</span>
                </div>
                <div className="mt-1 truncate text-sm font-medium text-clean">{a.label}</div>
                <div className="mt-0.5 line-clamp-1 text-xs text-titanium">{a.reason}</div>
              </div>
              <Button asChild size="sm" variant="outline" className="border-white/10 bg-transparent text-xs hover:border-performance/40 hover:bg-performance/10 hover:text-performance">
                <Link to={a.to as "/admin"}>
                  {a.action}
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
      {awaitingPhotos > 0 && (
        <div className="border-t border-white/[0.04] px-6 py-3 text-[11px] text-titanium">
          <ImageIcon className="mr-1.5 inline h-3 w-3" />
          {awaitingPhotos} veículos com fotos incompletas no total ·{" "}
          <Link to="/admin/veiculos/qualidade" className="text-performance hover:underline">
            ver fila de qualidade
          </Link>
        </div>
      )}
    </section>
  );
}

function AiAssistant({ aged, unanswered }: { aged: AgedRow[]; unanswered: Lead[] }) {
  const worst = [...aged].sort((a, b) => b.days - a.days)[0];
  const lowConv = [...aged].sort((a, b) => b.views - a.views).find((a) => a.leadsCount === 0);

  const recs: Array<{
    icon: typeof Sparkles;
    title: string;
    detail: string;
    actions: { label: string; to: string }[];
    cta: string;
  }> = [];

  if (worst) {
    recs.push({
      icon: Clock,
      title: `${worst.v.brand} ${worst.v.model} parado há ${worst.days} dias`,
      detail: `Apenas ${worst.leadsCount} ${worst.leadsCount === 1 ? "lead" : "leads"} nas últimas 4 semanas. Estoque envelhecendo.`,
      actions: [
        { label: "Reduzir preço R$ 2.000", to: `/admin/veiculos/${worst.v.id}` },
        { label: "Impulsionar anúncio", to: `/admin/marketing/publicacoes` },
        { label: "Gerar vídeo Instagram", to: `/admin/marketing/conteudo` },
      ],
      cta: "Executar ação",
    });
  }
  if (lowConv) {
    recs.push({
      icon: Eye,
      title: `${lowConv.v.brand} ${lowConv.v.model} recebeu ${lowConv.views} visualizações sem conversão`,
      detail: `Hipótese: preço fora do mercado ou fotos pouco persuasivas.`,
      actions: [{ label: "Gerar nova estratégia", to: `/admin/marketing/conteudo` }],
      cta: "Gerar nova estratégia",
    });
  }
  if (unanswered[0]) {
    recs.push({
      icon: Flame,
      title: `Lead quente: ${unanswered[0].name}`,
      detail: `Demonstrou alto interesse. Resposta nas próximas 2h aumenta conversão em 38%.`,
      actions: [{ label: "Responder no WhatsApp", to: `/admin/leads` }],
      cta: "Responder",
    });
  }
  recs.push({
    icon: Megaphone,
    title: "Conteúdo da semana para Instagram",
    detail: "Gerar carrossel para 2 veículos recém-publicados.",
    actions: [{ label: "Gerar carrossel", to: `/admin/marketing/conteudo` }],
    cta: "Gerar agora",
  });

  return (
    <section
      aria-label="Assistente comercial IA"
      className="relative overflow-hidden rounded-2xl border border-performance/20 bg-gradient-to-br from-premium via-premium to-[#0E1B14]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-performance/20 blur-3xl"
      />
      <div className="relative border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-performance/15 text-performance">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-clean">Assistente Comercial IA</h2>
            <p className="text-[11px] text-titanium">Especialista automotivo — recomendações do dia.</p>
          </div>
        </div>
      </div>
      <ul className="relative space-y-2 p-3">
        {recs.slice(0, 3).map((r, i) => {
          const Icon = r.icon;
          return (
            <li
              key={i}
              className="rounded-xl border border-white/[0.04] bg-carbon/40 p-3 transition-all hover:border-performance/30 hover:bg-carbon/60"
            >
              <div className="flex items-start gap-2.5">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-performance" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium leading-snug text-clean">{r.title}</div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-titanium">{r.detail}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.actions.map((a, j) => (
                      <Link
                        key={j}
                        to={a.to as "/admin"}
                        className="inline-flex items-center gap-1 rounded-full border border-performance/30 bg-performance/10 px-2 py-0.5 text-[10px] font-medium text-performance transition-colors hover:bg-performance/20"
                      >
                        {a.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StockAttentionTable({ rows, loading }: { rows: AgedRow[]; loading: boolean }) {
  function statusFor(r: AgedRow): { label: string; tone: string } {
    if (r.days > 60 && r.leadsCount === 0) return { label: "Crítico", tone: "bg-destructive/15 text-destructive border-destructive/30" };
    if (r.days > 60 || r.leadsCount === 0) return { label: "Atenção", tone: "bg-warning/15 text-warning border-warning/30" };
    return { label: "Saudável", tone: "bg-performance/15 text-performance border-performance/30" };
  }
  return (
    <section aria-label="Estoque que precisa de atenção" className="overflow-hidden rounded-2xl border border-white/[0.06] bg-premium">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-warning/15 text-warning">
            <Car className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-clean">Estoque que precisa de atenção</h2>
            <p className="text-xs text-titanium">Onde está o dinheiro parado — priorize por dias × conversão.</p>
          </div>
        </div>
        <Link to="/admin/veiculos" className="inline-flex items-center gap-1 text-xs text-titanium hover:text-clean">
          Ver estoque completo <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      {/* Mobile: cards empilhados */}
      <div className="space-y-3 p-4 md:hidden">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        {!loading && rows.length === 0 && (
          <p className="py-8 text-center text-sm text-titanium">
            Estoque saudável — nenhum veículo demandando atenção.
          </p>
        )}
        {!loading &&
          rows.map((r) => {
            const s = statusFor(r);
            return (
              <div key={r.v.id} className="rounded-xl border border-white/[0.06] bg-carbon p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={r.v.mainImage}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-12 w-16 shrink-0 rounded-md object-cover ring-1 ring-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-clean">
                      {r.v.brand} {r.v.model}
                    </div>
                    <div className="truncate text-[11px] text-titanium">
                      {r.v.version} · {formatBRL(r.v.price)}
                    </div>
                  </div>
                  <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]", s.tone)}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {s.label}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-3 text-xs text-titanium">
                  <span className="tabular">
                    <span className={cn(r.days > 60 ? "text-destructive" : r.days > 45 ? "text-warning" : "text-clean")}>
                      {r.days}d
                    </span>{" "}
                    em estoque
                  </span>
                  <span className="tabular">{r.views} views</span>
                  <span className="tabular">{r.leadsCount} leads</span>
                  <Button asChild size="sm" variant="outline" className="h-9 border-white/10 bg-transparent text-xs hover:border-performance/40 hover:bg-performance/10 hover:text-performance">
                    <Link to={`/admin/veiculos/${r.v.id}` as "/admin"}>
                      Resolver
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04] text-left text-[10px] uppercase tracking-[0.16em] text-titanium">
              <th className="px-6 py-3 font-medium">Veículo</th>
              <th className="px-3 py-3 font-medium">Dias em estoque</th>
              <th className="px-3 py-3 font-medium">Visualizações</th>
              <th className="px-3 py-3 font-medium">Leads</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-4">
                    <div className="h-6 rounded bg-white/[0.04]" />
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-titanium">
                  Estoque saudável — nenhum veículo demandando atenção.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => {
                const s = statusFor(r);
                return (
                  <tr key={r.v.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.v.mainImage}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-10 w-14 rounded-md object-cover ring-1 ring-white/10"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-clean">
                            {r.v.brand} {r.v.model}
                          </div>
                          <div className="truncate text-[11px] text-titanium">
                            {r.v.version} · {r.v.yearModel} · {formatBRL(r.v.price)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 tabular text-clean">
                      <span className={cn(r.days > 60 ? "text-destructive" : r.days > 45 ? "text-warning" : "text-clean")}>
                        {r.days}d
                      </span>
                    </td>
                    <td className="px-3 py-3.5 tabular text-clean">{r.views}</td>
                    <td className="px-3 py-3.5 tabular text-clean">{r.leadsCount}</td>
                    <td className="px-3 py-3.5">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]", s.tone)}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Button asChild size="sm" variant="outline" className="border-white/10 bg-transparent text-xs hover:border-performance/40 hover:bg-performance/10 hover:text-performance">
                        <Link to={`/admin/veiculos/${r.v.id}` as "/admin"}>
                          Resolver
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PipelineBoard({ leads, vehicles, loading }: { leads: Lead[]; vehicles: Vehicle[]; loading: boolean }) {
  const stages: { key: LeadStatus; label: string; tone: string }[] = [
    { key: "new", label: "Novo lead", tone: "border-performance/30 text-performance" },
    { key: "contacted", label: "Contatado", tone: "border-info/30 text-info" },
    { key: "negotiating", label: "Negociação", tone: "border-warning/30 text-warning" },
    { key: "proposal", label: "Proposta", tone: "border-yellow-400/30 text-yellow-300" },
    { key: "sold", label: "Venda", tone: "border-white/20 text-clean" },
  ];
  const vMap = new Map(vehicles.map((v) => [v.id, v]));

  return (
    <section aria-label="Pipeline comercial" className="rounded-2xl border border-white/[0.06] bg-premium">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-info/15 text-info">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-clean">Pipeline comercial</h2>
            <p className="text-xs text-titanium">Acompanhe a jornada de cada negociação.</p>
          </div>
        </div>
        <Link to="/admin/leads" className="inline-flex items-center gap-1 text-xs text-titanium hover:text-clean">
          Abrir CRM completo <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-5">
        {stages.map((s) => {
          const list = leads.filter((l) => l.status === s.key);
          return (
            <div key={s.key} className="rounded-xl border border-white/[0.04] bg-carbon/40 p-3">
              <div className={cn("mb-3 flex items-center justify-between border-l-2 pl-2", s.tone)}>
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-clean">{s.label}</div>
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] tabular text-clean">{list.length}</span>
              </div>
              <ul className="space-y-2">
                {loading &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <li key={i} className="h-14 animate-pulse rounded-lg bg-white/[0.04]" />
                  ))}
                {!loading && list.length === 0 && (
                  <li className="rounded-lg border border-dashed border-white/[0.06] px-3 py-4 text-center text-[11px] text-titanium">
                    Vazio
                  </li>
                )}
                {!loading &&
                  list.slice(0, 3).map((l) => {
                    const v = l.vehicleId ? vMap.get(l.vehicleId) : undefined;
                    return (
                      <li key={l.id}>
                        <Link
                          to="/admin/leads"
                          className="group block rounded-lg border border-white/[0.04] bg-premium/60 p-2.5 transition-all hover:-translate-y-0.5 hover:border-performance/30"
                        >
                          <div className="flex items-center gap-2">
                            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-performance/10 text-[10px] font-medium text-performance">
                              {l.name.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-[12px] font-medium text-clean">{l.name}</div>
                              <div className="truncate text-[10px] text-titanium">
                                {v ? `${v.brand} ${v.model}` : "Sem veículo"}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
              {list.length > 3 && (
                <div className="mt-2 text-center text-[10px] text-titanium">+ {list.length - 3} no estágio</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function QuickAction({
  icon: Icon,
  title,
  desc,
  to,
  external,
}: {
  icon: typeof PlusCircle;
  title: string;
  desc: string;
  to: string;
  external?: boolean;
}) {
  const content = (
    <div className="group relative h-full overflow-hidden rounded-xl border border-white/[0.06] bg-premium p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-performance/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-performance/0 to-performance/0 transition-all duration-300 group-hover:from-performance/[0.04] group-hover:to-transparent"
      />
      <div className="relative flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-performance/10 text-performance transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-clean">{title}</div>
          <div className="truncate text-[11px] text-titanium">{desc}</div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-titanium transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-performance" />
      </div>
    </div>
  );
  if (external) {
    return <a href={to} target="_blank" rel="noreferrer">{content}</a>;
  }
  return <Link to={to as "/admin"}>{content}</Link>;
}
