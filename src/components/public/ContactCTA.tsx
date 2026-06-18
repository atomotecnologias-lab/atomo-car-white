import { WhatsappButton } from "@/components/shared/WhatsappButton";

export function ContactCTA() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-carbon p-8 text-clean sm:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative max-w-xl">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              Atendimento direto
            </div>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight sm:text-4xl">
              Fale com a equipe Primos sobre o veículo que você procura.
            </h2>
            <p className="mt-4 font-display text-base font-light leading-relaxed tracking-tight text-clean/75">
              Respondemos no WhatsApp em horário comercial e ajudamos com
              troca, financiamento e agendamento de visita.
            </p>
            <div className="mt-7">
              <WhatsappButton size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Falar no WhatsApp
              </WhatsappButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

