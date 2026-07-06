import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listVehicles } from "@/services/vehiclesService";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Instagram, Facebook, Globe, MessageSquare, Video, Sparkles, Copy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/marketing/conteudo")({
  component: ConteudoIAPage,
});

type Channel = {
  key: string;
  label: string;
  icon: typeof Instagram;
  tone: string;
  build: (v: { brand: string; model: string; version: string; price: number; year: number; km: number }) => string;
};

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const CHANNELS: Channel[] = [
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    tone: "from-pink-500/15 to-purple-500/15 text-pink-300 border-pink-400/30",
    build: (v) =>
      `🚗 ${v.brand} ${v.model} ${v.version} — ${v.year}\n📍 ${v.km.toLocaleString("pt-BR")} km · revisado\n💰 ${fmt(v.price)}\n\n• Procedência verificada\n• Pronto para transferência\n• Aceitamos troca e facilitamos seu financiamento\n\nChama no direct para agendar test-drive 👇\n\n#AtomoCar #Seminovos #EstoqueAutomotivo #${v.brand.toLowerCase()} #${v.model.toLowerCase().replace(/\s+/g, "")}`,
  },
  {
    key: "marketplace",
    label: "Facebook Marketplace",
    icon: Facebook,
    tone: "from-blue-500/15 to-cyan-500/15 text-blue-300 border-blue-400/30",
    build: (v) =>
      `${v.brand} ${v.model} ${v.version} ${v.year}\n${v.km.toLocaleString("pt-BR")} km — único dono, revisões em dia.\n\nValor: ${fmt(v.price)}\n\nAceitamos troca. Financiamento em até 60x. Procedência verificada e garantia de 3 meses no motor e câmbio.\n\nAtomo Car — atendimento 7 dias por semana.`,
  },
  {
    key: "google",
    label: "Google Negócios",
    icon: Globe,
    tone: "from-emerald-500/15 to-teal-500/15 text-emerald-300 border-emerald-400/30",
    build: (v) =>
      `${v.brand} ${v.model} ${v.version} ${v.year} disponível. ${v.km.toLocaleString("pt-BR")} km, procedência verificada, ${fmt(v.price)}. Aceitamos troca e financiamento. Agende seu test-drive na Atomo Car.`,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: MessageSquare,
    tone: "from-performance/15 to-emerald-500/15 text-performance border-performance/30",
    build: (v) =>
      `Olá! 👋\nO ${v.brand} ${v.model} ${v.version} ${v.year} continua disponível:\n\n• KM: ${v.km.toLocaleString("pt-BR")}\n• Valor: ${fmt(v.price)}\n• Aceita troca: sim\n• Financiamento: até 60x\n\nQuer agendar um test-drive ou receber mais fotos?`,
  },
  {
    key: "video",
    label: "Roteiro de vídeo curto",
    icon: Video,
    tone: "from-amber-500/15 to-orange-500/15 text-amber-300 border-amber-400/30",
    build: (v) =>
      `[0-2s] Plano aberto do ${v.brand} ${v.model} girando em 360°.\n[3-5s] Detalhe das rodas e perfil lateral.\n[6-9s] Interior: painel + multimídia ligados.\n[10-13s] Texto na tela: "${v.year} · ${v.km.toLocaleString("pt-BR")} km · ${fmt(v.price)}".\n[14-18s] Vendedor falando: "Único dono, revisões em dia, aceita troca."\n[19-22s] Call-to-action: "Agende seu test-drive — link na bio."\n[Trilha] Beat lo-fi premium.`,
  },
];

function ConteudoIAPage() {
  const { data: vehicles = [] } = useQuery({ queryKey: ["admin", "vehicles"], queryFn: listVehicles });
  const eligible = useMemo(() => vehicles.filter((v) => v.isPublished || v.status === "active"), [vehicles]);

  const [vehicleId, setVehicleId] = useState<string>("");
  const [channelKey, setChannelKey] = useState<string>(CHANNELS[0].key);
  const [generated, setGenerated] = useState<string>("");

  const selectedVehicle = useMemo(
    () => eligible.find((v) => v.id === vehicleId) ?? eligible[0],
    [eligible, vehicleId],
  );
  const channel = CHANNELS.find((c) => c.key === channelKey) ?? CHANNELS[0];

  const generate = () => {
    if (!selectedVehicle) return;
    setGenerated(
      channel.build({
        brand: selectedVehicle.brand,
        model: selectedVehicle.model,
        version: selectedVehicle.version,
        price: selectedVehicle.price,
        year: selectedVehicle.yearModel,
        km: selectedVehicle.mileage,
      }),
    );
  };

  const copy = () => {
    if (generated) navigator.clipboard.writeText(generated);
  };

  return (
    <>
      <AdminTopbar
        title="Conteúdo IA"
        subtitle="Gere textos prontos para cada canal. Os dados são fictícios."
      />
      <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-[320px_1fr] lg:p-8">
        {/* Sidebar config */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-white/[0.06] bg-premium p-5">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-titanium">
              Veículo
            </h3>
            <select
              value={selectedVehicle?.id ?? ""}
              onChange={(e) => setVehicleId(e.target.value)}
              className="mt-3 h-10 w-full rounded-lg border border-white/[0.08] bg-carbon px-3 text-sm text-clean focus:border-performance/40 focus:outline-none"
            >
              {eligible.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} {v.version} — {v.yearModel}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-premium p-5">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-titanium">
              Canal
            </h3>
            <div className="mt-3 space-y-1.5">
              {CHANNELS.map((c) => {
                const Icon = c.icon;
                const active = c.key === channelKey;
                return (
                  <button
                    key={c.key}
                    onClick={() => setChannelKey(c.key)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                      active
                        ? "border-performance/40 bg-performance/10 text-performance"
                        : "border-white/[0.06] bg-white/[0.02] text-clean/80 hover:border-white/[0.12] hover:text-clean",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={generate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-performance px-4 py-3 text-sm font-medium text-carbon transition-colors hover:bg-racing"
          >
            <Sparkles className="h-4 w-4" />
            Gerar com IA
          </button>
        </aside>

        {/* Output */}
        <section className="rounded-2xl border border-white/[0.06] bg-premium">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg border bg-gradient-to-br",
                  channel.tone,
                )}
              >
                <channel.icon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-semibold text-clean">{channel.label}</h2>
                <p className="text-xs text-titanium">
                  {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Selecione um veículo"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={generate}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 text-xs text-titanium hover:text-clean"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Regenerar
              </button>
              <button
                onClick={copy}
                disabled={!generated}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-performance px-3 text-xs font-medium text-carbon hover:bg-racing disabled:opacity-40"
              >
                <Copy className="h-3.5 w-3.5" /> Copiar
              </button>
            </div>
          </div>
          <div className="p-6">
            {generated ? (
              <pre className="whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-carbon/40 p-5 text-sm leading-relaxed text-clean">
                {generated}
              </pre>
            ) : (
              <div className="grid place-items-center rounded-xl border border-dashed border-white/[0.08] p-16 text-center">
                <Sparkles className="h-8 w-8 text-performance/60" />
                <p className="mt-3 text-sm text-clean">Pronto para gerar.</p>
                <p className="mt-1 text-xs text-titanium">
                  Escolha um veículo e canal, depois clique em "Gerar com IA".
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
