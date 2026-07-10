import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getVehicleBySlug, listRelatedVehicles } from "@/services/vehiclesService";
import { VehicleGallery } from "@/components/public/VehicleGallery";
import { VehicleSpecs } from "@/components/public/VehicleSpecs";
import { VehicleCard } from "@/components/public/VehicleCard";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatKm, formatYear, statusLabel } from "@/lib/format";
import { vehicleInterestMessage } from "@/lib/whatsapp";
import { ArrowLeft, Banknote, ArrowLeftRight, ShieldCheck, Info } from "lucide-react";

export const Route = createFileRoute("/_public/veiculo/$slug")({
  loader: async ({ params }) => {
    const vehicle = await getVehicleBySlug(params.slug);
    if (!vehicle) throw notFound();
    return { vehicle };
  },
  head: ({ loaderData, params }) => {
    const v = loaderData?.vehicle;
    if (!v) return { meta: [{ title: "Veículo — ToniKar" }] };
    const title = `${v.brand} ${v.model} ${v.version} ${formatYear(v.yearManufacture, v.yearModel)} — ToniKar`;
    const description = `${v.brand} ${v.model} ${v.version} ${formatYear(v.yearManufacture, v.yearModel)}, ${formatKm(v.mileage)}, ${v.color}. ${formatBRL(v.price)}.`;
    const url = `https://tonikar.com.br/veiculo/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: v.mainImage },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        { name: "twitter:image", content: v.mainImage },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Vehicle",
            name: `${v.brand} ${v.model} ${v.version}`,
            brand: v.brand,
            model: v.model,
            vehicleModelDate: String(v.yearModel),
            productionDate: String(v.yearManufacture),
            mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileage, unitCode: "KMT" },
            color: v.color,
            image: v.mainImage,
            offers: {
              "@type": "Offer",
              price: v.price,
              priceCurrency: "BRL",
              availability: "https://schema.org/InStock",
              url,
            },
          }),
        },
      ],
    };
  },
  notFoundComponent: VehicleNotFound,
  component: VehicleDetail,
});

function VehicleNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl text-clean">Veículo não encontrado</h1>
      <p className="mt-3 text-muted-foreground">
        O veículo que você procurou não está mais disponível ou foi removido.
      </p>
      <Button asChild className="mt-6">
        <Link to="/estoque">Ver estoque</Link>
      </Button>
    </div>
  );
}

function VehicleDetail() {
  const { vehicle } = Route.useLoaderData();
  const { data: related = [] } = useQuery({
    queryKey: ["vehicles", "related", vehicle.id],
    queryFn: () => listRelatedVehicles(vehicle),
  });

  return (
    <div className="bg-background pb-20 lg:pb-0">
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <Link to="/estoque" className="inline-flex items-center gap-1.5 hover:text-clean">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao estoque
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* LEFT — Gallery + content */}
          <div>
            <VehicleGallery images={vehicle.images} alt={`${vehicle.brand} ${vehicle.model}`} />

            <div className="mt-10">
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>{vehicle.brand}</span>
                {vehicle.status === "reserved" && (
                  <Badge variant="outline" className="border-warning/40 text-warning">
                    {statusLabel(vehicle.status)}
                  </Badge>
                )}
                {vehicle.isFeatured && (
                  <Badge variant="outline" className="border-accent/40 text-accent">
                    Destaque
                  </Badge>
                )}
              </div>
              <h1 className="mt-2 font-display text-3xl font-medium leading-[1.05] text-clean sm:text-4xl lg:text-5xl">
                {vehicle.model}
              </h1>
              <p className="mt-1 text-lg text-muted-foreground">{vehicle.version}</p>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl text-clean">Ficha técnica</h2>
              <div className="mt-4">
                <VehicleSpecs vehicle={vehicle} />
              </div>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl text-clean">Opcionais e diferenciais</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {vehicle.features.map((f: string) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                  >
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl text-clean">Sobre este veículo</h2>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">
                {vehicle.descriptionFull}
              </p>
            </div>

            <div className="mt-10 flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p>
                Disponibilidade e valor sujeitos a confirmação. Recomendamos agendar
                visita pelo WhatsApp para confirmar todos os detalhes do veículo.
              </p>
            </div>
          </div>

          {/* RIGHT — Sticky CTA */}
          <aside>
            <div className="sticky top-20 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Preço de venda
                </div>
                <div className="mt-1 font-display text-4xl font-medium tabular text-clean">
                  {formatBRL(vehicle.price)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Ou condições especiais com financiamento.
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-y border-border py-4 text-center">
                  <MiniStat label="Ano" value={formatYear(vehicle.yearManufacture, vehicle.yearModel)} />
                  <MiniStat label="Km" value={formatKm(vehicle.mileage)} />
                  <MiniStat label="Cor" value={vehicle.color} />
                </div>

                <div className="mt-5 space-y-2.5">
                  <WhatsappButton
                    size="lg"
                    className="w-full"
                    message={vehicleInterestMessage(vehicle)}
                  >
                    Tenho interesse no WhatsApp
                  </WhatsappButton>
                  <Button asChild size="lg" variant="outline" className="w-full">
                    <Link to="/financiamento">
                      <Banknote className="h-4 w-4" />
                      Simular financiamento
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="w-full">
                    <Link to="/venda-seu-veiculo">
                      <ArrowLeftRight className="h-4 w-4" />
                      Tenho veículo na troca
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-accent">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-[0.14em]">
                    Procedência verificada
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Todos os veículos passam por avaliação interna e têm laudo
                  cautelar disponível para consulta.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-border pt-14">
            <h2 className="font-display text-2xl font-medium text-clean">Veículos relacionados</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-carbon/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-carbon/85 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Preço</div>
            <div className="truncate font-display text-lg font-medium text-clean tabular">
              {formatBRL(vehicle.price)}
            </div>
          </div>
          <WhatsappButton
            className="shrink-0"
            message={vehicleInterestMessage(vehicle)}
          >
            WhatsApp
          </WhatsappButton>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-clean tabular">{value}</div>
    </div>
  );
}
