import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroSearch } from "@/components/public/home/HeroSearch";
import { BrandStatement } from "@/components/public/home/BrandStatement";
import { TrustSection } from "@/components/public/TrustSection";
import { FeaturedVehicles } from "@/components/public/FeaturedVehicles";
import { ContactCTA } from "@/components/public/ContactCTA";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { listFeaturedVehicles } from "@/services/vehiclesService";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowLeftRight } from "lucide-react";
import heroPoster from "@/assets/hero-sequence/hero-poster.jpg.asset.json";
import heroVideo from "@/assets/hero-sequence/hero.webm.asset.json";

export const Route = createFileRoute("/_public/")({
  head: () => ({
    meta: [
      { title: "Primos Automóveis — Seminovos e usados em Jaraguá do Sul" },
      {
        name: "description",
        content:
          "Veículos selecionados, atendimento transparente e condições para compra, venda, troca e financiamento em Jaraguá do Sul.",
      },
      { property: "og:title", content: "Primos Automóveis" },
      {
        property: "og:description",
        content:
          "Encontre seu próximo veículo com confiança. Procedência verificada, atendimento humano.",
      },
      { property: "og:url", content: "https://primo-auto-pro.lovable.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://primo-auto-pro.lovable.app/" },
      { rel: "preload", as: "image", href: heroPoster.url, fetchPriority: "high" },
      { rel: "preload", as: "video", href: heroVideo.url, type: "video/webm" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: featured = [] } = useQuery({
    queryKey: ["vehicles", "featured"],
    queryFn: listFeaturedVehicles,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <HeroSearch />
      <TrustSection />

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Estoque selecionado"
              title="Veículos em destaque"
              subtitle="Uma seleção curada do nosso estoque. Todos com procedência verificada e prontos para visita."
            />
            <Button asChild variant="outline" size="lg">
              <Link to="/estoque">
                Ver estoque completo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10">
            <FeaturedVehicles vehicles={featured} />
          </div>
        </div>
      </section>

      <section className="bg-card py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80"
              alt="Avaliação de veículo"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-carbon/85 px-3 py-1.5 text-xs text-clean backdrop-blur">
              <ArrowLeftRight className="h-3.5 w-3.5 text-accent" />
              Avaliação gratuita
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Venda seu veículo"
              title="Quer vender ou trocar seu carro?"
              subtitle="A Primos compra seu veículo ou aceita como parte do pagamento. Avaliação rápida e proposta justa."
            />
            <ul className="mt-6 space-y-3 text-sm text-foreground/80">
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 rounded-full bg-accent" />
                Envie marca, modelo, ano e quilometragem.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 rounded-full bg-accent" />
                Recebemos seu contato em horário comercial.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 rounded-full bg-accent" />
                Apresentamos proposta de compra ou troca.
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/venda-seu-veiculo">
                  Avaliar meu veículo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/financiamento">Simular financiamento</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            Sobre a Primos
          </div>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-clean sm:text-4xl">
            Confiança se constrói em cada negócio realizado.
          </h2>
          <p className="mt-5 font-display text-base font-light leading-relaxed tracking-tight text-muted-foreground sm:text-lg">
            Desde 2018 ajudando clientes de Jaraguá do Sul e região a encontrar
            veículos selecionados, com negociação transparente e atendimento
            especializado.
          </p>
          <div className="mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/sobre">Conheça nossa história</Link>
            </Button>
          </div>
        </div>
      </section>

      <BrandStatement />
      <ContactCTA />
    </>
  );
}
