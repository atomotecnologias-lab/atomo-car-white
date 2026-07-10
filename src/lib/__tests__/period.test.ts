import { describe, expect, it } from "vitest";
import { inPeriod, periodBounds } from "../period";

// Referência fixa: 15 de julho de 2026
const NOW = new Date(2026, 6, 15);

describe("period", () => {
  it("calcula limites do mês atual", () => {
    expect(periodBounds("this_month", NOW)).toEqual({
      start: "2026-07-01",
      end: "2026-07-31",
    });
  });

  it("calcula últimos 3 meses (mês atual + 2 anteriores)", () => {
    expect(periodBounds("last_3m", NOW)).toEqual({
      start: "2026-05-01",
      end: "2026-07-31",
    });
  });

  it("calcula o ano corrente", () => {
    expect(periodBounds("this_year", NOW)).toEqual({
      start: "2026-01-01",
      end: "2026-12-31",
    });
  });

  it("all não tem limites", () => {
    expect(periodBounds("all", NOW)).toEqual({ start: null, end: null });
  });

  it("inPeriod filtra corretamente", () => {
    expect(inPeriod("2026-07-10", "this_month", NOW)).toBe(true);
    expect(inPeriod("2026-06-30", "this_month", NOW)).toBe(false);
    expect(inPeriod("2026-05-01", "last_3m", NOW)).toBe(true);
    expect(inPeriod("2026-04-30", "last_3m", NOW)).toBe(false);
    expect(inPeriod("2026-01-01", "this_year", NOW)).toBe(true);
    expect(inPeriod("2025-12-31", "this_year", NOW)).toBe(false);
    expect(inPeriod("1999-01-01", "all", NOW)).toBe(true);
  });

  it("sem data só passa em all", () => {
    expect(inPeriod(null, "all", NOW)).toBe(true);
    expect(inPeriod(null, "this_month", NOW)).toBe(false);
    expect(inPeriod(undefined, "this_year", NOW)).toBe(false);
  });
});
