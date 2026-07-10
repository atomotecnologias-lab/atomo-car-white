import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_public/financiamento")({
  head: () => ({
    meta: [
      { title: "Financiamento — ToniKar" },
      { name: "description", content: "Auxiliamos no financiamento do seu próximo veículo com as melhores condições." },
      { property: "og:title", content: "Financiamento — ToniKar" },
      { property: "og:description", content: "Trabalhamos com diversos bancos para encontrar a melhor condição." },
      { property: "og:url", content: "https://tonikar.com.br/financiamento" },
    ],
    links: [
      { rel: "canonical", href: "https://tonikar.com.br/financiamento" },
    ],
  }),
  component: FinancingPage,
});

function FinancingPage() {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-card py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Financiamento"
            title="Financiamos seu próximo veículo com agilidade."
            subtitle="Trabalhamos com diversos bancos. A aprovação depende de análise de crédito e o preenchimento deste formulário não garante a liberação."
          />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p>
            Este formulário é uma manifestação de interesse. Após o envio, nossa equipe entra em contato para coletar a documentação e simular as condições.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Recebemos seu pedido de simulação. Entraremos em contato em breve.");
          }}
          className="space-y-5 rounded-xl border border-border bg-card p-7 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome completo"><Input required /></Field>
            <Field label="Telefone"><Input required placeholder="(47) 99999-9999" /></Field>
          </div>
          <Field label="Veículo de interesse"><Input placeholder="Marca, modelo e versão" /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Valor de entrada aproximado"><Input placeholder="R$ 30.000" /></Field>
            <Field label="Possui veículo na troca?">
              <select className="hairline w-full rounded-md bg-background px-3 py-2 text-sm">
                <option>Não</option>
                <option>Sim</option>
              </select>
            </Field>
          </div>
          <Field label="Observações">
            <Textarea rows={4} placeholder="Renda, prazo desejado, observações" />
          </Field>
          <Button type="submit" size="lg">Solicitar simulação</Button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
