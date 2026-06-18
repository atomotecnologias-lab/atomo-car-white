import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listVehicles } from "@/services/vehiclesService";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { VehicleStatusBadge } from "@/components/admin/VehicleStatusBadge";
import { ArrowUpRight, Camera, CheckCircle2, Circle, Wrench } from "lucide-react";

export const Route = createFileRoute("/admin/veiculos/producao")({
  component: ProducaoPage,
});

const STEPS = ["Recepção", "Vistoria", "Higienização", "Fotos", "Anúncio"] as const;

function pseudoStep(id: string): number {
  const h = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return h % STEPS.length;
}

function ProducaoPage() {
  const { data: vehicles = [] } = useQuery({ queryKey: ["admin", "vehicles"], queryFn: listVehicles });
  const inProduction = vehicles.filter(
    (v) => v.status === "draft" || v.status === "awaiting_photos",
  );

  return (
    <>
      <AdminTopbar
        title="Em produção"
        subtitle={`${inProduction.length} veículos no pipeline de preparação`}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        {inProduction.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-premium p-14 text-center text-sm text-titanium">
            Nada em produção. Todo o estoque está publicado.
          </div>
        ) : (
          <div className="space-y-3">
            {inProduction.map((v) => {
              const step = pseudoStep(v.id);
              return (
                <Link
                  key={v.id}
                  to="/admin/veiculos/$id"
                  params={{ id: v.id }}
                  className="group flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-premium p-4 transition-all hover:border-performance/30 sm:flex-row sm:items-center sm:gap-5"
                >
                  <div className="flex items-center gap-4 sm:contents">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                      <img src={v.mainImage} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
                      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-titanium">
                        {v.brand}
                      </div>
                      <div className="truncate font-display text-sm font-semibold text-clean">
                        {v.model} <span className="text-titanium">{v.version}</span>
                      </div>
                      <div className="mt-1">
                        <VehicleStatusBadge status={v.status} />
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-titanium transition-colors group-hover:text-performance sm:hidden" />
                  </div>

                  <div className="flex flex-1 items-center gap-2">
                    {STEPS.map((s, i) => {
                      const done = i < step;
                      const current = i === step;
                      return (
                        <div key={s} className="flex flex-1 items-center gap-2">
                          <div className="flex flex-col items-center gap-1">
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 text-performance" />
                            ) : current ? (
                              <span className="grid h-4 w-4 place-items-center rounded-full border-2 border-warning">
                                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                              </span>
                            ) : (
                              <Circle className="h-4 w-4 text-titanium/50" />
                            )}
                            <span
                              className={`hidden text-[9px] uppercase tracking-[0.14em] sm:block ${done ? "text-performance" : current ? "text-warning" : "text-titanium"}`}
                            >
                              {s}
                            </span>
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`h-px flex-1 ${done ? "bg-performance/40" : "bg-white/[0.06]"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-titanium">
                    {v.images.length < 5 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] text-warning">
                        <Camera className="h-3 w-3" />
                        {v.images.length} fotos
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      {STEPS[step]}
                    </span>
                  </div>

                  <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-titanium transition-colors group-hover:text-performance sm:block" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
