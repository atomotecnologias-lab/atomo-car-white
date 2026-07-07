import { Camera, Eye } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { PHOTO_SLOTS } from "@/data/photoSlots";
import { SummaryStat } from "./fields";
import type { FormState } from "./types";

export function ReviewStep({ form }: { form: FormState }) {
  const filledCount = Object.keys(form.photos).length;
  const mainUrl = form.mainPhotoKey ? form.photos[form.mainPhotoKey] : undefined;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
        <div className="aspect-video overflow-hidden rounded-xl border border-border bg-carbon">
          {mainUrl ? (
            <img src={mainUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-titanium">
              <Camera className="h-8 w-8" />
            </div>
          )}
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-performance">
            {form.brand || "—"}
          </div>
          <h3 className="mt-1 font-display text-2xl font-semibold text-clean">
            {form.model || "Modelo"} <span className="text-titanium">{form.version}</span>
          </h3>
          <p className="mt-1 text-sm text-titanium">
            {form.yearManufacture}/{form.yearModel} ·{" "}
            {form.mileage ? `${Number(form.mileage).toLocaleString("pt-BR")} km` : "— km"} ·{" "}
            {form.color || "—"}
          </p>
          <div className="mt-3 font-display text-3xl font-semibold text-performance tabular">
            {form.price ? formatBRL(Number(form.price)) : "R$ —"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryStat label="Fotos" value={`${filledCount}/${PHOTO_SLOTS.length}`} />
        <SummaryStat label="Opcionais" value={String(form.features.length)} />
        <SummaryStat
          label="Status"
          value={
            form.status === "active"
              ? "Publicar"
              : form.status === "awaiting_photos"
              ? "Aguardando"
              : "Rascunho"
          }
        />
        <SummaryStat label="Destaque" value={form.isFeatured ? "Sim" : "Não"} />
      </div>

      {form.descriptionShort && (
        <div className="rounded-xl border border-border bg-carbon p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-titanium">
            <Eye className="h-3 w-3" /> Pré-visualização do card
          </div>
          <p className="text-sm text-clean">{form.descriptionShort}</p>
        </div>
      )}

      {form.descriptionFull && (
        <div className="rounded-xl border border-border bg-carbon p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-titanium">
            <Eye className="h-3 w-3" /> Descrição do anúncio
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-clean/90">{form.descriptionFull}</p>
        </div>
      )}
    </div>
  );
}
