import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Layers, Loader2, Pencil, Plus, Repeat, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRLExact, formatDateBR } from "@/lib/format";
import {
  deleteEntry,
  deleteSeries,
  listEntries,
  markEntryPaid,
  markEntryUnpaid,
} from "@/services/financeService";
import type { EntryKind, EntryStatus, FinancialEntry, SeriesFrequency } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { PeriodSelect } from "@/components/admin/PeriodSelect";
import { LIST_PERIODS, inPeriod, type ListPeriod } from "@/lib/period";
import { EntryForm, CATEGORY_LABEL } from "./EntryForm";

const FREQ_BADGE: Record<SeriesFrequency, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

type FilterKey = "open" | "overdue" | "paid" | "all";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "open", label: "Em aberto" },
  { key: "overdue", label: "Vencidas" },
  { key: "paid", label: "Pagas" },
  { key: "all", label: "Todas" },
];

const STATUS_STYLE: Record<EntryStatus, string> = {
  open: "bg-info/10 text-info",
  overdue: "bg-destructive/10 text-destructive",
  paid: "bg-success/10 text-success",
};

const STATUS_LABEL: Record<EntryStatus, string> = {
  open: "Em aberto",
  overdue: "Vencida",
  paid: "Paga",
};

export function FinanceEntriesScreen({ kind }: { kind: EntryKind }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>("open");
  const [period, setPeriod] = useState<ListPeriod>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FinancialEntry | null>(null);
  const [delTarget, setDelTarget] = useState<FinancialEntry | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries", kind],
    queryFn: () => listEntries({ kind }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    queryClient.invalidateQueries({ queryKey: ["finance"] });
  };

  const payMutation = useMutation({
    mutationFn: (id: string) => markEntryPaid(id),
    onSuccess: () => {
      invalidate();
      toast.success(kind === "payable" ? "Conta marcada como paga." : "Recebimento confirmado.");
    },
    onError: () => toast.error("Erro ao atualizar."),
  });

  const unpayMutation = useMutation({
    mutationFn: (id: string) => markEntryUnpaid(id),
    onSuccess: () => {
      invalidate();
      toast.success("Lançamento reaberto.");
    },
    onError: () => toast.error("Erro ao atualizar."),
  });

  const delMutation = useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: () => {
      invalidate();
      toast.success("Lançamento excluído.");
      setDelTarget(null);
    },
    onError: () => toast.error("Erro ao excluir."),
  });

  const delSeriesMutation = useMutation({
    mutationFn: (groupId: string) => deleteSeries(groupId, { openOnly: true }),
    onSuccess: () => {
      invalidate();
      toast.success("Lançamentos em aberto da série excluídos.");
      setDelTarget(null);
    },
    onError: () => toast.error("Erro ao excluir a série."),
  });

  const filtered = useMemo(() => {
    const byStatus = (() => {
      switch (filter) {
        case "open":
          return entries.filter((e) => e.status !== "paid");
        case "overdue":
          return entries.filter((e) => e.status === "overdue");
        case "paid":
          return entries.filter((e) => e.status === "paid");
        default:
          return entries;
      }
    })();
    return byStatus.filter((e) => inPeriod(e.dueDate, period));
  }, [entries, filter, period]);

  const openTotal = entries.filter((e) => e.status !== "paid").reduce((s, e) => s + e.amount, 0);
  const overdueTotal = entries
    .filter((e) => e.status === "overdue")
    .reduce((s, e) => s + e.amount, 0);
  const paidThisMonth = entries
    .filter((e) => e.paidAt?.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
      {/* Totais */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Total
          label={kind === "payable" ? "Total a pagar" : "Total a receber"}
          value={formatBRLExact(openTotal)}
        />
        <Total
          label={kind === "payable" ? "Vencidas" : "Atrasadas"}
          value={formatBRLExact(overdueTotal)}
          tone={overdueTotal > 0 ? "negative" : undefined}
        />
        <Total
          label={kind === "payable" ? "Pago no mês" : "Recebido no mês"}
          value={formatBRLExact(paidThisMonth)}
          tone="positive"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <header className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <div className="flex gap-1.5 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  filter === f.key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {kind === "receivable" && f.key === "overdue" ? "Atrasadas" : f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <PeriodSelect
              value={period}
              onChange={setPeriod}
              options={LIST_PERIODS}
              ariaLabel="Filtrar lançamentos por período de vencimento"
            />
            {!formOpen && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditTarget(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Lançar
              </Button>
            )}
          </div>
        </header>

        {formOpen && <EntryForm kind={kind} onDone={() => setFormOpen(false)} />}
        {editTarget && (
          <EntryForm
            kind={kind}
            entry={editTarget}
            onDone={() => setEditTarget(null)}
          />
        )}

        {isLoading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Nenhum lançamento neste filtro.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((e) => (
              <EntryRow
                key={e.id}
                entry={e}
                kind={kind}
                onEdit={() => {
                  setFormOpen(false);
                  setEditTarget(e);
                }}
                onPay={() => payMutation.mutate(e.id)}
                onUnpay={() => unpayMutation.mutate(e.id)}
                onDelete={() => {
                  if (e.groupId) setDelTarget(e);
                  else if (confirm("Excluir este lançamento?")) delMutation.mutate(e.id);
                }}
              />
            ))}
          </ul>
        )}
      </section>

      {delTarget && (
        <DeleteSeriesModal
          entry={delTarget}
          kind={kind}
          busy={delMutation.isPending || delSeriesMutation.isPending}
          onClose={() => setDelTarget(null)}
          onDeleteOne={() => delMutation.mutate(delTarget.id)}
          onDeleteSeries={() => delSeriesMutation.mutate(delTarget.groupId!)}
        />
      )}
    </div>
  );
}

function DeleteSeriesModal({
  entry,
  kind,
  busy,
  onClose,
  onDeleteOne,
  onDeleteSeries,
}: {
  entry: FinancialEntry;
  kind: EntryKind;
  busy: boolean;
  onClose: () => void;
  onDeleteOne: () => void;
  onDeleteSeries: () => void;
}) {
  const seriesLabel =
    entry.seriesType === "installment"
      ? `parcela ${entry.seriesIndex}/${entry.seriesTotal}`
      : "lançamento recorrente";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-sm font-semibold text-foreground">Excluir da série</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Este é um {seriesLabel} de “{entry.description}”. O que você quer excluir?
        </p>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={onDeleteOne}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-primary/40 disabled:opacity-50"
          >
            <span className="font-medium text-foreground">Excluir só esta</span>
            <span className="block text-[11px] text-muted-foreground">
              Remove apenas este lançamento.
            </span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDeleteSeries}
            className="w-full rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-left text-sm transition-colors hover:border-destructive/60 disabled:opacity-50"
          >
            <span className="font-medium text-destructive">Excluir toda a série em aberto</span>
            <span className="block text-[11px] text-muted-foreground">
              Remove os lançamentos ainda não {kind === "payable" ? "pagos" : "recebidos"}. Mantém os
              já {kind === "payable" ? "pagos" : "recebidos"}.
            </span>
          </button>
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="ghost" onClick={onClose} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancelar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Tag complementar ao status: "Parcela X/N" ou frequência do recorrente. */
function SeriesBadge({ entry }: { entry: FinancialEntry }) {
  if (!entry.seriesType) return null;
  if (entry.seriesType === "installment") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        <Layers className="h-2.5 w-2.5" />
        Parcela {entry.seriesIndex}/{entry.seriesTotal}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      <Repeat className="h-2.5 w-2.5" />
      {entry.seriesFrequency ? FREQ_BADGE[entry.seriesFrequency] : "Recorrente"}
    </span>
  );
}

function Total({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tone === "negative" ? "border-destructive/30 bg-destructive/5" : "border-border bg-card",
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-display text-2xl font-semibold tabular",
          tone === "negative" ? "text-destructive" : tone === "positive" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function EntryRow({
  entry: e,
  kind,
  onEdit,
  onPay,
  onUnpay,
  onDelete,
}: {
  entry: FinancialEntry;
  kind: EntryKind;
  onEdit: () => void;
  onPay: () => void;
  onUnpay: () => void;
  onDelete: () => void;
}) {
  const isAutomatic = Boolean(e.saleId);
  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{e.description}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              STATUS_STYLE[e.status],
            )}
          >
            {STATUS_LABEL[e.status]}
          </span>
          <SeriesBadge entry={e} />
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {CATEGORY_LABEL[e.category]} · vence {formatDateBR(e.dueDate)}
          {e.paidAt ? ` · ${kind === "payable" ? "paga" : "recebida"} em ${formatDateBR(e.paidAt)}` : ""}
          {isAutomatic ? " · gerado pela venda" : ""}
        </div>
      </div>
      <span className="font-display text-sm font-semibold tabular text-foreground">
        {formatBRLExact(e.amount)}
      </span>
      {e.status === "paid" ? (
        <button
          type="button"
          title="Reabrir"
          onClick={onUnpay}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onPay}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {kind === "payable" ? "Pagar" : "Receber"}
        </button>
      )}
      {!isAutomatic && (
        <button
          type="button"
          title="Editar"
          onClick={onEdit}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      {!isAutomatic && (
        <button
          type="button"
          title="Excluir"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </li>
  );
}
