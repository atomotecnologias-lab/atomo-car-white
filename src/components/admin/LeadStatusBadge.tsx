import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types/lead";

export const LEAD_STAGES: { key: LeadStatus; label: string }[] = [
  { key: "new", label: "Novo" },
  { key: "contacted", label: "Contatado" },
  { key: "negotiating", label: "Negociação" },
  { key: "proposal", label: "Proposta" },
  { key: "financing", label: "Financiamento" },
  { key: "sold", label: "Vendido" },
  { key: "lost", label: "Perdido" },
];

const label: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  negotiating: "Negociação",
  proposal: "Proposta",
  financing: "Financiamento",
  sold: "Vendido",
  lost: "Perdido",
};

const tone: Record<LeadStatus, string> = {
  new: "bg-performance/15 text-performance border-performance/30",
  contacted: "bg-info/15 text-info border-info/30",
  negotiating: "bg-warning/15 text-warning border-warning/30",
  proposal: "bg-[color:var(--accent-yellow,#facc15)]/15 text-yellow-300 border-yellow-400/30",
  financing: "bg-purple-500/15 text-purple-300 border-purple-400/30",
  sold: "bg-white/10 text-clean/70 border-white/15",
  lost: "bg-destructive/15 text-destructive border-destructive/30",
};

export function LeadStatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
        tone[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label[status]}
    </span>
  );
}
