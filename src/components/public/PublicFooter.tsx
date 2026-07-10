import { Link } from "@tanstack/react-router";
import { mockSettings } from "@/data/mockSettings";
import { Instagram, Facebook, MapPin, Phone, Clock } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="relative border-t border-border bg-carbon text-clean">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-performance/60 to-transparent"
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-4">
            <span className="grid h-20 w-20 place-items-center rounded-2xl bg-premium ring-1 ring-white/10">
              <span className="font-display text-3xl font-bold tracking-tight text-performance">TK</span>
            </span>
            <div className="leading-tight">
              <div className="font-display text-2xl font-semibold tracking-tight">ToniKar</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-titanium">
                Gestão Automotiva
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-clean/70">
            {mockSettings.shortDescription}
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={mockSettings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition-colors hover:border-accent hover:text-accent"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={mockSettings.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition-colors hover:border-accent hover:text-accent"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
            Navegação
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-clean/80">
            <li><Link to="/estoque" className="hover:text-accent">Estoque</Link></li>
            <li><Link to="/venda-seu-veiculo" className="hover:text-accent">Venda seu veículo</Link></li>
            <li><Link to="/financiamento" className="hover:text-accent">Financiamento</Link></li>
            <li><Link to="/sobre" className="hover:text-accent">Sobre a loja</Link></li>
            <li><Link to="/contato" className="hover:text-accent">Contato</Link></li>
            <li><Link to="/politica-de-privacidade" className="hover:text-accent">Política de privacidade</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
            Contato
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-clean/80">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clean/50" />
              <span>{mockSettings.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-clean/50" />
              <span>{mockSettings.whatsappDisplay}</span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-clean/50" />
              <div>
                {mockSettings.openingHours.map((h) => (
                  <div key={h.label}>
                    <span className="text-clean/60">{h.label}: </span>
                    {h.value}
                  </div>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-clean/50 sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} ToniKar. Todos os direitos reservados.</span>
          <span>Gestão Automotiva</span>
        </div>
      </div>
    </footer>
  );
}
