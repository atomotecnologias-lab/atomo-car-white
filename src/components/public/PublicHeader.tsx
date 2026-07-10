import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { mockSettings } from "@/data/mockSettings";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/", label: "Início", group: "buy" },
  { to: "/estoque", label: "Estoque", group: "buy" },
  { to: "/venda-seu-veiculo", label: "Venda seu veículo", group: "service" },
  { to: "/financiamento", label: "Financiamento", group: "service" },
  { to: "/sobre", label: "Sobre", group: "inst" },
  { to: "/contato", label: "Contato", group: "inst" },
] as const;

export function PublicHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-500",
        scrolled
          ? "border-b border-border bg-carbon/85 backdrop-blur-xl supports-[backdrop-filter]:bg-carbon/70"
          : "border-b border-transparent bg-transparent",
      )}
    >
      {scrolled && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-performance/50 to-transparent"
        />
      )}

      <div
        className={cn(
          "mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-4 transition-all duration-500 sm:px-6 lg:px-8",
          scrolled ? "h-16" : "h-20",
        )}
      >
        {/* LEFT — empty on desktop, hamburger on mobile */}
        <div className="flex items-center lg:justify-start">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-clean lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="public-mobile-nav"
          >
            {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
          </button>
        </div>

        {/* CENTER — main nav */}
        <nav className="hidden items-center justify-center lg:flex">
          {nav.map((item, idx) => {
            const active = pathname === item.to;
            const prev = nav[idx - 1];
            const groupChanged = prev && prev.group !== item.group;
            return (
              <div key={item.to} className="flex items-center">
                {groupChanged && (
                  <span
                    aria-hidden
                    className="mx-3 h-3 w-px bg-white/10"
                  />
                )}
                <Link
                  to={item.to}
                  className={cn(
                    "group/link relative px-3 py-2 font-display text-[13px] font-medium tracking-[0.02em] transition-colors duration-300",
                    active ? "text-clean" : "text-titanium hover:text-clean",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "pointer-events-none absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-performance transition-all duration-500",
                      active
                        ? "w-[calc(100%-1.5rem)]"
                        : "w-0 group-hover/link:w-[calc(100%-1.5rem)]",
                    )}
                  />
                </Link>
              </div>
            );
          })}
        </nav>

        {/* spacer for mobile center column */}
        <div className="lg:hidden" />

        {/* RIGHT — WhatsApp CTA */}
        <div className="flex items-center justify-end">
          <WhatsappButton
            size="sm"
            className="group/cta relative bg-performance text-clean shadow-[0_0_0_0_color-mix(in_oklab,var(--color-performance)_60%,transparent)] transition-all duration-500 hover:bg-racing hover:shadow-[0_0_28px_-4px_color-mix(in_oklab,var(--color-performance)_60%,transparent)]"
          >
            <span className="hidden sm:inline">{mockSettings.whatsappDisplay}</span>
            <span className="sm:hidden">WhatsApp</span>
          </WhatsappButton>
        </div>
      </div>

      {open && (
        <div id="public-mobile-nav" className="border-t border-border bg-carbon lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {nav.map((item, idx) => {
              const prev = nav[idx - 1];
              const groupChanged = prev && prev.group !== item.group;
              return (
                <div key={item.to}>
                  {groupChanged && <div className="my-2 h-px bg-white/10" />}
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2.5 font-display text-base text-clean/90 hover:bg-premium"
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
            <div className="mt-3">
              <WhatsappButton className="w-full bg-performance text-clean hover:bg-racing">
                {mockSettings.whatsappDisplay}
              </WhatsappButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
