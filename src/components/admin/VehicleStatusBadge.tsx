import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";
import type { VehicleStatus } from "@/types";

const map: Record<VehicleStatus, string> = {
  draft: "bg-titanium/15 text-titanium border-titanium/30",
  awaiting_photos: "bg-warning/15 text-warning border-warning/30",
  active: "bg-performance/15 text-performance border-performance/30",
  reserved: "bg-info/15 text-info border-info/30",
  sold: "bg-white/10 text-clean/70 border-white/15",
  inactive: "bg-destructive/15 text-destructive border-destructive/30",
};

export function VehicleStatusBadge({ status, className }: { status: VehicleStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
        map[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  );
}
