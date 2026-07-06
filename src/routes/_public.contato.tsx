import { createFileRoute } from "@tanstack/react-router";
import { mockSettings } from "@/data/mockSettings";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Instagram, Facebook, MapPin, Clock, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_public/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Atomo Car" },
      { name: "description", content: "Endereço, WhatsApp e horários da Atomo Car." },
      { property: "og:title", content: "Contato — Atomo Car" },
      { property: "og:description", content: "Fale com a Atomo Car." },
      { property: "og:url", content: "https://atomocar.com.br/contato" },
    ],
    links: [
      { rel: "canonical", href: "https://atomocar.com.br/contato" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Contato"
            title="Estamos prontos para falar com você."
            subtitle="Atendimento humano, presencial ou pelo WhatsApp."
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-5">
          <InfoBlock icon={<MapPin className="h-4 w-4" />} title="Endereço" body={mockSettings.address} />
          <InfoBlock
            icon={<Clock className="h-4 w-4" />}
            title="Horário de atendimento"
            body={
              <div className="space-y-1">
                {mockSettings.openingHours.map((h) => (
                  <div key={h.label}>
                    <span className="text-muted-foreground">{h.label}: </span>
                    <span className="text-clean">{h.value}</span>
                  </div>
                ))}
              </div>
            }
          />
          <InfoBlock
            icon={<Instagram className="h-4 w-4" />}
            title="Instagram"
            body={<a href={mockSettings.instagram} className="inline-flex items-center gap-1 text-clean hover:text-accent">@atomocar <ExternalLink className="h-3 w-3" /></a>}
          />
          <InfoBlock
            icon={<Facebook className="h-4 w-4" />}
            title="Facebook"
            body={<a href={mockSettings.facebook} className="inline-flex items-center gap-1 text-clean hover:text-accent">Atomo Car <ExternalLink className="h-3 w-3" /></a>}
          />

          <div className="rounded-xl border border-border bg-carbon p-6 text-clean">
            <div className="text-[11px] uppercase tracking-[0.18em] text-accent">WhatsApp</div>
            <div className="mt-2 font-display text-2xl">{mockSettings.whatsappDisplay}</div>
            <div className="mt-4">
              <WhatsappButton className="bg-accent text-accent-foreground hover:bg-accent/90">
                Iniciar conversa
              </WhatsappButton>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <div className="aspect-square sm:aspect-[4/5]">
              <iframe
                title="Mapa Atomo Car — localização"
                src={mockSettings.googleMapsEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
          <a
            href={mockSettings.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-clean/70 hover:text-accent"
          >
            Abrir no Google Maps <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon, title, body }: { icon: React.ReactNode; title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-accent">{icon}<span className="text-[11px] font-medium uppercase tracking-[0.16em]">{title}</span></div>
      <div className="mt-2 text-sm text-foreground">{body}</div>
    </div>
  );
}
