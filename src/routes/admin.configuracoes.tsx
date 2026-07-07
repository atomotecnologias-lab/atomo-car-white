import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Clock,
  Loader2,
  Plus,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRLExact } from "@/lib/format";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockSettings } from "@/data/mockSettings";
import { getCommissionConfig, saveCommissionConfig } from "@/services/settingsService";
import {
  createTeamMember,
  listTeamMembers,
  updateTeamMember,
} from "@/services/teamService";
import type { CommissionBase, CommissionType } from "@/types/sale";

export const Route = createFileRoute("/admin/configuracoes")({
  component: SettingsPage,
});

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20";

function SettingsPage() {
  return (
    <>
      <AdminTopbar title="Configurações" subtitle="Loja, equipe e regra de comissão" />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="store" className="space-y-5">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-2xl border border-border bg-card p-1 [&::-webkit-scrollbar]:hidden">
            <SettingsTab value="store">Loja</SettingsTab>
            <SettingsTab value="team">Equipe</SettingsTab>
            <SettingsTab value="commission">Comissão</SettingsTab>
          </TabsList>

          <TabsContent value="store" className="m-0 space-y-5">
            <StoreTab />
          </TabsContent>
          <TabsContent value="team" className="m-0">
            <TeamTab />
          </TabsContent>
          <TabsContent value="commission" className="m-0">
            <CommissionTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function SettingsTab({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="shrink-0 rounded-xl px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
    >
      {children}
    </TabsTrigger>
  );
}

/* ─────────────── Loja (dados do site — leitura) ─────────────── */

function StoreTab() {
  return (
    <>
      <Card title="Identidade">
        <Field label="Nome" value={mockSettings.name} />
        <Field label="Descrição curta" value={mockSettings.shortDescription} />
      </Card>
      <Card title="Contato e localização">
        <Field icon={MapPin} label="Endereço" value={mockSettings.address} />
        <Field icon={Phone} label="WhatsApp" value={mockSettings.whatsappDisplay} />
        <Field icon={Instagram} label="Instagram" value={mockSettings.instagram} />
        <Field icon={Facebook} label="Facebook" value={mockSettings.facebook} />
      </Card>
      <Card title="Horários">
        {mockSettings.openingHours.map((h) => (
          <Field key={h.label} icon={Clock} label={h.label} value={h.value} />
        ))}
      </Card>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="border-b border-border px-6 py-4">
        <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      </header>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof MapPin;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5">
      {Icon && (
        <span className="grid h-8 w-8 place-items-center rounded-md bg-muted text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </span>
      )}
      <div className="flex-1">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

/* ─────────────── Equipe (CRUD real) ─────────────── */

function TeamTab() {
  const queryClient = useQueryClient();
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team"],
    queryFn: listTeamMembers,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      createTeamMember({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role: "seller",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Vendedor cadastrado.");
      setName("");
      setEmail("");
      setPhone("");
      setFormOpen(false);
    },
    onError: () => toast.error("Erro ao cadastrar vendedor."),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateTeamMember(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Equipe atualizada.");
    },
    onError: () => toast.error("Erro ao atualizar."),
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Equipe</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Vendedores podem ser cadastrados sem login — o acesso é vinculado depois.
          </p>
        </div>
        {!formOpen && (
          <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Novo vendedor
          </Button>
        )}
      </header>

      {formOpen && (
        <form
          className="grid grid-cols-1 gap-4 border-b border-border p-6 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) {
              toast.error("Informe o nome.");
              return;
            }
            createMutation.mutate();
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Nome *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Telefone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </div>
          <div className="flex gap-2 sm:col-span-3">
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid place-items-center py-14">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : members.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          Nenhum membro cadastrado ainda.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-4 px-6 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {m.name[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{m.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                      m.role === "owner"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {m.role === "owner" ? "Dono" : "Vendedor"}
                  </span>
                  {!m.isActive && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      inativo
                    </span>
                  )}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {[m.email, m.phone].filter(Boolean).join(" · ") || "sem contato"}
                  {!m.userId && m.role === "seller" ? " · sem login" : ""}
                </div>
              </div>
              {m.role !== "owner" && (
                <button
                  type="button"
                  onClick={() => toggleMutation.mutate({ id: m.id, isActive: !m.isActive })}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {m.isActive ? "Desativar" : "Reativar"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ─────────────── Comissão (config real) ─────────────── */

function CommissionTab() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({
    queryKey: ["commission-config"],
    queryFn: getCommissionConfig,
  });

  const [type, setType] = useState<CommissionType>("percent");
  const [base, setBase] = useState<CommissionBase>("sale");
  const [value, setValue] = useState("1");

  useEffect(() => {
    if (config) {
      setType(config.type);
      setBase(config.base);
      setValue(String(config.value));
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: () =>
      saveCommissionConfig({
        type,
        base,
        value: Number(String(value).replace(",", ".")) || 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-config"] });
      toast.success("Regra de comissão salva — vale para as próximas vendas.");
    },
    onError: () => toast.error("Erro ao salvar a regra."),
  });

  const numericValue = Number(String(value).replace(",", ".")) || 0;
  const exampleSale = 80000;
  const exampleProfit = 7000;
  const exampleCommission =
    type === "fixed"
      ? numericValue
      : base === "sale"
        ? (exampleSale * numericValue) / 100
        : (exampleProfit * numericValue) / 100;

  if (isLoading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="border-b border-border px-6 py-4">
        <h3 className="inline-flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <Percent className="h-4 w-4 text-primary" />
          Regra de comissão da loja
        </h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Aplicada automaticamente ao registrar cada venda. Mudanças NÃO alteram vendas passadas.
        </p>
      </header>
      <form
        className="space-y-5 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <ChoiceButton active={type === "percent"} onClick={() => setType("percent")}>
                Percentual
              </ChoiceButton>
              <ChoiceButton active={type === "fixed"} onClick={() => setType("fixed")}>
                Valor fixo
              </ChoiceButton>
            </div>
          </div>
          {type === "percent" && (
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Sobre</label>
              <div className="grid grid-cols-2 gap-2">
                <ChoiceButton active={base === "sale"} onClick={() => setBase("sale")}>
                  Valor da venda
                </ChoiceButton>
                <ChoiceButton active={base === "profit"} onClick={() => setBase("profit")}>
                  Lucro bruto
                </ChoiceButton>
              </div>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              {type === "percent" ? "Percentual (%)" : "Valor por venda (R$)"}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={cn(inputCls, "tabular")}
            />
          </div>
        </div>

        <div className="rounded-xl bg-muted p-4 text-sm">
          <span className="text-muted-foreground">Exemplo: </span>
          <span className="text-foreground">
            venda de {formatBRLExact(exampleSale)} com lucro bruto de{" "}
            {formatBRLExact(exampleProfit)} →{" "}
          </span>
          <span className="font-display font-semibold text-primary">
            comissão {formatBRLExact(exampleCommission)}
          </span>
        </div>

        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar regra"}
        </Button>
      </form>
    </section>
  );
}

function ChoiceButton({
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
        "rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-input bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
