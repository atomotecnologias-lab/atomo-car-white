import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, ShieldCheck, Handshake, Wallet, MapPin, ArrowRight } from "lucide-react";
import { ContactCTA } from "@/components/public/ContactCTA";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a ToniKar — Confiança e procedência em Jaraguá do Sul" },
      {
        name: "description",
        content:
          "Desde 2018 a ToniKar constrói confiança em cada negociação, com veículos de procedência e atendimento próximo em Jaraguá do Sul, SC.",
      },
      { property: "og:title", content: "Sobre a ToniKar" },
      {
        property: "og:description",
        content: "Confiança em cada negociação. Veículos selecionados, atendimento próximo e transparência.",
      },
      { property: "og:url", content: "https://tonikar.com.br/sobre" },
    ],
    links: [
      { rel: "canonical", href: "https://tonikar.com.br/sobre" },
    ],
  }),
  component: AboutPage,
});

const INDICATORS = [
  { icon: ShieldCheck, label: "Procedência verificada" },
  { icon: Handshake, label: "Atendimento próximo e transparente" },
  { icon: Wallet, label: "Compra, venda, troca e financiamento" },
  { icon: MapPin, label: "Jaraguá do Sul • Santa Catarina" },
];

function AboutPage() {
  const [playing, setPlaying] = useState(false);
  const reelUrl = "https://www.instagram.com/reel/DHdwoZKORMz/embed";

  return (
    <div className="bg-carbon text-clean">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-performance/10 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-clean/90 backdrop-blur">
                Sobre a ToniKar
              </div>

              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-clean sm:text-5xl lg:text-[3.25rem]">
                Construindo confiança em cada{" "}
                <span className="text-gradient-emerald">negociação desde 2018</span>.
              </h1>

              <div className="mt-7 space-y-5 font-display text-base font-light leading-relaxed text-clean/80 sm:text-lg">
                <p>
                  A ToniKar nasceu em Jaraguá do Sul com um propósito simples:
                  oferecer veículos de qualidade através de negociações transparentes e
                  atendimento próximo.
                </p>
                <p>
                  Ao longo dos anos construímos relacionamentos baseados em confiança,
                  ajudando clientes a comprar, vender, trocar e financiar veículos com
                  segurança e tranquilidade.
                </p>
              </div>

              <ul className="mt-9 grid gap-3 sm:grid-cols-2">
                {INDICATORS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur transition hover:border-performance/40 hover:bg-white/[0.05]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-performance/15 text-performance">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-clean/90">{label}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Button
                  asChild
                  size="lg"
                  className="group h-12 gap-2 bg-performance px-6 text-clean hover:bg-performance"
                >
                  <Link to="/estoque">
                    Ver estoque disponível
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* RIGHT — Video */}
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-performance/20 via-transparent to-accent/15 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-carbon/60 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur">
                <div className="relative aspect-[9/16] w-full">
                  {playing ? (
                    <iframe
                      src={reelUrl}
                      className="absolute inset-0 h-full w-full"
                      title="Vídeo institucional ToniKar"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlaying(true)}
                      aria-label="Reproduzir vídeo institucional da ToniKar"
                      className="group absolute inset-0 flex items-center justify-center bg-gradient-to-br from-carbon via-carbon/90 to-black"
                    >
                      <iframe
                        src={reelUrl}
                        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
                        title=""
                        tabIndex={-1}
                        aria-hidden
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
                      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-performance text-clean shadow-[0_10px_40px_-5px_rgba(143,29,36,0.55)] transition group-hover:scale-110">
                        <Play className="h-7 w-7 translate-x-0.5 fill-current" />
                      </span>
                      <span className="absolute bottom-6 left-6 right-6 text-left">
                        <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-performance">
                          Vídeo institucional
                        </span>
                        <span className="mt-1 block font-display text-lg font-medium text-clean">
                          Conheça a ToniKar
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactCTA />
    </div>
  );
}
