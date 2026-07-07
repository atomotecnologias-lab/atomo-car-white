import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRLExact, formatDateBR } from "@/lib/format";
import { addInterval } from "@/lib/dates";
import { createEntry, createEntrySeries, MAX_SERIES } from "@/services/financeService";
import type { EntryCategory, EntryKind, SeriesFrequency, SeriesType } from "@/types/finance";
import { Button } from "@/components/ui/button";

export const CATEGORY_LABEL: Record<EntryCategory, string> = {
  vehicle_sale: "Venda de veículo",
  vehicle_cost: "Custo de veículo",
  commission: "Comissão",
  consignment_payout: "Repasse consignação",
  rent: "Aluguel",
  utilities: "Água / Luz / Internet",
  payroll: "Folha / Salários",
  marketing: "Marketing",
  taxes: "Impostos",
  supplier: "Fornecedor",
  other: "Outros",
};

/** Categorias oferecidas no lançamento manual (as demais são automáticas). */
const MANUAL_CATEGORIES: EntryCategory[] = [
  "rent",
  "utilities",
  "payroll",
  "marketing",
  "taxes",
  "supplier",
  "other",
];

const FREQUENCIES: { value: SeriesFrequency; label: string; noun: string }[] = [
  { value: "weekly", label: "Semanal", noun: "semana" },
  { value: "monthly", label: "Mensal", noun: "mês" },
  { value: "yearly", label: "Anual", noun: "ano" },
];

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20";

function parseMoney(raw: string): number {
  const clean = raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  return Number(clean) || 0;
}

/** Nº de ocorrências da 1ª data até a data-limite (inclusive), com teto. */
function countUntil(firstDue: string, freq: SeriesFrequency, until: string): number {
  if (until < firstDue) return 1;
  let n = 1;
  while (n < MAX_SERIES && addInterval(firstDue, freq, n) <= until) n++;
  return n;
}

export function EntryForm({
  kind,
  onDone,
}: {
  kind: EntryKind;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EntryCategory>(kind === "payable" ? "supplier" : "other");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  // Série (recorrência/parcelamento)
  const [seriesOn, setSeriesOn] = useState(false);
  // Pagar só tem recorrência; receber pode ser parcelamento ou recorrência.
  const [mode, setMode] = useState<SeriesType>(kind === "payable" ? "recurring" : "installment");
  const [frequency, setFrequency] = useState<SeriesFrequency>("monthly");
  const [endMode, setEndMode] = useState<"count" | "date">("count");
  const [count, setCount] = useState(kind === "payable" ? 12 : 6);
  const [untilDate, setUntilDate] = useState("");

  const seriesType: SeriesType = kind === "payable" ? "recurring" : mode;
  const amountNum = parseMoney(amount);

  // Nº efetivo de ocorrências (por quantidade ou por data-limite)
  const effectiveCount = useMemo(() => {
    if (endMode === "date" && untilDate) return countUntil(dueDate, frequency, untilDate);
    return Math.max(2, Math.min(MAX_SERIES, Math.floor(count) || 0));
  }, [endMode, untilDate, dueDate, frequency, count]);

  const freqInfo = FREQUENCIES.find((f) => f.value === frequency)!;

  // Prévia ao vivo
  const preview = useMemo(() => {
    if (!seriesOn || amountNum <= 0 || effectiveCount < 2) return null;
    const firstDate = formatDateBR(dueDate);
    const lastDate = formatDateBR(addInterval(dueDate, frequency, effectiveCount - 1));
    if (seriesType === "installment") {
      const per = amountNum / effectiveCount;
      return `${effectiveCount}x de ${formatBRLExact(per)} = ${formatBRLExact(amountNum)} · 1ª ${firstDate} · última ${lastDate}`;
    }
    return `Gera ${effectiveCount} lançamentos de ${formatBRLExact(amountNum)} · 1º ${firstDate} · última ${lastDate} · total ${formatBRLExact(amountNum * effectiveCount)}`;
  }, [seriesOn, amountNum, effectiveCount, seriesType, dueDate, frequency]);

  const mutation = useMutation({
    mutationFn: () => {
      if (seriesOn) {
        return createEntrySeries({
          kind,
          category,
          description: description.trim(),
          seriesType,
          frequency,
          count: effectiveCount,
          firstDueDate: dueDate,
          totalAmount: seriesType === "installment" ? amountNum : undefined,
          amountPerEntry: seriesType === "recurring" ? amountNum : undefined,
        });
      }
      return createEntry({
        kind,
        category,
        description: description.trim(),
        amount: amountNum,
        dueDate,
        paidAt: alreadyPaid ? dueDate : undefined,
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      const n = Array.isArray(result) ? result.length : 1;
      toast.success(n > 1 ? `${n} lançamentos criados.` : "Lançamento criado.");
      onDone();
    },
    onError: () => toast.error("Erro ao criar lançamento."),
  });

  const amountLabel = seriesOn && seriesType === "installment" ? "Valor total (R$) *" : "Valor (R$) *";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Informe a descrição.");
      return;
    }
    if (amountNum <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    if (seriesOn && effectiveCount < 2) {
      toast.error("A série precisa de pelo menos 2 lançamentos.");
      return;
    }
    mutation.mutate();
  }

  const toggleLabel =
    kind === "payable" ? "Repetir este pagamento?" : "Parcelar ou repetir este recebimento?";

  return (
    <form
      className="grid grid-cols-1 gap-4 border-b border-border p-5 sm:grid-cols-2"
      onSubmit={handleSubmit}
    >
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs text-muted-foreground">Descrição *</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={kind === "payable" ? "Ex.: Aluguel do pátio" : "Ex.: Financiamento — João"}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-muted-foreground">Categoria</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as EntryCategory)}
          className={inputCls}
        >
          {MANUAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">{amountLabel}</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1500"
            className={cn(inputCls, "tabular")}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">
            {seriesOn ? "1º vencimento" : "Vencimento"}
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Toggle da série */}
      <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
        <input
          type="checkbox"
          checked={seriesOn}
          onChange={(e) => setSeriesOn(e.target.checked)}
          className="h-4 w-4 rounded border-input accent-[var(--primary)]"
        />
        <Repeat className="h-3.5 w-3.5 text-primary" />
        {toggleLabel}
      </label>

      {/* Opções da série (progressive disclosure) */}
      {seriesOn && (
        <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4 sm:col-span-2">
          {/* Receber: escolher parcelar x repetir */}
          {kind === "receivable" && (
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Como funciona?</label>
              <div className="grid grid-cols-2 gap-2">
                <Choice active={mode === "installment"} onClick={() => setMode("installment")}>
                  Parcelar um valor
                </Choice>
                <Choice active={mode === "recurring"} onClick={() => setMode("recurring")}>
                  Repetir todo período
                </Choice>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              {seriesType === "installment" ? "Intervalo entre parcelas" : "Com que frequência?"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCIES.map((f) => (
                <Choice
                  key={f.value}
                  active={frequency === f.value}
                  onClick={() => setFrequency(f.value)}
                >
                  {f.label}
                </Choice>
              ))}
            </div>
          </div>

          {/* Fim da repetição: nº de vezes ou até uma data */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
            <div className="flex gap-2">
              <Choice active={endMode === "count"} onClick={() => setEndMode("count")}>
                {seriesType === "installment" ? "Nº de parcelas" : "Nº de vezes"}
              </Choice>
              <Choice active={endMode === "date"} onClick={() => setEndMode("date")}>
                Até uma data
              </Choice>
            </div>
            {endMode === "count" ? (
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  {seriesType === "installment" ? "Em quantas parcelas?" : "Quantas vezes repetir?"}
                </label>
                <input
                  type="number"
                  min={2}
                  max={MAX_SERIES}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className={cn(inputCls, "tabular")}
                />
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Repetir até</label>
                <input
                  type="date"
                  value={untilDate}
                  min={dueDate}
                  onChange={(e) => setUntilDate(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}
          </div>

          {/* Prévia */}
          {preview ? (
            <p className="rounded-lg bg-background px-3 py-2 text-[13px] text-foreground">
              <span className="font-medium text-primary">Prévia:</span> {preview}
            </p>
          ) : (
            <p className="text-[12px] text-muted-foreground">
              Preencha o valor{" "}
              {seriesType === "installment" ? "total e as parcelas" : `e a quantidade de ${freqInfo.noun}es`}{" "}
              para ver a prévia.
            </p>
          )}
        </div>
      )}

      {/* "Já foi paga" só para conta única */}
      {!seriesOn && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
          <input
            type="checkbox"
            checked={alreadyPaid}
            onChange={(e) => setAlreadyPaid(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-[var(--primary)]"
          />
          {kind === "payable" ? "Já foi paga" : "Já foi recebida"}
        </label>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : seriesOn ? (
            `Gerar ${effectiveCount >= 2 ? effectiveCount : ""} lançamentos`
          ) : (
            "Salvar lançamento"
          )}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-input bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
