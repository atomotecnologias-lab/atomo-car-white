import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  History,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Tag,
  Trash2,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { listActivity } from "@/services/auditService";
import type { AuditAction } from "@/types/audit";

const ACTION_META: Record<AuditAction, { icon: typeof Plus; cls: string }> = {
  create: { icon: Plus, cls: "bg-success/10 text-success" },
  update: { icon: Pencil, cls: "bg-info/10 text-info" },
  delete: { icon: Trash2, cls: "bg-destructive/10 text-destructive" },
  pay: { icon: CheckCircle2, cls: "bg-success/10 text-success" },
  unpay: { icon: RotateCcw, cls: "bg-muted text-muted-foreground" },
  undo: { icon: Undo2, cls: "bg-warning/10 text-warning" },
  status: { icon: Tag, cls: "bg-muted text-muted-foreground" },
};

/** Timestamp ISO → "há 5 min" / "há 2 h" / "ontem" / "12/07 14:30". */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH} h`;
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${min}`;
}

export function ActivityFeed({
  vehicleId,
  limit,
  emptyHint,
}: {
  vehicleId?: string;
  limit?: number;
  emptyHint?: string;
}) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["activity", vehicleId ?? "all", limit ?? 50],
    queryFn: () => listActivity({ vehicleId, limit }),
  });

  if (isLoading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card py-16 text-center">
        <History className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          {emptyHint ?? "Nenhuma atividade registrada ainda."}
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <ul className="divide-y divide-border">
        {data.map((a) => {
          const meta = ACTION_META[a.action] ?? ACTION_META.update;
          const Icon = meta.icon;
          return (
            <li key={a.id} className="flex items-start gap-3 px-5 py-3">
              <span
                className={cn(
                  "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                  meta.cls,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{a.summary}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground/70">{a.actorName}</span> ·{" "}
                  {relativeTime(a.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
