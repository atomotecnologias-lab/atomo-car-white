import type { Vehicle } from "@/types/vehicle";

export type AgingTone = "healthy" | "attention" | "warning" | "critical";

/**
 * Dias em estoque REAIS: hoje − coalesce(acquired_at, created_at).
 * Substitui os valores sintéticos usados no dashboard antigo.
 */
export function daysInStock(vehicle: Pick<Vehicle, "acquiredAt" | "createdAt">, now = new Date()): number {
  const baseIso = vehicle.acquiredAt ?? vehicle.createdAt.slice(0, 10);
  const base = new Date(`${baseIso.slice(0, 10)}T00:00:00`);
  const diff = now.getTime() - base.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

/** Faixas: 0–30 verde · 31–60 âmbar · 61–90 laranja · >90 vermelho. */
export function agingTone(days: number): AgingTone {
  if (days <= 30) return "healthy";
  if (days <= 60) return "attention";
  if (days <= 90) return "warning";
  return "critical";
}

export function agingLabel(days: number): string {
  return days === 1 ? "1 dia" : `${days} dias`;
}
