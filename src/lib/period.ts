/**
 * Filtro de período reutilizável nas telas operacionais (vendas, contas, comissões).
 * Trabalha com datas ISO (yyyy-mm-dd) e comparação de string — sem surpresas de fuso.
 */

export type ListPeriod = "this_month" | "last_3m" | "this_year" | "all";

export const LIST_PERIODS: { key: ListPeriod; label: string }[] = [
  { key: "this_month", label: "Este mês" },
  { key: "last_3m", label: "Últimos 3 meses" },
  { key: "this_year", label: "Este ano" },
  { key: "all", label: "Todo o período" },
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Monta uma data ISO normalizando estouro de mês (isoDay(2025, -1, 1) → dez/2024). */
function isoDay(year: number, monthIndex: number, day: number): string {
  const d = new Date(year, monthIndex, day);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Limites inclusivos do período em ISO; null = sem limite naquele lado. */
export function periodBounds(
  period: ListPeriod,
  now: Date = new Date(),
): { start: string | null; end: string | null } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const endOfThisMonth = isoDay(y, m + 1, 0); // dia 0 do próximo mês = último dia deste mês
  switch (period) {
    case "this_month":
      return { start: isoDay(y, m, 1), end: endOfThisMonth };
    case "last_3m":
      return { start: isoDay(y, m - 2, 1), end: endOfThisMonth };
    case "this_year":
      return { start: isoDay(y, 0, 1), end: isoDay(y, 11, 31) };
    case "all":
    default:
      return { start: null, end: null };
  }
}

/** true se a data ISO cai dentro do período. Sem data → só passa quando period = "all". */
export function inPeriod(
  iso: string | null | undefined,
  period: ListPeriod,
  now: Date = new Date(),
): boolean {
  if (period === "all") return true;
  if (!iso) return false;
  const day = iso.slice(0, 10);
  const { start, end } = periodBounds(period, now);
  if (start && day < start) return false;
  if (end && day > end) return false;
  return true;
}
