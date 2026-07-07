import { describe, expect, it } from "vitest";
import { addInterval } from "../dates";
import { splitTotal } from "@/services/financeService";

describe("splitTotal", () => {
  it("divide exato quando não há resto", () => {
    const parts = splitTotal(6000, 6);
    expect(parts).toEqual([1000, 1000, 1000, 1000, 1000, 1000]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(6000);
  });

  it("joga o resto do arredondamento na última parcela (soma == total)", () => {
    const parts = splitTotal(100, 3);
    expect(parts).toEqual([33.33, 33.33, 33.34]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("mantém soma exata em valores quebrados", () => {
    const total = 12345.67;
    const parts = splitTotal(total, 7);
    expect(parts.reduce((a, b) => a + b, 0)).toBeCloseTo(total, 2);
    expect(parts).toHaveLength(7);
  });
});

describe("addInterval", () => {
  it("mensal soma meses", () => {
    expect(addInterval("2026-08-10", "monthly", 0)).toBe("2026-08-10");
    expect(addInterval("2026-08-10", "monthly", 1)).toBe("2026-09-10");
    expect(addInterval("2026-08-10", "monthly", 5)).toBe("2027-01-10");
  });

  it("mensal faz clamp de fim de mês (31 jan + 1 mês → 28 fev)", () => {
    expect(addInterval("2026-01-31", "monthly", 1)).toBe("2026-02-28");
    expect(addInterval("2026-01-31", "monthly", 3)).toBe("2026-04-30");
  });

  it("semanal soma 7 dias", () => {
    expect(addInterval("2026-08-10", "weekly", 2)).toBe("2026-08-24");
  });

  it("anual soma anos com clamp em bissexto", () => {
    expect(addInterval("2026-03-15", "yearly", 1)).toBe("2027-03-15");
    expect(addInterval("2028-02-29", "yearly", 1)).toBe("2029-02-28");
  });
});
