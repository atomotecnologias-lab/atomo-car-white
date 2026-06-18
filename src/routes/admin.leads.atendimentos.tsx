import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listLeads } from "@/services/leadsService";
import { listVehicles } from "@/services/vehiclesService";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { LeadStatusBadge } from "@/components/admin/LeadStatusBadge";
import { Phone, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/leads/atendimentos")({
  component: AtendimentosPage,
});

function AtendimentosPage() {
  const { data: leads = [] } = useQuery({ queryKey: ["admin", "leads"], queryFn: listLeads });
  const { data: vehicles = [] } = useQuery({ queryKey: ["admin", "vehicles"], queryFn: listVehicles });
  const vMap = new Map(vehicles.map((v) => [v.id, v]));

  const active = leads.filter((l) => l.status !== "sold" && l.status !== "lost");

  return (
    <>
      <AdminTopbar title="Atendimentos" subtitle={`${active.length} conversas abertas`} />
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Mobile: cards empilhados */}
        <div className="space-y-3 md:hidden">
          {active.map((l) => {
            const v = l.vehicleId ? vMap.get(l.vehicleId) : undefined;
            const phone = l.phone.replace(/\D/g, "");
            return (
              <div
                key={l.id}
                className="rounded-2xl border border-white/[0.06] bg-premium p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-clean">{l.name}</div>
                    <div className="text-[11px] text-titanium tabular">{l.phone}</div>
                  </div>
                  <LeadStatusBadge status={l.status} />
                </div>

                <p className="mt-2 text-xs text-titanium line-clamp-2">{l.message}</p>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/[0.04] pt-3 text-xs">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-titanium">Veículo</div>
                    <div className="text-clean">
                      {v ? `${v.brand} ${v.model}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-titanium">Origem</div>
                    <div className="uppercase tracking-[0.14em] text-titanium">
                      {l.source.replace("_", " ")}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-titanium">Último contato</div>
                    <div className="text-titanium tabular">
                      {l.lastContactAt ? new Date(l.lastContactAt).toLocaleString("pt-BR") : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <a
                    href={`https://wa.me/${phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-performance/30 bg-performance/10 text-sm font-medium text-performance"
                  >
                    <MessageSquare className="h-4 w-4" /> WhatsApp
                  </a>
                  <a
                    href={`tel:${l.phone}`}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.08] text-sm text-clean/90"
                  >
                    <Phone className="h-4 w-4" /> Ligar
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: tabela */}
        <div className="hidden overflow-hidden rounded-2xl border border-white/[0.06] bg-premium md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-[10px] uppercase tracking-[0.18em] text-titanium">
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-3 py-3 font-medium">Veículo</th>
                <th className="px-3 py-3 font-medium">Origem</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Último contato</th>
                <th className="px-3 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {active.map((l) => {
                const v = l.vehicleId ? vMap.get(l.vehicleId) : undefined;
                return (
                  <tr key={l.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium text-clean">{l.name}</div>
                      <div className="text-[11px] text-titanium tabular">{l.phone}</div>
                      <p className="mt-2 max-w-md text-xs text-titanium line-clamp-2">{l.message}</p>
                    </td>
                    <td className="px-3 py-4 align-top">
                      {v ? (
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.16em] text-titanium">{v.brand}</div>
                          <div className="text-clean">{v.model}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-titanium">—</span>
                      )}
                    </td>
                    <td className="px-3 py-4 align-top text-xs uppercase tracking-[0.14em] text-titanium">
                      {l.source.replace("_", " ")}
                    </td>
                    <td className="px-3 py-4 align-top">
                      <LeadStatusBadge status={l.status} />
                    </td>
                    <td className="px-3 py-4 align-top text-xs text-titanium tabular">
                      {l.lastContactAt
                        ? new Date(l.lastContactAt).toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="flex gap-1.5">
                        <a
                          href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="grid h-8 w-8 place-items-center rounded-md border border-white/[0.06] text-performance hover:bg-performance/10"
                          aria-label="WhatsApp"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={`tel:${l.phone}`}
                          className="grid h-8 w-8 place-items-center rounded-md border border-white/[0.06] text-clean/80 hover:text-clean"
                          aria-label="Ligar"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
