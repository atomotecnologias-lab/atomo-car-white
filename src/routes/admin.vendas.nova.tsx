import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Search,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, formatBRLExact, formatKm } from "@/lib/format";
import { daysInStock } from "@/lib/aging";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Stepper, type StepDef } from "@/components/admin/stepper/Stepper";
import { Button } from "@/components/ui/button";
import { listVehicles } from "@/services/vehiclesService";
import { listActiveSellers } from "@/services/teamService";
import { upsertAcquisition } from "@/services/costsService";
import {
  MissingAcquisitionError,
  previewSale,
  registerSale,
} from "@/services/salesService";
import type { PaymentMethod } from "@/types/sale";

export const Route = createFileRoute("/admin/vendas/nova")({
  component: NewSalePage,
});

const STEPS: StepDef[] = [
  { key: "vehicle", label: "Veículo", description: "Qual carro foi vendido" },
  { key: "buyer", label: "Comprador & condições", description: "Cliente, vendedor e pagamento" },
  { key: "summary", label: "Resumo & lucro", description: "Confira o lucro real e confirme" },
];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "À vista" },
  { value: "pix", label: "Pix" },
  { value: "financing", label: "Financiamento" },
  { value: "consortium", label: "Consórcio" },
  { value: "trade_in", label: "Troca + volta" },
  { value: "mixed", label: "Misto" },
  { value: "other", label: "Outro" },
];

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20";

function parseMoney(raw: string): number {
  const clean = raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  return Number(clean) || 0;
}

function NewSalePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [stepIdx, setStepIdx] = useState(0);
  const [confirmLoss, setConfirmLoss] = useState(false);

  const [vehicleId, setVehicleId] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [soldAt, setSoldAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  const { data: vehicles = [] } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: listVehicles,
  });
  const { data: sellers = [] } = useQuery({
    queryKey: ["team", "sellers"],
    queryFn: listActiveSellers,
  });

  const sellable = useMemo(
    () =>
      vehicles
        .filter((v) => v.status !== "sold" && v.status !== "inactive")
        .filter((v) =>
          `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(search.trim().toLowerCase()),
        ),
    [vehicles, search],
  );
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const priceNum = parseMoney(salePrice);

  const completed = useMemo(() => {
    const done = new Set<string>();
    if (vehicleId) done.add("vehicle");
    if (buyerName.trim() && priceNum > 0) done.add("buyer");
    return done;
  }, [vehicleId, buyerName, priceNum]);

  const canNext =
    stepIdx === 0 ? Boolean(vehicleId) : stepIdx === 1 ? buyerName.trim() && priceNum > 0 : true;

  // Prévia do lucro (passo 3)
  const previewQuery = useQuery({
    queryKey: ["sale-preview", vehicleId, priceNum, Boolean(sellerId)],
    queryFn: () => previewSale(vehicleId, priceNum, Boolean(sellerId)),
    enabled: stepIdx === 2 && Boolean(vehicleId) && priceNum > 0,
    retry: false,
  });

  const missingAcquisition = previewQuery.error instanceof MissingAcquisitionError;

  const saleMutation = useMutation({
    mutationFn: () =>
      registerSale({
        vehicleId,
        sellerId: sellerId || undefined,
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim() || undefined,
        salePrice: priceNum,
        soldAt,
        paymentMethod,
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Venda registrada! O veículo saiu do site automaticamente.");
      navigate({ to: "/admin/vendas" });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar a venda.");
    },
  });

  const handleConfirm = () => {
    const preview = previewQuery.data;
    if (!preview) return;
    if (preview.netProfit < 0 && !confirmLoss) {
      setConfirmLoss(true);
      return;
    }
    saleMutation.mutate();
  };

  return (
    <>
      <AdminTopbar title="Registrar venda" subtitle="Do veículo ao lucro real em três passos" />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Stepper lateral */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-3">
              <Stepper
                steps={STEPS}
                currentIndex={stepIdx}
                completed={completed}
                onStepClick={(i) => i <= stepIdx && setStepIdx(i)}
              />
            </div>
          </aside>

          {/* Progresso mobile */}
          <div className="lg:hidden">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Passo {stepIdx + 1} de {STEPS.length}
              </span>
              <span>{STEPS[stepIdx].label}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          <main className="min-w-0 space-y-5">
            {/* PASSO 1 — Veículo */}
            {stepIdx === 0 && (
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-base font-semibold text-foreground">
                  Qual veículo foi vendido?
                </h2>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por marca ou modelo…"
                    className={cn(inputCls, "pl-9")}
                  />
                </div>
                <div className="mt-4 grid max-h-[420px] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
                  {sellable.length === 0 ? (
                    <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                      Nenhum veículo disponível para venda.
                    </p>
                  ) : (
                    sellable.map((v) => {
                      const selected = v.id === vehicleId;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setVehicleId(v.id);
                            if (!salePrice) setSalePrice(String(v.price));
                          }}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                            selected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border bg-background hover:border-primary/40",
                          )}
                        >
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {v.mainImage && (
                              <img src={v.mainImage} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-foreground">
                              {v.brand} {v.model}
                            </div>
                            <div className="truncate text-[11px] text-muted-foreground">
                              {v.version} · {formatKm(v.mileage)} · {daysInStock(v)}d em estoque
                            </div>
                            <div className="mt-0.5 font-display text-sm font-semibold tabular text-foreground">
                              {formatBRL(v.price)}
                            </div>
                          </div>
                          {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </section>
            )}

            {/* PASSO 2 — Comprador & condições */}
            {stepIdx === 1 && (
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-base font-semibold text-foreground">
                  Comprador e condições
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs text-muted-foreground">
                      Nome do comprador *
                    </label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Ex.: João da Silva"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-muted-foreground">Telefone</label>
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="(47) 99999-9999"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-muted-foreground">
                      Valor da venda (R$) *
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className={cn(inputCls, "font-display tabular")}
                    />
                    {priceNum > 0 && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatBRLExact(priceNum)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-muted-foreground">
                      Data da venda
                    </label>
                    <input
                      type="date"
                      value={soldAt}
                      onChange={(e) => setSoldAt(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-muted-foreground">Vendedor</label>
                    <select
                      value={sellerId}
                      onChange={(e) => setSellerId(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Sem vendedor (venda da casa)</option>
                      {sellers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Define o cálculo automático da comissão.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-muted-foreground">
                      Forma de pagamento
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className={inputCls}
                    >
                      {PAYMENT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
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
              </section>
            )}

            {/* PASSO 3 — Resumo & lucro */}
            {stepIdx === 2 && vehicle && (
              <section className="space-y-4">
                {/* Veículo */}
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {vehicle.mainImage && (
                      <img src={vehicle.mainImage} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm font-semibold text-foreground">
                      {vehicle.brand} {vehicle.model} {vehicle.version}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Comprador: {buyerName} · {PAYMENT_OPTIONS.find((p) => p.value === paymentMethod)?.label}
                      {sellerId
                        ? ` · Vendedor: ${sellers.find((s) => s.id === sellerId)?.name ?? ""}`
                        : " · Sem vendedor"}
                    </div>
                  </div>
                </div>

                {/* Breakdown do lucro */}
                {previewQuery.isLoading ? (
                  <div className="grid place-items-center rounded-2xl border border-border bg-card py-14">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : missingAcquisition ? (
                  <MissingAcquisitionForm
                    vehicleId={vehicleId}
                    onSaved={() => previewQuery.refetch()}
                  />
                ) : previewQuery.isError ? (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
                    {(previewQuery.error as Error).message}
                  </div>
                ) : previewQuery.data ? (
                  <div className="overflow-hidden rounded-2xl border border-border bg-card">
                    <header className="border-b border-border px-5 py-3.5">
                      <h3 className="font-display text-sm font-semibold text-foreground">
                        Lucro real desta venda
                      </h3>
                    </header>
                    <dl className="divide-y divide-border text-sm">
                      <Row label="Valor da venda" value={formatBRLExact(previewQuery.data.salePrice)} />
                      <Row
                        label="Aquisição do veículo"
                        value={`− ${formatBRLExact(previewQuery.data.acquisitionPrice)}`}
                        muted
                      />
                      <Row
                        label="Custos lançados"
                        value={`− ${formatBRLExact(previewQuery.data.costsTotal)}`}
                        muted
                      />
                      <Row
                        label="Lucro bruto"
                        value={formatBRLExact(previewQuery.data.grossProfit)}
                        strong
                        tone={previewQuery.data.grossProfit >= 0 ? "positive" : "negative"}
                      />
                      <Row
                        label={`Comissão (${describeCommission(previewQuery.data.config)})`}
                        value={`− ${formatBRLExact(previewQuery.data.commissionAmount)}`}
                        muted
                      />
                    </dl>
                    <div
                      className={cn(
                        "flex items-center justify-between px-5 py-4",
                        previewQuery.data.netProfit >= 0 ? "bg-success/10" : "bg-destructive/10",
                      )}
                    >
                      <span className="font-display text-sm font-semibold text-foreground">
                        Lucro líquido
                      </span>
                      <span
                        className={cn(
                          "font-display text-2xl font-bold tabular",
                          previewQuery.data.netProfit >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {formatBRLExact(previewQuery.data.netProfit)}
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* Confirmação de prejuízo */}
                {confirmLoss && previewQuery.data && previewQuery.data.netProfit < 0 && (
                  <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-foreground">
                        Esta venda gera prejuízo de{" "}
                        {formatBRLExact(Math.abs(previewQuery.data.netProfit))}.
                      </p>
                      <p className="mt-0.5 text-muted-foreground">
                        Às vezes vale girar o capital — confirme abaixo se é intencional.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Rodapé de navegação */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() =>
                  stepIdx === 0 ? navigate({ to: "/admin/vendas" }) : setStepIdx((i) => i - 1)
                }
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              {stepIdx < 2 ? (
                <Button disabled={!canNext} onClick={() => setStepIdx((i) => i + 1)}>
                  Avançar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  disabled={
                    !previewQuery.data || saleMutation.isPending || previewQuery.isLoading
                  }
                  onClick={handleConfirm}
                  className={cn(
                    confirmLoss &&
                      previewQuery.data &&
                      previewQuery.data.netProfit < 0 &&
                      "bg-destructive hover:bg-destructive/90",
                  )}
                >
                  {saleMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : confirmLoss && previewQuery.data && previewQuery.data.netProfit < 0 ? (
                    "Confirmar venda com prejuízo"
                  ) : (
                    "Confirmar venda"
                  )}
                </Button>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

function describeCommission(config: { type: string; base: string; value: number }): string {
  if (config.type === "fixed") return `fixa ${formatBRL(config.value)}`;
  return `${config.value}% sobre ${config.base === "sale" ? "a venda" : "o lucro"}`;
}

function Row({
  label,
  value,
  muted,
  strong,
  tone,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <dt className={cn("text-muted-foreground", strong && "font-medium text-foreground")}>
        {label}
      </dt>
      <dd
        className={cn(
          "font-display tabular",
          muted && "text-muted-foreground",
          strong && "font-semibold",
          tone === "positive" && "text-success",
          tone === "negative" && "text-destructive",
          !muted && !tone && "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/** Aquisição obrigatória — CTA inline sem sair do fluxo. */
function MissingAcquisitionForm({
  vehicleId,
  onSaved,
}: {
  vehicleId: string;
  onSaved: () => void;
}) {
  const [value, setValue] = useState("");
  const mutation = useMutation({
    mutationFn: () => upsertAcquisition({ vehicleId, acquisitionPrice: parseMoney(value) }),
    onSuccess: () => {
      toast.success("Aquisição registrada.");
      onSaved();
    },
    onError: () => toast.error("Erro ao salvar aquisição."),
  });

  return (
    <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
      <div className="flex items-start gap-3">
        <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Este veículo não tem valor de aquisição registrado.
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Sem ele o lucro real não pode ser calculado. Registre agora sem sair da venda:
          </p>
          <form
            className="mt-3 flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (parseMoney(value) <= 0) {
                toast.error("Informe um valor válido.");
                return;
              }
              mutation.mutate();
            }}
          >
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Quanto a loja pagou (R$)"
              className={cn(inputCls, "max-w-[220px] tabular")}
            />
            <Button type="submit" size="sm" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar e calcular"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
