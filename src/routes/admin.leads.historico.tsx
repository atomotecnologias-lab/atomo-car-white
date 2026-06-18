import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listLeads } from "@/services/leadsService";
import { listVehicles } from "@/services/vehiclesService";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { LeadStatusBadge } from "@/components/admin/LeadStatusBadge";
import { CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/admin/leads/historico")({
  component: HistoricoPage,
});

function HistoricoPage() {
  const { data: leads = [] } = useQuery({ queryKey: ["admin", "leads"], queryFn: listLeads });
  const { data: vehicles = [] } = useQuery({ queryKey: ["admin", "vehicles"], queryFn: listVehicles });
  const vMap = new Map(vehicles.map((v) => [v.id, v]));

  const closed = leads.filter((l) => l.status === "sold" || l.status === "lost");
  const sold = closed.filter((l) => l.status === "sold").length;
  const lost = closed.filter((l) => l.status === "lost").length;

  return (
    <>
      <AdminTopbar
        title="Histórico"
        subtitle={`${closed.length} leads encerrados · ${sold} vendidos · ${lost} perdidos`}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <ol className="relative space-y-3 border-l border-white/[0.06] pl-6">
          {closed
            .sort((a, b) => (b.lastContactAt ?? b.createdAt).localeCompare(a.lastContactAt ?? a.createdAt))
            .map((l) => {
              const v = l.vehicleId ? vMap.get(l.vehicleId) : undefined;
              const won = l.status === "sold";
              return (
                <li key={l.id} className="relative">
                  <span
                    className={`absolute -left-[33px] grid h-6 w-6 place-items-center rounded-full border ${won ? "border-performance/40 bg-performance/15 text-performance" : "border-destructive/40 bg-destructive/15 text-destructive"}`}
                  >
                    {won ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  </span>
                  <div className="rounded-2xl border border-white/[0.06] bg-premium p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-clean">{l.name}</div>
                        <div className="text-[11px] uppercase tracking-[0.14em] text-titanium">
                          {l.source.replace("_", " ")} ·{" "}
                          {new Date(l.lastContactAt ?? l.createdAt).toLocaleString("pt-BR")}
                        </div>
                      </div>
                      <LeadStatusBadge status={l.status} />
                    </div>
                    {v && (
                      <div className="mt-3 text-xs text-titanium">
                        Interesse:{" "}
                        <span className="text-clean">
                          {v.brand} {v.model}
                        </span>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-titanium">{l.message}</p>
                  </div>
                </li>
              );
            })}
        </ol>
      </div>
    </>
  );
}
