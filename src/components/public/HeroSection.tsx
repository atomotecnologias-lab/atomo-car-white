import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { ArrowRight, ShieldCheck, BadgeCheck, Sparkles } from "lucide-react";
import atomoCarLogo from "@/assets/atomo-car-logo.svg.asset.json";

export function HeroSection() {
  return (
    <section className="relative isolate -mt-20 overflow-hidden bg-hero pt-20 text-clean">
      {/* layered background */}
      <div className="absolute inset-0 -z-10 bg-grid opacity-[0.35]" />
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=2400&q=80"
          alt=""
          aria-hidden
          className="h-full w-full object-cover opacity-25 [animation:fade-in_1.4s_ease-out_both]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/85 to-carbon/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent" />
      </div>

      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-performance/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-racing/15 blur-[120px]"
      />

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-clean/90 backdrop-blur"
            style={{ animation: "var(--animate-fade-up)", animationDelay: "60ms" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-performance opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-performance" />
            </span>
            Jaraguá do Sul — SC
          </div>

          <h1
            className="mt-7 font-display text-[2.5rem] font-semibold leading-[1.02] tracking-tight text-clean sm:text-6xl lg:text-[5rem]"
            style={{ animation: "var(--animate-fade-up)", animationDelay: "160ms" }}
          >
            Performance,<br />
            procedência<br />
            e <span className="text-gradient-emerald">confiança</span>.
          </h1>

          <p
            className="mt-7 max-w-xl text-base leading-relaxed text-clean/70 sm:text-lg"
            style={{ animation: "var(--animate-fade-up)", animationDelay: "280ms" }}
          >
            Seminovos e usados selecionados em Jaraguá do Sul. Atendimento
            transparente, condições para compra, venda, troca e financiamento.
          </p>

          <div
            className="mt-10 flex flex-wrap gap-3"
            style={{ animation: "var(--animate-fade-up)", animationDelay: "400ms" }}
          >
            <Button
              asChild
              size="lg"
              className="group relative overflow-hidden bg-performance text-carbon hover:bg-performance"
            >
              <Link to="/estoque">
                <span className="relative z-10">Ver estoque</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-racing via-performance to-racing transition-transform duration-700 group-hover:translate-x-0" />
              </Link>
            </Button>
            <WhatsappButton
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/[0.03] text-clean backdrop-blur hover:border-performance hover:bg-white/[0.06] hover:text-clean"
            >
              Falar no WhatsApp
            </WhatsappButton>
          </div>

          <div
            className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-8"
            style={{ animation: "var(--animate-fade-up)", animationDelay: "520ms" }}
          >
            <Stat icon={<ShieldCheck className="h-4 w-4" />} value="Procedência" label="verificada" />
            <Stat icon={<BadgeCheck className="h-4 w-4" />} value="Atendimento" label="transparente" />
            <Stat icon={<Sparkles className="h-4 w-4" />} value="Veículos" label="selecionados" />
          </div>
        </div>
      </div>

    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-performance">{icon}</div>
      <div className="mt-2 font-display text-base font-medium text-clean">{value}</div>
      <div className="text-xs text-titanium">{label}</div>
    </div>
  );
}
