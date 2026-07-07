import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Sparkles,
  Wrench,
} from "lucide-react";
import { listVehicles, updateVehicle, updateVehicleStatus } from "@/services/vehiclesService";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { daysInStock, agingTone } from "@/lib/aging";
import { cn } from "@/lib/utils";
import type { PreparationStatus, Vehicle } from "@/types";

export const Route = createFileRoute("/admin/veiculos/producao")({
  component: PreparationPage,
});

const COLUMNS: { key: PreparationStatus; label: string; hint: string; icon: typeof Wrench }[] = [
  { key: "none", label: "Aguardando", hint: "entrou na loja, preparação não iniciada", icon: Clock },
  { key: "in_preparation", label: "Em preparação", hint: "lavagem, mecânica, funilaria, docs", icon: Wrench },
  { key: "ready", label: "Pronto", hint: "preparado para fotos e anúncio", icon: Sparkles },
];

const NEXT: Record<PreparationStatus, { to: PreparationStatus; label: string } | null> = {
  none: { to: "in_preparation", label: "Iniciar preparação" },
  in_preparation: { to: "ready", label: "Marcar como pronto" },
  ready: null,
};
const PREV: Record<PreparationStatus, PreparationStatus | null> = {
  none: null,
  in_preparation: "none",
  ready: "in_preparation",
};

const EMPTY_MSG: Record<PreparationStatus, string> = {
  none: "Nada esperando — tudo já entrou em preparação 👍",
  in_preparation: "Nenhum carro em preparação agora.",
  ready: "Nenhum carro pronto ainda.",
};

function PreparationPage() {
  const queryClient = useQueryClient();
  const [mobilePhase, setMobilePhase] = useState<PreparationStatus>("none");

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: listVehicles,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles", "published"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles", "featured"] });
  };

  const phaseMutation = useMutation({
    mutationFn: ({ id, to }: { id: string; to: PreparationStatus }) =>
      updateVehicle(id, { preparationStatus: to }),
    onSuccess: () => {
      invalidate();
      toast.success("Fase de preparação atualizada.");
    },
    onError: () => toast.error("Erro ao atualizar a fase."),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => updateVehicleStatus(id, "active"),
    onSuccess: () => {
      invalidate();
      toast.success("Veículo publicado no site! 🚀");
    },
    onError: () => toast.error("Erro ao publicar."),
  });

  const inStock = vehicles.filter((v) => v.status !== "sold" && v.status !== "inactive");
  const avgDays =
    inStock.length > 0
      ? Math.round(inStock.reduce((s, v) => s + daysInStock(v), 0) / inStock.length)
      : 0;
  const readyOffSite = inStock.filter((v) => v.preparationStatus === "ready" && !v.isPublished);
  const countOf = (k: PreparationStatus) => inStock.filter((v) => v.preparationStatus === k).length;

  const busyId = phaseMutation.isPending ? phaseMutation.variables?.id : undefined;
  const publishingId = publishMutation.isPending ? publishMutation.variables : undefined;

  return (
    <>
      <AdminTopbar title="Preparação" subtitle="Da entrada do carro até ficar pronto para anunciar" />
      <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        {isLoading ? (
          <div className="grid place-items-center rounded-2xl border border-border bg-card py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Resumo */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border bg-card px-5 py-3.5">
              <span className="text-sm text-foreground">
                <span className="font-display font-semibold">{inStock.length}</span>{" "}
                <span className="text-muted-foreground">no pátio</span>
              </span>
              <span className="text-sm text-muted-foreground">
                prazo médio: <span className="font-display font-semibold text-foreground">{avgDays} dias</span>
              </span>
              {readyOffSite.length > 0 && (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Globe className="h-3.5 w-3.5" />
                  {readyOffSite.length} {readyOffSite.length === 1 ? "pronto" : "prontos"} ainda fora do site
                </span>
              )}
            </div>

            {/* Abas por fase (mobile) */}
            <div className="flex gap-2 lg:hidden">
              {COLUMNS.map((col) => (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => setMobilePhase(col.key)}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                    mobilePhase === col.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {col.label} ({countOf(col.key)})
                </button>
              ))}
            </div>

            {/* Colunas */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {COLUMNS.map((col) => {
                const items = inStock
                  .filter((v) => v.preparationStatus === col.key)
                  .sort((a, b) => daysInStock(b) - daysInStock(a));
                const Icon = col.icon;
                return (
                  <section
                    key={col.key}
                    className={cn(
                      "rounded-2xl border border-border bg-card",
                      col.key !== mobilePhase && "hidden lg:block",
                    )}
                  >
                    <header className="border-b border-border px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <h2 className="font-display text-sm font-semibold text-foreground">{col.label}</h2>
                        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {items.length}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{col.hint}</p>
                    </header>
                    <div className="space-y-3 p-3">
                      {items.length === 0 ? (
                        <p className="py-8 text-center text-xs text-muted-foreground">
                          {EMPTY_MSG[col.key]}
                        </p>
                      ) : (
                        items.map((v) => (
                          <PrepCard
                            key={v.id}
                            vehicle={v}
                            phase={col.key}
                            busy={busyId === v.id}
                            publishing={publishingId === v.id}
                            onAdvance={(to) => phaseMutation.mutate({ id: v.id, to })}
                            onBack={(to) => phaseMutation.mutate({ id: v.id, to })}
                            onPublish={() => publishMutation.mutate(v.id)}
                          />
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function PrepCard({
  vehicle: v,
  phase,
  busy,
  publishing,
  onAdvance,
  onBack,
  onPublish,
}: {
  vehicle: Vehicle;
  phase: PreparationStatus;
  busy: boolean;
  publishing: boolean;
  onAdvance: (to: PreparationStatus) => void;
  onBack: (to: PreparationStatus) => void;
  onPublish: () => void;
}) {
  const days = daysInStock(v);
  const tone = agingTone(days);
  const next = NEXT[phase];
  const prev = PREV[phase];
  const isReady = phase === "ready";

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <Link to="/admin/veiculos/$id" params={{ id: v.id }} className="flex items-center gap-3">
        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          {v.mainImage && <img src={v.mainImage} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {v.brand} {v.model}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {/* Publicação: no site / fora do site */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                v.isPublished ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
              )}
            >
              <Globe className="h-2.5 w-2.5" />
              {v.isPublished ? "No site" : "Fora do site"}
            </span>
            {/* Aging */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                tone === "healthy" && "bg-muted text-muted-foreground",
                tone === "attention" && "bg-warning/10 text-warning",
                tone === "warning" && "bg-warning/15 text-warning",
                tone === "critical" && "bg-destructive/10 text-destructive",
              )}
            >
              <Clock className="h-2.5 w-2.5" />
              {days}d
            </span>
            {/* Fotos */}
            {v.images.length < 5 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                <Camera className="h-2.5 w-2.5" />
                {v.images.length} fotos
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Ações */}
      <div className="mt-3 flex items-center gap-2">
        {prev && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onBack(prev)}
            aria-label="Voltar fase"
            title="Voltar fase"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {next ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAdvance(next.to)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
            {next.label}
          </button>
        ) : isReady && !v.isPublished ? (
          <button
            type="button"
            disabled={publishing}
            onClick={onPublish}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
            Publicar no site
          </button>
        ) : (
          <Link
            to="/admin/veiculos/$id"
            params={{ id: v.id }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success transition-colors hover:bg-success/15"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Pronto e no site
          </Link>
        )}
      </div>
    </div>
  );
}
