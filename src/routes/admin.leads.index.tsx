import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listLeads } from "@/services/leadsService";
import { listVehicles } from "@/services/vehiclesService";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { LEAD_STAGES } from "@/components/admin/LeadStatusBadge";
import type { Lead, LeadStatus } from "@/types/lead";
import { MessageSquare, Phone, ArrowUpRight, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin/leads/")({
  component: PipelinePage,
});

function PipelinePage() {
  const { data: leadsData = [] } = useQuery({ queryKey: ["admin", "leads"], queryFn: listLeads });
  const { data: vehicles = [] } = useQuery({ queryKey: ["admin", "vehicles"], queryFn: listVehicles });
  const vMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);

  // Local state so cards can be moved between columns (mock-only)
  const [leads, setLeads] = useState<Lead[]>(leadsData);
  // Sync when first loaded
  useMemo(() => {
    if (leadsData.length && leads.length === 0) setLeads(leadsData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadsData]);

  const grouped = useMemo(() => {
    const g: Record<LeadStatus, Lead[]> = {
      new: [], contacted: [], negotiating: [], proposal: [], financing: [], sold: [], lost: [],
    };
    for (const l of leads) g[l.status].push(l);
    return g;
  }, [leads]);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };
  const onDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  return (
    <>
      <AdminTopbar
        title="Pipeline"
        subtitle={`${leads.length} leads em movimento — arraste cards entre colunas`}
        actions={
          <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-performance px-4 text-xs font-medium text-carbon hover:bg-racing">
            <UserPlus className="h-4 w-4" />
            Novo lead
          </button>
        }
      />
      <div className="overflow-x-auto p-4 sm:p-6 lg:p-8">
        <div className="flex min-w-max snap-x snap-mandatory gap-3 sm:snap-none">
          {LEAD_STAGES.map((stage) => {
            const items = grouped[stage.key];
            return (
              <div
                key={stage.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, stage.key)}
                className="flex w-[82vw] max-w-[300px] shrink-0 snap-start flex-col rounded-2xl border border-white/[0.06] bg-premium sm:w-72 sm:max-w-none"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dot(stage.key)}`} />
                    <h3 className="font-display text-sm font-semibold text-clean">{stage.label}</h3>
                  </div>
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] tabular text-titanium">
                    {items.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-2 min-h-[200px]">
                  {items.length === 0 && (
                    <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-white/[0.06] p-6 text-[11px] text-titanium">
                      Vazio
                    </div>
                  )}
                  {items.map((l) => {
                    const v = l.vehicleId ? vMap.get(l.vehicleId) : undefined;
                    return (
                      <article
                        key={l.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, l.id)}
                        className="cursor-grab rounded-xl border border-white/[0.04] bg-carbon/40 p-3 transition-all hover:border-performance/30 active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-clean">{l.name}</div>
                            <div className="truncate text-[10px] uppercase tracking-[0.14em] text-titanium">
                              {l.source.replace("_", " ")}
                            </div>
                          </div>
                          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-performance/10 text-[10px] font-medium text-performance">
                            {l.name.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                          </div>
                        </div>
                        {v && (
                          <div className="mt-2 flex items-center gap-2 rounded-lg bg-white/[0.02] p-1.5">
                            <div className="h-7 w-10 shrink-0 overflow-hidden rounded bg-white/[0.04]">
                              <img src={v.mainImage} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 text-[11px] text-clean truncate">
                              {v.brand} {v.model}
                            </div>
                          </div>
                        )}
                        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-titanium">
                          {l.message}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5 border-t border-white/[0.04] pt-2">
                          <a
                            href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="WhatsApp"
                            className="grid h-9 w-9 place-items-center rounded border border-white/[0.06] text-performance hover:bg-performance/10 sm:h-7 sm:w-7"
                          >
                            <MessageSquare className="h-4 w-4 sm:h-3 sm:w-3" />
                          </a>
                          <a
                            href={`tel:${l.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Ligar"
                            className="grid h-9 w-9 place-items-center rounded border border-white/[0.06] text-clean/80 hover:text-clean sm:h-7 sm:w-7"
                          >
                            <Phone className="h-4 w-4 sm:h-3 sm:w-3" />
                          </a>
                          <Link
                            to="/admin/leads/atendimentos"
                            className="ml-auto inline-flex items-center gap-0.5 text-[10px] uppercase tracking-[0.14em] text-titanium hover:text-clean"
                          >
                            Abrir <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function dot(s: LeadStatus) {
  return {
    new: "bg-performance",
    contacted: "bg-info",
    negotiating: "bg-warning",
    proposal: "bg-yellow-300",
    financing: "bg-purple-300",
    sold: "bg-clean/60",
    lost: "bg-destructive",
  }[s];
}
