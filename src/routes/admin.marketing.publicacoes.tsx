import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Calendar, Clock, CheckCircle2, AlertCircle, Instagram, Facebook, Globe } from "lucide-react";

export const Route = createFileRoute("/admin/marketing/publicacoes")({
  component: PublicacoesPage,
});

type Publication = {
  id: string;
  channel: "Instagram" | "Marketplace" | "Google" | "OLX";
  icon: typeof Instagram;
  vehicle: string;
  scheduledFor: string;
  status: "scheduled" | "published" | "failed";
};

const mockPublications: Publication[] = [
  { id: "p1", channel: "Instagram", icon: Instagram, vehicle: "Jeep Renegade Longitude", scheduledFor: "2026-06-11T09:00:00Z", status: "scheduled" },
  { id: "p2", channel: "Marketplace", icon: Facebook, vehicle: "VW T-Cross Highline", scheduledFor: "2026-06-10T14:00:00Z", status: "published" },
  { id: "p3", channel: "Google", icon: Globe, vehicle: "Toyota Corolla XEI", scheduledFor: "2026-06-09T11:30:00Z", status: "published" },
  { id: "p4", channel: "Instagram", icon: Instagram, vehicle: "Jeep Renegade Longitude", scheduledFor: "2026-06-09T08:00:00Z", status: "failed" },
];

function PublicacoesPage() {
  return (
    <>
      <AdminTopbar
        title="Publicações"
        subtitle="Agendamento e histórico de posts em todos os canais (mock)."
      />
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-white/[0.06] bg-premium">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <h2 className="font-display text-base font-semibold text-clean">Agenda</h2>
            <p className="text-xs text-titanium">Próximas postagens e histórico recente.</p>
          </div>
          <ul className="divide-y divide-white/[0.04]">
            {mockPublications.map((p) => {
              const Icon = p.icon;
              const meta =
                p.status === "scheduled"
                  ? { tone: "text-info bg-info/10 border-info/30", label: "Agendado", I: Clock }
                  : p.status === "published"
                    ? { tone: "text-performance bg-performance/10 border-performance/30", label: "Publicado", I: CheckCircle2 }
                    : { tone: "text-destructive bg-destructive/10 border-destructive/30", label: "Falhou", I: AlertCircle };
              return (
                <li key={p.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-clean">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-clean">{p.vehicle}</div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-titanium">{p.channel}</div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-titanium tabular md:hidden">
                      <Calendar className="h-3 w-3" />
                      {new Date(p.scheduledFor).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="hidden items-center gap-1.5 text-xs text-titanium tabular md:flex">
                    <Calendar className="h-3 w-3" />
                    {new Date(p.scheduledFor).toLocaleString("pt-BR")}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${meta.tone}`}
                  >
                    <meta.I className="h-3 w-3" />
                    {meta.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-premium/40 p-8 text-center">
          <p className="text-sm text-clean">Conecte suas contas para publicar automaticamente</p>
          <p className="mt-1 text-xs text-titanium">
            Integrações com Meta, Google Negócios e OLX estarão disponíveis em breve.
          </p>
        </div>
      </div>
    </>
  );
}
