import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export const Route = createFileRoute("/_public/venda-seu-veiculo")({
  head: () => ({
    meta: [
      { title: "Venda seu veículo — Atomo Car" },
      { name: "description", content: "Avaliação rápida do seu veículo para venda ou troca em Jaraguá do Sul." },
      { property: "og:title", content: "Venda seu veículo — Atomo Car" },
      { property: "og:description", content: "Compra à vista ou troca pelo veículo dos seus sonhos." },
      { property: "og:url", content: "https://atomocar.com.br/venda-seu-veiculo" },
    ],
    links: [
      { rel: "canonical", href: "https://atomocar.com.br/venda-seu-veiculo" },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Venda ou troca"
            title="Quer vender seu veículo para a Atomo Car?"
            subtitle="Preencha os dados abaixo. Nossa equipe entra em contato para avaliação."
            align="center"
          />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Recebemos seu cadastro — entraremos em contato em breve.");
          }}
          className="space-y-5 rounded-xl border border-border bg-card p-7 sm:p-8"
        >
          <Row>
            <Field label="Nome completo"><Input required placeholder="Seu nome" /></Field>
            <Field label="Telefone"><Input required placeholder="(47) 99999-9999" /></Field>
          </Row>
          <Row>
            <Field label="Marca"><Input required placeholder="Ex.: Honda" /></Field>
            <Field label="Modelo"><Input required placeholder="Ex.: Civic" /></Field>
          </Row>
          <Row>
            <Field label="Ano"><Input required placeholder="2020" /></Field>
            <Field label="Quilometragem"><Input required placeholder="45.000 km" /></Field>
          </Row>
          <Field label="Estado geral">
            <RadioGroup defaultValue="bom" className="flex flex-wrap gap-3">
              {["Excelente", "Bom", "Regular"].map((v) => (
                <label key={v} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm">
                  <RadioGroupItem value={v.toLowerCase()} /> {v}
                </label>
              ))}
            </RadioGroup>
          </Field>
          <Field label="Observações">
            <Textarea rows={4} placeholder="Itens, histórico, observações relevantes" />
          </Field>
          <Field label="Sua preferência">
            <RadioGroup defaultValue="vender" className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm">
                <RadioGroupItem value="vender" /> Vender
              </label>
              <label className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm">
                <RadioGroupItem value="trocar" /> Trocar por outro veículo
              </label>
            </RadioGroup>
          </Field>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" size="lg">Enviar para avaliação</Button>
            <WhatsappButton size="lg" variant="outline">Prefiro WhatsApp</WhatsappButton>
          </div>
          <p className="text-xs text-muted-foreground">
            Ao enviar, você concorda com nossa política de privacidade. Seus dados serão usados apenas para contato comercial.
          </p>
        </form>
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
