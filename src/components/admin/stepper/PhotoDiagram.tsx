import { cn } from "@/lib/utils";
import type { PhotoSlotKey } from "@/types";
import { Camera, Check } from "lucide-react";

/**
 * Top-view car diagram with positioned camera hotspots.
 * Coordinates are percentages relative to the SVG viewBox (0-100).
 */
export interface DiagramHotspot {
  key: PhotoSlotKey;
  label: string;
  x: number;
  y: number;
}

export const EXTERIOR_HOTSPOTS: DiagramHotspot[] = [
  { key: "front", label: "Frontal", x: 50, y: 10 },
  { key: "rear", label: "Traseira", x: 50, y: 90 },
  { key: "side_left", label: "Lateral E.", x: 14, y: 50 },
  { key: "side_right", label: "Lateral D.", x: 86, y: 50 },
  { key: "wheels", label: "Rodas", x: 28, y: 28 },
  { key: "tires", label: "Pneus", x: 72, y: 72 },
  { key: "engine", label: "Motor", x: 50, y: 24 },
  { key: "trunk", label: "Porta-malas", x: 50, y: 78 },
];

export const INTERIOR_HOTSPOTS: DiagramHotspot[] = [
  { key: "dashboard", label: "Painel", x: 50, y: 18 },
  { key: "multimedia", label: "Multimídia", x: 50, y: 32 },
  { key: "front_seats", label: "Bancos diant.", x: 50, y: 50 },
  { key: "rear_seats", label: "Bancos tras.", x: 50, y: 75 },
  { key: "interior_detail", label: "Detalhes", x: 18, y: 60 },
  { key: "keys", label: "Chave", x: 82, y: 40 },
];

function Hotspot({
  hotspot,
  filled,
  active,
  onClick,
}: {
  hotspot: DiagramHotspot;
  filled: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      className="group absolute -translate-x-1/2 -translate-y-1/2"
      aria-label={hotspot.label}
    >
      <span
        className={cn(
          "relative grid h-10 w-10 sm:h-9 sm:w-9 place-items-center rounded-full border-2 backdrop-blur-sm transition-all duration-300 active:scale-90",
          filled
            ? "border-performance bg-performance/90 text-carbon shadow-[0_0_20px_rgba(76,193,79,0.45)]"
            : active
            ? "border-performance/60 bg-carbon/90 text-performance"
            : "border-white/30 bg-carbon/70 text-clean/70 group-hover:border-performance/60 group-hover:text-performance",
        )}
      >
        {filled ? <Check className="h-4 w-4" /> : <Camera className="h-3.5 w-3.5" />}
        {active && !filled && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-performance/30" />
        )}
      </span>
      <span
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-carbon/95 px-2 py-0.5 text-[10px] font-medium tracking-wide transition-opacity",
          // Mobile: só o hotspot ativo mostra o rótulo (evita texto sobre ícones vizinhos).
          // Desktop: ativo sempre; preenchido sempre; demais no hover.
          active
            ? "opacity-100"
            : filled
            ? "opacity-0 sm:opacity-100"
            : "opacity-0 sm:group-hover:opacity-100",
          filled ? "text-performance" : "text-clean",
        )}
      >
        {hotspot.label}
      </span>
    </button>
  );
}

function CarTopView() {
  return (
    <svg viewBox="0 0 200 360" className="h-full w-full" fill="none" stroke="currentColor">
      {/* Body */}
      <rect
        x="22"
        y="14"
        width="156"
        height="332"
        rx="58"
        className="text-performance/25"
        strokeWidth="1.5"
      />
      <rect
        x="26"
        y="18"
        width="148"
        height="324"
        rx="54"
        className="text-performance/10"
        strokeWidth="0.8"
        strokeDasharray="2 4"
      />
      {/* Hood line */}
      <path d="M 38 70 Q 100 60 162 70" className="text-performance/30" strokeWidth="1" />
      {/* Windshield */}
      <path
        d="M 50 90 Q 100 78 150 90 L 150 130 Q 100 122 50 130 Z"
        className="text-performance/15"
        fill="currentColor"
        strokeWidth="0.8"
      />
      {/* Roof */}
      <rect
        x="50"
        y="130"
        width="100"
        height="100"
        className="text-performance/10"
        fill="currentColor"
        strokeWidth="0.8"
      />
      {/* Rear window */}
      <path
        d="M 50 230 Q 100 242 150 230 L 150 270 Q 100 282 50 270 Z"
        className="text-performance/15"
        fill="currentColor"
        strokeWidth="0.8"
      />
      {/* Trunk line */}
      <path d="M 38 300 Q 100 310 162 300" className="text-performance/30" strokeWidth="1" />
      {/* Wheels */}
      <rect x="14" y="78" width="14" height="34" rx="4" className="text-performance/40" strokeWidth="1" />
      <rect x="172" y="78" width="14" height="34" rx="4" className="text-performance/40" strokeWidth="1" />
      <rect x="14" y="252" width="14" height="34" rx="4" className="text-performance/40" strokeWidth="1" />
      <rect x="172" y="252" width="14" height="34" rx="4" className="text-performance/40" strokeWidth="1" />
      {/* Headlights */}
      <rect x="40" y="24" width="22" height="6" rx="2" className="text-performance/60" strokeWidth="1" />
      <rect x="138" y="24" width="22" height="6" rx="2" className="text-performance/60" strokeWidth="1" />
      {/* Taillights */}
      <rect x="40" y="332" width="22" height="6" rx="2" className="text-performance/60" strokeWidth="1" />
      <rect x="138" y="332" width="22" height="6" rx="2" className="text-performance/60" strokeWidth="1" />
    </svg>
  );
}

function InteriorView() {
  return (
    <svg viewBox="0 0 200 360" className="h-full w-full" fill="none" stroke="currentColor">
      <rect
        x="22"
        y="14"
        width="156"
        height="332"
        rx="58"
        className="text-performance/25"
        strokeWidth="1.5"
      />
      {/* Dashboard */}
      <path
        d="M 32 40 Q 100 30 168 40 L 168 80 Q 100 70 32 80 Z"
        className="text-performance/20"
        fill="currentColor"
        strokeWidth="1"
      />
      {/* Steering wheel */}
      <circle cx="70" cy="100" r="14" className="text-performance/40" strokeWidth="1.2" />
      <circle cx="70" cy="100" r="6" className="text-performance/30" strokeWidth="0.8" />
      {/* Multimedia */}
      <rect x="86" y="92" width="36" height="22" rx="3" className="text-performance/40" strokeWidth="1" />
      {/* Front seats */}
      <rect x="40" y="140" width="44" height="60" rx="10" className="text-performance/30" strokeWidth="1" />
      <rect x="116" y="140" width="44" height="60" rx="10" className="text-performance/30" strokeWidth="1" />
      {/* Console */}
      <rect x="90" y="150" width="20" height="48" rx="4" className="text-performance/25" strokeWidth="0.8" />
      {/* Rear bench */}
      <rect x="36" y="230" width="128" height="64" rx="12" className="text-performance/30" strokeWidth="1" />
      <line x1="100" y1="232" x2="100" y2="292" className="text-performance/20" strokeWidth="0.8" />
    </svg>
  );
}

export function PhotoDiagram({
  view,
  hotspots,
  filledKeys,
  activeKey,
  onSelect,
}: {
  view: "exterior" | "interior";
  hotspots: DiagramHotspot[];
  filledKeys: Set<PhotoSlotKey>;
  activeKey: PhotoSlotKey | null;
  onSelect: (key: PhotoSlotKey) => void;
}) {
  return (
    <div className="relative mx-auto aspect-[200/360] w-full max-w-[280px]">
      <div className="absolute inset-0">
        {view === "exterior" ? <CarTopView /> : <InteriorView />}
      </div>
      <div className="absolute inset-0">
        {hotspots.map((h) => (
          <Hotspot
            key={h.key}
            hotspot={h}
            filled={filledKeys.has(h.key)}
            active={activeKey === h.key}
            onClick={() => onSelect(h.key)}
          />
        ))}
      </div>
    </div>
  );
}
