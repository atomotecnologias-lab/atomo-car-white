import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRLExact, formatDateBR } from "@/lib/format";
import type { CostType } from "@/types/finance";
import {
  createCost,
  deleteCost,
  getVehicleFinancials,
  upsertAcquisition,
} from "@/services/costsService";
import { Button } from "@/components/ui/button";

export const COST_TYPE_LABEL: Record<CostType, string> = {
  washing: "Lavagem / Estética",
  bodywork: "Funilaria",
  painting: "Pintura",
  mechanical: "Mecânica",
  documentation: "Documentação",
  accessories: "Acessórios",
  other: "Outros",
};

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20";

function parseMoney(raw: string): number {
  const clean = raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  return Number(clean) || 0;
}

export function CostsMarginTab({
  vehicleId,
  announcedPrice,
  isSold,
}: {
  vehicleId: string;
  announcedPrice: number;
  isSold: boolean;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["vehicle-financials", vehicleId];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => getVehicleFinancials(vehicleId, announcedPrice),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  if (isLoading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Não foi possível carregar os dados financeiros. Verifique se as migrations 005–007 foram
        executadas no Supabase.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Resumo */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Valor de aquisição"
          value={data.acquisitionPrice !== null ? formatBRLExact(data.acquisitionPrice) : "—"}
          hint={data.acquisitionPrice === null ? "não registrado" : undefined}
        />
        <SummaryCard
          label="Custos lançados"
          value={formatBRLExact(data.costsTotal)}
          hint={`${data.costs.length} lançamento${data.costs.length === 1 ? "" : "s"}`}
        />
        <SummaryCard
          label={isSold ? "Investido total" : "Margem projetada"}
          value={
            isSold
              ? formatBRLExact(data.totalInvested)
              : data.projectedMargin !== null
                ? formatBRLExact(data.projectedMargin)
                : "—"
          }
          tone={
            !isSold && data.projectedMargin !== null
              ? data.projectedMargin >= 0
                ? "positive"
                : "negative"
              : undefined
          }
          hint={!isSold ? `preço anunciado − investido` : undefined}
        />
      </div>

      <AcquisitionPanel
        vehicleId={vehicleId}
        current={data.acquisitionPrice}
        onSaved={invalidate}
      />

      <CostsPanel vehicleId={vehicleId} costs={data.costs} isSold={isSold} onChanged={invalidate} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-display text-xl font-semibold tabular",
          tone === "positive" && "text-success",
          tone === "negative" && "text-destructive",
          !tone && "text-foreground",
        )}
      >
        {tone === "negative" && value !== "—" ? `− ${value.replace("-", "")}` : value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function AcquisitionPanel({
  vehicleId,
  current,
  onSaved,
}: {
  vehicleId: string;
  current: number | null;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(current === null);
  const [value, setValue] = useState(current !== null ? String(current) : "");

  const mutation = useMutation({
    mutationFn: () =>
      upsertAcquisition({ vehicleId, acquisitionPrice: parseMoney(value) }),
    onSuccess: () => {
      toast.success("Valor de aquisição salvo.");
      setEditing(false);
      onSaved();
    },
    onError: () => toast.error("Erro ao salvar aquisição."),
  });

  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h3 className="inline-flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <Wallet className="h-4 w-4 text-primary" />
          Aquisição
        </h3>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-primary hover:underline"
          >
            Editar
          </button>
        )}
      </header>
      <div className="p-5">
        {current === null && !editing && (
          <p className="text-sm text-muted-foreground">
            Sem valor de aquisição — o lucro real não pode ser calculado.
          </p>
        )}
        {editing ? (
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (parseMoney(value) <= 0) {
                toast.error("Informe um valor válido.");
                return;
              }
              mutation.mutate();
            }}
          >
            <div className="min-w-[200px] flex-1">
              <label className="mb-1.5 block text-xs text-muted-foreground">
                Quanto a loja pagou no veículo (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="75000"
                className={cn(inputCls, "tabular")}
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
            {current !== null && (
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            )}
          </form>
        ) : (
          current !== null && (
            <div className="font-display text-lg font-semibold tabular text-foreground">
              {formatBRLExact(current)}
            </div>
          )
        )}
      </div>
    </section>
  );
}

function CostsPanel({
  vehicleId,
  costs,
  isSold,
  onChanged,
}: {
  vehicleId: string;
  costs: import("@/types/finance").VehicleCost[];
  isSold: boolean;
  onChanged: () => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [costType, setCostType] = useState<CostType>("mechanical");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [supplier, setSupplier] = useState("");
  const [incurredAt, setIncurredAt] = useState(new Date().toISOString().slice(0, 10));

  const addMutation = useMutation({
    mutationFn: () =>
      createCost({
        vehicleId,
        costType,
        amount: parseMoney(amount),
        description: description.trim() || COST_TYPE_LABEL[costType],
        supplier: supplier.trim() || undefined,
        incurredAt,
      }),
    onSuccess: () => {
      toast.success("Custo lançado.");
      setAmount("");
      setDescription("");
      setSupplier("");
      setFormOpen(false);
      onChanged();
    },
    onError: () => toast.error("Erro ao lançar custo."),
  });

  const delMutation = useMutation({
    mutationFn: (id: string) => deleteCost(id),
    onSuccess: () => {
      toast.success("Custo removido.");
      onChanged();
    },
    onError: () => toast.error("Erro ao remover custo."),
  });

  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Custos do veículo ({costs.length})
        </h3>
        {!formOpen && (
          <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Lançar custo
          </Button>
        )}
      </header>

      {isSold && (
        <div className="border-b border-border bg-muted px-5 py-2.5 text-xs text-muted-foreground">
          Veículo vendido — novos custos aparecem como “pós-venda” e não alteram o lucro registrado
          da venda.
        </div>
      )}

      {formOpen && (
        <form
          className="grid grid-cols-1 gap-4 border-b border-border p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (parseMoney(amount) <= 0) {
              toast.error("Informe um valor válido.");
              return;
            }
            addMutation.mutate();
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Tipo</label>
            <select
              value={costType}
              onChange={(e) => setCostType(e.target.value as CostType)}
              className={inputCls}
            >
              {Object.entries(COST_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Valor (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="450"
              className={cn(inputCls, "tabular")}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Troca de óleo + filtros"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Fornecedor</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="opcional"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Data</label>
              <input
                type="date"
                value={incurredAt}
                onChange={(e) => setIncurredAt(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Salvar custo"
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {costs.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          Nenhum custo lançado ainda. Lavagem, funilaria, documentação — tudo entra no cálculo do
          lucro real.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {costs.map((cost) => (
            <li key={cost.id} className="flex items-center gap-3 px-5 py-3">
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                  "bg-muted text-muted-foreground",
                )}
              >
                {cost.amount >= 1000 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {cost.description}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {COST_TYPE_LABEL[cost.costType]} · {formatDateBR(cost.incurredAt)}
                  {cost.supplier ? ` · ${cost.supplier}` : ""}
                </div>
              </div>
              <div className="font-display text-sm font-semibold tabular text-foreground">
                {formatBRLExact(cost.amount)}
              </div>
              <button
                type="button"
                aria-label="Remover custo"
                onClick={() => {
                  if (confirm("Remover este custo?")) delMutation.mutate(cost.id);
                }}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
