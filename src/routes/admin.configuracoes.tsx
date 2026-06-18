import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { mockSettings } from "@/data/mockSettings";
import { MapPin, Phone, Instagram, Facebook, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/configuracoes")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <AdminTopbar title="Configurações" subtitle="Dados da revenda exibidos no site público." />
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <Card title="Identidade">
          <Field label="Nome" value={mockSettings.name} />
          <Field label="Descrição curta" value={mockSettings.shortDescription} />
        </Card>

        <Card title="Contato e localização">
          <Field icon={MapPin} label="Endereço" value={mockSettings.address} />
          <Field icon={Phone} label="WhatsApp" value={mockSettings.whatsappDisplay} />
          <Field icon={Instagram} label="Instagram" value={mockSettings.instagram} />
          <Field icon={Facebook} label="Facebook" value={mockSettings.facebook} />
        </Card>

        <Card title="Horários">
          {mockSettings.openingHours.map((h) => (
            <Field key={h.label} icon={Clock} label={h.label} value={h.value} />
          ))}
        </Card>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-premium">
      <header className="border-b border-white/[0.06] px-6 py-4">
        <h3 className="font-display text-sm font-semibold text-clean">{title}</h3>
      </header>
      <div className="divide-y divide-white/[0.04]">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof MapPin;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5">
      {Icon && (
        <span className="grid h-8 w-8 place-items-center rounded-md bg-white/[0.04] text-titanium">
          <Icon className="h-3.5 w-3.5" />
        </span>
      )}
      <div className="flex-1">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-titanium">{label}</div>
        <div className="mt-0.5 text-sm text-clean">{value}</div>
      </div>
    </div>
  );
}
