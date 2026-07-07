import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRLExact, formatDateBR } from "@/lib/format";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { listEntries, markEntryPaid } from "@/services/financeService";
import { listTeamMembers } from "@/services/teamService";
import type { FinancialEntry } from "@/types/finance";

export const Route = createFileRoute("/admin/vendas/comissoes")({
  component: CommissionsPage,
});

function CommissionsPage() {
  const queryClient = useQueryClient();
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries", "commission"],
    queryFn: () => listEntries({ kind: "payable", category: "commission" }),
  });
  const { data: members = [] } = useQuery({ queryKey: ["team"], queryFn: listTeamMembers });
  const memberById = new Map(members.map((m) => [m.id, m]));

  const payMutation = useMutation({
    mutationFn: (id: string) => markEntryPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success("Comissão marcada como paga.");
    },
    onError: () => toast.error("Erro ao marcar como paga."),
  });

  const open = entries.filter((e) => e.status !== "paid");
  const paid = entries.filter((e) => e.status === "paid");
  const openTotal = open.reduce((sum, e) => sum + e.amount, 0);

  // Total em aberto por vendedor
  const openBySeller = new Map<string, number>();
  for (const e of open) {
    if (!e.teamMemberId) continue;
    openBySeller.set(e.teamMemberId, (openBySeller.get(e.teamMemberId) ?? 0) + e.amount);
  }

  return (
    <>
      <AdminTopbar title="Comissões" subtitle="A pagar e pagas, por vendedor" />
      <div className="flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
        {/* Resumo por vendedor */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Total a pagar
            </div>
            <div className="mt-1 font-display text-2xl font-semibold tabular text-foreground">
              {formatBRLExact(openTotal)}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {open.length} comissão{open.length === 1 ? "" : "s"} em aberto
            </div>
          </div>
          {[...openBySeller.entries()].slice(0, 2).map(([memberId, total]) => (
            <div key={memberId} className="rounded-2xl border border-border bg-card p-4">
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {memberById.get(memberId)?.name ?? "Vendedor"}
              </div>
              <div className="mt-1 font-display text-2xl font-semibold tabular text-foreground">
                {formatBRLExact(total)}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">a receber</div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid place-items-center rounded-2xl border border-border bg-card py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-border bg-card py-20 text-center">
            <Percent className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhuma comissão gerada ainda — elas nascem automaticamente ao registrar vendas.
            </p>
          </div>
        ) : (
          <>
            <CommissionList
              title={`Em aberto (${open.length})`}
              entries={open}
              memberName={(id) => memberById.get(id ?? "")?.name}
              action={(e) => (
                <button
                  type="button"
                  disabled={payMutation.isPending}
                  onClick={() => payMutation.mutate(e.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Marcar paga
                </button>
              )}
            />
            <CommissionList
              title={`Pagas (${paid.length})`}
              entries={paid}
              memberName={(id) => memberById.get(id ?? "")?.name}
              action={(e) => (
                <span className="text-[11px] text-muted-foreground">
                  paga em {e.paidAt ? formatDateBR(e.paidAt) : "—"}
                </span>
              )}
            />
          </>
        )}
      </div>
    </>
  );
}

function CommissionList({
  title,
  entries,
  memberName,
  action,
}: {
  title: string;
  entries: FinancialEntry[];
  memberName: (id?: string) => string | undefined;
  action: (e: FinancialEntry) => React.ReactNode;
}) {
  if (entries.length === 0) return null;
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="border-b border-border px-5 py-3.5">
        <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      </header>
      <ul className="divide-y divide-border">
        {entries.map((e) => (
          <li key={e.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
                "bg-primary/10 text-primary",
              )}
            >
              {(memberName(e.teamMemberId) ?? "?")[0]?.toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">{e.description}</div>
              <div className="text-[11px] text-muted-foreground">
                {memberName(e.teamMemberId) ?? "Vendedor"} · vencimento {formatDateBR(e.dueDate)}
                {e.status === "overdue" && (
                  <span className="ml-1.5 font-medium text-destructive">VENCIDA</span>
                )}
              </div>
            </div>
            <span className="font-display text-sm font-semibold tabular text-foreground">
              {formatBRLExact(e.amount)}
            </span>
            {action(e)}
          </li>
        ))}
      </ul>
    </section>
  );
}
