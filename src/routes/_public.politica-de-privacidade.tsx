import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/shared/SectionHeading";

export const Route = createFileRoute("/_public/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Primos Automóveis" },
      { name: "description", content: "Como tratamos seus dados na Primos Automóveis." },
      { property: "og:url", content: "https://primo-auto-pro.lovable.app/politica-de-privacidade" },
    ],
    links: [
      { rel: "canonical", href: "https://primo-auto-pro.lovable.app/politica-de-privacidade" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Privacidade" title="Política de privacidade" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-14 text-sm leading-relaxed text-foreground/85 sm:px-6 lg:px-8">
        <p>
          Os dados informados em qualquer formulário deste site (nome, telefone,
          veículo de interesse, mensagens) são utilizados exclusivamente para
          contato comercial, atendimento e retorno sobre veículos de interesse.
        </p>
        <p>
          Não comercializamos seus dados com terceiros. Você pode solicitar a
          exclusão dos seus dados a qualquer momento entrando em contato pelo
          WhatsApp da loja.
        </p>
        <p>
          Em conformidade com a LGPD (Lei Geral de Proteção de Dados), tratamos
          suas informações com confidencialidade e segurança.
        </p>
      </div>
    </div>
  );
}
