import { useMemo, useState } from "react";
import { Camera, Sparkles, Star, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  PhotoDiagram,
  EXTERIOR_HOTSPOTS,
  INTERIOR_HOTSPOTS,
} from "@/components/admin/stepper/PhotoDiagram";
import { PHOTO_SLOTS } from "@/data/photoSlots";
import type { PhotoSlotKey } from "@/types";
import type { StepProps } from "./types";

export function PhotosStep({ form, set }: StepProps) {
  const [view, setView] = useState<"exterior" | "interior">("exterior");
  const [activeSlot, setActiveSlot] = useState<PhotoSlotKey | null>(null);

  const filledKeys = useMemo(
    () => new Set(Object.keys(form.photos) as PhotoSlotKey[]),
    [form.photos],
  );

  const requiredSlots = PHOTO_SLOTS.filter((s) => s.group === "required");
  const filledRequired = requiredSlots.filter((s) => filledKeys.has(s.key)).length;

  const handleFiles = (slot: PhotoSlotKey, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    set("photos", { ...form.photos, [slot]: url });
    set("photoFiles", { ...form.photoFiles, [slot]: file });
    if (!form.mainPhotoKey) set("mainPhotoKey", slot);
    setActiveSlot(null);
  };

  const removeSlot = (slot: PhotoSlotKey) => {
    const { [slot]: _removedUrl, ...restPhotos } = form.photos;
    const { [slot]: _removedFile, ...restFiles } = form.photoFiles;
    set("photos", restPhotos);
    set("photoFiles", restFiles);
    if (form.mainPhotoKey === slot) {
      const firstKey = Object.keys(restPhotos)[0] as PhotoSlotKey | undefined;
      set("mainPhotoKey", firstKey ?? "");
    }
  };

  const mockFill = (slot: PhotoSlotKey) => {
    const placeholder = `https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80&sig=${slot}`;
    set("photos", { ...form.photos, [slot]: placeholder });
    if (!form.mainPhotoKey) set("mainPhotoKey", slot);
    setActiveSlot(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-border bg-muted p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="inline-flex rounded-lg border border-border bg-premium p-0.5">
            {(["exterior", "interior"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  view === v ? "bg-performance/15 text-performance" : "text-titanium hover:text-clean",
                )}
              >
                {v === "exterior" ? "Exterior" : "Interior"}
              </button>
            ))}
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-titanium">
            Toque para fotografar
          </span>
        </div>

        <PhotoDiagram
          view={view}
          hotspots={view === "exterior" ? EXTERIOR_HOTSPOTS : INTERIOR_HOTSPOTS}
          filledKeys={filledKeys}
          activeKey={activeSlot}
          onSelect={(k) => setActiveSlot((s) => (s === k ? null : k))}
        />

        <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-carbon px-4 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-titanium">
              Cobertura obrigatória
            </div>
            <div className="mt-1 font-display text-lg text-clean tabular">
              {filledRequired}
              <span className="text-titanium">/{requiredSlots.length}</span>
            </div>
          </div>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-performance to-racing transition-all"
              style={{ width: `${(filledRequired / requiredSlots.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {activeSlot ? (
          <ActiveSlotPanel
            slot={activeSlot}
            currentUrl={form.photos[activeSlot]}
            isMain={form.mainPhotoKey === activeSlot}
            onUpload={(files) => handleFiles(activeSlot, files)}
            onMockFill={() => mockFill(activeSlot)}
            onRemove={() => removeSlot(activeSlot)}
            onSetMain={() => set("mainPhotoKey", activeSlot)}
            onClose={() => setActiveSlot(null)}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-input bg-premium/50 p-6 text-center">
            <Camera className="mx-auto h-6 w-6 text-titanium" />
            <p className="mt-3 text-sm text-clean">Selecione uma posição no diagrama</p>
            <p className="mt-1 text-xs text-titanium">
              Cada hotspot representa uma foto recomendada para o anúncio.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-premium p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-titanium">
              Todas as posições
            </span>
            <span className="text-xs text-titanium tabular">
              {Object.keys(form.photos).length}/{PHOTO_SLOTS.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {PHOTO_SLOTS.map((slot) => {
              const url = form.photos[slot.key];
              const isMain = form.mainPhotoKey === slot.key;
              return (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => setActiveSlot(slot.key)}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-lg border bg-carbon text-left transition-all",
                    url
                      ? "border-performance/30"
                      : slot.group === "required"
                      ? "border-white/10 border-dashed"
                      : "border-border border-dashed",
                    activeSlot === slot.key && "ring-2 ring-performance/60",
                  )}
                >
                  {url ? (
                    <>
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      {isMain && (
                        <span className="absolute right-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-performance/95 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wider text-carbon">
                          <Star className="h-2.5 w-2.5 fill-carbon" /> Capa
                        </span>
                      )}
                      <span className="absolute inset-x-1 bottom-1 truncate text-[10px] font-medium text-clean">
                        {slot.label}
                      </span>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 px-1">
                      <Camera className="h-4 w-4 text-titanium/60" />
                      <span className="w-full truncate text-center text-[9px] font-medium leading-tight text-titanium">
                        {slot.label}
                      </span>
                    </div>
                  )}
                  {slot.group === "required" && !url && (
                    <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-warning" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveSlotPanel({
  slot,
  currentUrl,
  isMain,
  onUpload,
  onMockFill,
  onRemove,
  onSetMain,
  onClose,
}: {
  slot: PhotoSlotKey;
  currentUrl?: string;
  isMain: boolean;
  onUpload: (files: FileList | null) => void;
  onMockFill: () => void;
  onRemove: () => void;
  onSetMain: () => void;
  onClose: () => void;
}) {
  const def = PHOTO_SLOTS.find((s) => s.key === slot)!;
  return (
    <div className="rounded-2xl border border-performance/20 bg-premium p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-performance">
            {def.group === "required" ? "Obrigatória" : def.group === "recommended" ? "Recomendada" : "Opcional"}
          </div>
          <h3 className="mt-1 font-display text-lg font-semibold text-clean">{def.label}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar painel da posição"
          className="grid h-7 w-7 place-items-center rounded-md text-titanium hover:bg-muted hover:text-clean"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-border bg-carbon">
        {currentUrl ? (
          <img src={currentUrl} alt={def.label} className="h-full w-full object-cover" />
        ) : (
          <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 text-titanium transition-colors hover:bg-muted hover:text-clean">
            <Upload className="h-6 w-6" />
            <span className="text-sm">Clique para enviar a foto</span>
            <span className="text-[10px] uppercase tracking-[0.18em]">JPG · PNG até 8 MB</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
            />
          </label>
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
        {currentUrl ? (
          <>
            {!isMain && (
              <Button
                type="button"
                onClick={onSetMain}
                className="h-11 w-full justify-center sm:h-auto sm:w-auto bg-muted text-clean hover:bg-muted"
              >
                <Star className="h-3.5 w-3.5" /> Definir como capa
              </Button>
            )}
            <label className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-input px-3 py-2 text-xs text-clean/80 hover:text-clean sm:h-auto sm:w-auto sm:justify-start">
              <Upload className="h-3.5 w-3.5" />
              Substituir
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUpload(e.target.files)}
              />
            </label>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 sm:ml-auto sm:h-auto sm:w-auto"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remover
            </button>
          </>
        ) : (
          <Button
            type="button"
            onClick={onMockFill}
            className="h-11 w-full justify-center sm:h-auto sm:w-auto bg-performance/15 text-performance hover:bg-performance/25"
          >
            <Sparkles className="h-3.5 w-3.5" /> Usar foto demo
          </Button>
        )}
      </div>
    </div>
  );
}
