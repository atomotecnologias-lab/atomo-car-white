import type { VehicleImage } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function VehicleGallery({ images, alt }: { images: VehicleImage[]; alt: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = images[activeIdx] ?? images[0];

  if (!active) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-muted sm:aspect-[16/10]">
        <span className="text-sm uppercase tracking-widest text-muted-foreground/40">Sem fotos</span>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[88px_1fr]">
      <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
        {images.slice(0, 8).map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveIdx(i)}
            className={cn(
              "relative aspect-square w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all lg:w-full",
              i === activeIdx ? "border-performance" : "border-transparent opacity-70 hover:opacity-100",
            )}
            aria-label={img.label ?? `Foto ${i + 1}`}
          >
            <img src={img.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <div className="order-1 overflow-hidden rounded-lg bg-muted lg:order-2">
        <div className="aspect-[4/3] sm:aspect-[16/10]">
          <img
            src={active.url}
            alt={alt}
            loading={activeIdx === 0 ? "eager" : "lazy"}
            fetchPriority={activeIdx === 0 ? "high" : "auto"}
            decoding="async"
            className="h-full w-full object-cover"
          />

        </div>
        {active.label && (
          <div className="border-t border-border bg-card px-4 py-2 text-xs text-muted-foreground">
            {active.label}
          </div>
        )}
      </div>
    </div>
  );
}
