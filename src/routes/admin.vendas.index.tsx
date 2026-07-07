import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, PlusCircle, Receipt, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRLExact, formatDateBR } from "@/lib/format";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { listSales, undoSale } from "@/services/salesService";
import { listVehicles } from "@/services/vehiclesService";
import { listTeamMembers } from "@/services/teamService";

export const Route = createFileRoute("/admin/vendas/")({
  component: SalesPage,
});

function SalesPage() {
  const queryClient = useQueryClient();
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
    },
    onError: () => toast.error("Erro ao desfazer a venda."),
  });

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthSales = sales.filter((s) => s.soldAt.startsWith(monthKey));
  const monthRevenue = monthSales.reduce((sum, s) => sum + s.salePrice, 0);
  const monthNetProfit = monthSales.reduce((sum, s) => sum + s.netProfit, 0);
  const totalNetProfit = sales.reduce((sum, s) => sum + s.netProfit, 0);

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
          <Kpi label="Vendas no mês" value={String(monthSales.length)} hint={`receita ${formatBRLExact(monthRevenue)}`} />
          <Kpi
            label="Lucro líquido do mês"
            value={formatBRLExact(monthNetProfit)}
            tone={monthNetProfit >= 0 ? "positive" : "negative"}
          />
          <Kpi
            label="Lucro acumulado"
            value={formatBRLExact(totalNetProfit)}
            hint={`${sales.length} vendas registradas`}
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
            {/* Mobile: cards */}
            <div className="space-y-3 md:hidden">
              {sales.map((s) => {
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
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Desfazer esta venda? O veículo volta ao estoque e os lançamentos são removidos.")) {
                            undoMutation.mutate(s.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                      >
                        <Undo2 className="h-3 w-3" />
                        Desfazer
                      </button>
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
                  {sales.map((s) => {
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
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            aria-label="Desfazer venda"
                            title="Desfazer venda"
                            onClick={() => {
                              if (confirm("Desfazer esta venda? O veículo volta ao estoque e os lançamentos são removidos.")) {
                                undoMutation.mutate(s.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Undo2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
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
