import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Pencil, PlusCircle, Receipt, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRLExact, formatDateBR, maskPhoneBR } from "@/lib/format";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { listSales, undoSale, updateSale } from "@/services/salesService";
import { listVehicles } from "@/services/vehiclesService";
import { listTeamMembers } from "@/services/teamService";
import { PeriodSelect } from "@/components/admin/PeriodSelect";
import { LIST_PERIODS, inPeriod, type ListPeriod } from "@/lib/period";
import type { Sale } from "@/types/sale";

export const Route = createFileRoute("/admin/vendas/")({
  component: SalesPage,
});

const MONTH_LABEL = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function SalesPage() {
  const queryClient = useQueryClient();
  const [undoTarget, setUndoTarget] = useState<Sale | null>(null);
  const [editTarget, setEditTarget] = useState<Sale | null>(null);
  const [period, setPeriod] = useState<ListPeriod>("all");
  const { data: sales = [], isLoading } = useQuery({ queryKey: ["sales"], queryFn: listSales });
  const { data: vehicles = [] } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: listVehicles,
  });
  const { data: members = [] } = useQuery({ queryKey: ["team"], queryFn: listTeamMembers });

  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  const memberById = new Map(members.map((m) => [m.id, m]));

  const undoMutation = useMutation({
    mutationFn: (saleId: string) => undoSale(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Venda desfeita — o veículo voltou ao estoque ativo.");
      setUndoTarget(null);
    },
    onError: () => toast.error("Erro ao desfazer a venda."),
  });

  const editMutation = useMutation({
    mutationFn: (patch: { id: string; buyerName: string; buyerPhone: string; soldAt: string; notes: string }) =>
      updateSale(patch.id, {
        buyerName: patch.buyerName,
        buyerPhone: patch.buyerPhone || null,
        soldAt: patch.soldAt,
        notes: patch.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Venda atualizada.");
      setEditTarget(null);
    },
    onError: () => toast.error("Erro ao atualizar a venda."),
  });

  const now = new Date();
  const monthName = MONTH_LABEL[now.getMonth()];
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthSales = sales.filter((s) => s.soldAt.startsWith(monthKey));
  const monthRevenue = monthSales.reduce((sum, s) => sum + s.salePrice, 0);
  const monthNetProfit = monthSales.reduce((sum, s) => sum + s.netProfit, 0);

  // Período controla a tabela e o cartão "Lucro no período" (em "Todo o período" = acumulado).
  const filteredSales = sales.filter((s) => inPeriod(s.soldAt, period));
  const periodNetProfit = filteredSales.reduce((sum, s) => sum + s.netProfit, 0);
  const periodLabel = LIST_PERIODS.find((p) => p.key === period)?.label ?? "";

  return (
    <>
      <AdminTopbar
        title="Vendas realizadas"
        subtitle="Histórico com lucro real por venda"
        actions={
          <Button asChild size="sm">
            <Link to="/admin/vendas/nova">
              <PlusCircle className="h-4 w-4" />
              Registrar venda
            </Link>
          </Button>
        }
      />
      <div className="flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Kpi
            label="Receita no mês"
            value={formatBRLExact(monthRevenue)}
            hint={`${monthSales.length} ${monthSales.length === 1 ? "carro vendido" : "carros vendidos"} em ${monthName}`}
          />
          <Kpi
            label="Lucro líquido do mês"
            value={formatBRLExact(monthNetProfit)}
            hint={`referente a ${monthName}`}
            tone={monthNetProfit >= 0 ? "positive" : "negative"}
          />
          <Kpi
            label={period === "all" ? "Lucro acumulado" : "Lucro no período"}
            value={formatBRLExact(periodNetProfit)}
            hint={
              period === "all"
                ? `${filteredSales.length} ${filteredSales.length === 1 ? "venda" : "vendas"} · desde o início`
                : `${filteredSales.length} ${filteredSales.length === 1 ? "venda" : "vendas"} · ${periodLabel.toLowerCase()}`
            }
            tone={periodNetProfit >= 0 ? undefined : "negative"}
          />
        </div>

        {isLoading ? (
          <div className="grid place-items-center rounded-2xl border border-border bg-card py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sales.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-border bg-card py-20 text-center">
            <Receipt className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
            <Button asChild className="mt-4" size="sm">
              <Link to="/admin/vendas/nova">Registrar primeira venda</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Barra de período */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-semibold text-foreground">
                Histórico de vendas
              </h3>
              <PeriodSelect
                value={period}
                onChange={setPeriod}
                options={LIST_PERIODS}
                ariaLabel="Filtrar vendas por período"
              />
            </div>

            {filteredSales.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border border-border bg-card py-16 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Nenhuma venda em {periodLabel.toLowerCase()}.
                </p>
              </div>
            ) : (
              <>
            {/* Mobile: cards */}
            <div className="space-y-3 md:hidden">
              {filteredSales.map((s) => {
                const v = vehicleById.get(s.vehicleId);
                const seller = s.sellerId ? memberById.get(s.sellerId) : undefined;
                return (
                  <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      {v?.mainImage && (
                        <img src={v.mainImage} alt="" className="h-10 w-14 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {v ? `${v.brand} ${v.model}` : "Veículo removido"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {formatDateBR(s.soldAt)} · {s.buyerName}
                          {seller ? ` · ${seller.name}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <div className="text-sm tabular text-foreground">{formatBRLExact(s.salePrice)}</div>
                      <div
                        className={cn(
                          "font-display text-sm font-semibold tabular",
                          s.netProfit >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {s.netProfit >= 0 ? "+" : ""}
                        {formatBRLExact(s.netProfit)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditTarget(s)}
                          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3 w-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setUndoTarget(s)}
                          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                        >
                          <Undo2 className="h-3 w-3" />
                          Desfazer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: tabela */}
            <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Veículo</th>
                    <th className="px-3 py-3 font-medium">Data</th>
                    <th className="px-3 py-3 font-medium">Comprador</th>
                    <th className="px-3 py-3 font-medium">Vendedor</th>
                    <th className="px-3 py-3 text-right font-medium">Venda</th>
                    <th className="px-3 py-3 text-right font-medium">Comissão</th>
                    <th className="px-3 py-3 text-right font-medium">Lucro líquido</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSales.map((s) => {
                    const v = vehicleById.get(s.vehicleId);
                    const seller = s.sellerId ? memberById.get(s.sellerId) : undefined;
                    return (
                      <tr key={s.id} className="hover:bg-muted/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {v?.mainImage ? (
                              <img src={v.mainImage} alt="" className="h-9 w-13 rounded-md object-cover" />
                            ) : (
                              <div className="h-9 w-13 rounded-md bg-muted" />
                            )}
                            <span className="font-medium text-foreground">
                              {v ? `${v.brand} ${v.model}` : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{formatDateBR(s.soldAt)}</td>
                        <td className="px-3 py-3 text-foreground">{s.buyerName}</td>
                        <td className="px-3 py-3 text-muted-foreground">{seller?.name ?? "—"}</td>
                        <td className="px-3 py-3 text-right tabular text-foreground">
                          {formatBRLExact(s.salePrice)}
                        </td>
                        <td className="px-3 py-3 text-right tabular text-muted-foreground">
                          {formatBRLExact(s.commissionAmount)}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-3 text-right font-display font-semibold tabular",
                            s.netProfit >= 0 ? "text-success" : "text-destructive",
                          )}
                        >
                          {formatBRLExact(s.netProfit)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              aria-label="Editar venda"
                              title="Editar venda"
                              onClick={() => setEditTarget(s)}
                              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Desfazer venda"
                              title="Desfazer venda"
                              onClick={() => setUndoTarget(s)}
                              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                            >
                              <Undo2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
              </>
            )}
          </>
        )}
      </div>

      {undoTarget && (
        <UndoSaleModal
          vehicleName={(() => {
            const v = vehicleById.get(undoTarget.vehicleId);
            return v ? `${v.brand} ${v.model}` : "este veículo";
          })()}
          buyerName={undoTarget.buyerName}
          busy={undoMutation.isPending}
          onClose={() => setUndoTarget(null)}
          onConfirm={() => undoMutation.mutate(undoTarget.id)}
        />
      )}

      {editTarget && (
        <EditSaleModal
          sale={editTarget}
          vehicleName={(() => {
            const v = vehicleById.get(editTarget.vehicleId);
            return v ? `${v.brand} ${v.model}` : "este veículo";
          })()}
          busy={editMutation.isPending}
          onClose={() => setEditTarget(null)}
          onSave={(patch) => editMutation.mutate({ id: editTarget.id, ...patch })}
        />
      )}
    </>
  );
}

function EditSaleModal({
  sale,
  vehicleName,
  busy,
  onClose,
  onSave,
}: {
  sale: Sale;
  vehicleName: string;
  busy: boolean;
  onClose: () => void;
  onSave: (patch: { buyerName: string; buyerPhone: string; soldAt: string; notes: string }) => void;
}) {
  const [buyerName, setBuyerName] = useState(sale.buyerName);
  const [buyerPhone, setBuyerPhone] = useState(maskPhoneBR(sale.buyerPhone ?? ""));
  const [soldAt, setSoldAt] = useState(sale.soldAt.slice(0, 10));
  const [notes, setNotes] = useState(sale.notes ?? "");

  const inputCls =
    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (!buyerName.trim()) {
            toast.error("Informe o nome do comprador.");
            return;
          }
          onSave({ buyerName: buyerName.trim(), buyerPhone: buyerPhone.trim(), soldAt, notes: notes.trim() });
        }}
      >
        <h3 className="font-display text-sm font-semibold text-foreground">Editar venda</h3>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{vehicleName}</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-muted-foreground">Nome do comprador *</label>
            <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Telefone</label>
            <input
              type="tel"
              inputMode="numeric"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(maskPhoneBR(e.target.value))}
              placeholder="(47) 99999-9999"
              maxLength={15}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Data da venda</label>
            <input type="date" value={soldAt} onChange={(e) => setSoldAt(e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-muted-foreground">Observações</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes da negociação (opcional)"
              className={inputCls}
            />
          </div>
        </div>

        <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-[12px] text-muted-foreground">
          Para alterar <span className="font-medium text-foreground">valor ou comissão</span>, use
          “Desfazer” e registre novamente — assim o lucro e os lançamentos ficam consistentes.
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function UndoSaleModal({
  vehicleName,
  buyerName,
  busy,
  onClose,
  onConfirm,
}: {
  vehicleName: string;
  buyerName: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <Undo2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold text-foreground">Desfazer esta venda?</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              <span className="font-medium text-foreground">{vehicleName}</span> volta ao estoque
              ativo e os lançamentos gerados (recebimento e comissão) desta venda para{" "}
              <span className="font-medium text-foreground">{buyerName}</span> serão removidos. Esta
              ação não pode ser desfeita.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, desfazer venda"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Kpi({
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
          "mt-1 font-display text-2xl font-semibold tabular",
          tone === "positive" && "text-success",
          tone === "negative" && "text-destructive",
          !tone && "text-foreground",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
