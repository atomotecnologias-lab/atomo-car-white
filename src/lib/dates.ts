import type { SeriesFrequency } from "@/types/finance";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Último dia do mês (1-based month). */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Soma `n` intervalos a uma data ISO (yyyy-mm-dd), retornando ISO.
 * Mensal/anual fazem clamp do dia ao fim do mês (31/jan + 1 mês → 28/fev).
 * Semanal soma 7*n dias.
 */
export function addInterval(iso: string, frequency: SeriesFrequency, n: number): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);

  if (frequency === "weekly") {
    const base = new Date(Date.UTC(y, m - 1, d));
    base.setUTCDate(base.getUTCDate() + 7 * n);
    return `${base.getUTCFullYear()}-${pad(base.getUTCMonth() + 1)}-${pad(base.getUTCDate())}`;
  }

  const monthsToAdd = frequency === "yearly" ? 12 * n : n;
  const totalMonthIndex = (y * 12 + (m - 1)) + monthsToAdd;
  const year = Math.floor(totalMonthIndex / 12);
  const month = (totalMonthIndex % 12) + 1; // 1-based
  const day = Math.min(d, daysInMonth(year, month));
  return `${year}-${pad(month)}-${pad(day)}`;
}
