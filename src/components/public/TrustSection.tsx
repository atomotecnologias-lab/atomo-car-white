import { ShieldCheck, FileCheck2, Banknote, Handshake } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Procedência Verificada",
    text: "Histórico analisado.",
  },
  {
    icon: FileCheck2,
    title: "Transparência Total",
    text: "Negociação clara.",
  },
  {
    icon: Banknote,
    title: "Condições Facilitadas",
    text: "Compra, troca e financiamento.",
  },
  {
    icon: Handshake,
    title: "Atendimento Próximo",
    text: "Humano e consultivo.",
  },
];

export function TrustSection() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-px overflow-hidden bg-border sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="bg-card p-7 sm:p-8">
              <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg font-medium text-clean">
                {it.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {it.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
