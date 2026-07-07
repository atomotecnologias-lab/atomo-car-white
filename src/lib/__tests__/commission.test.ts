import { describe, expect, it } from "vitest";
import { calculateCommission, computeSaleProfit, roundCents } from "../commission";
import type { CommissionConfig } from "@/types/sale";

const cfg = (type: CommissionConfig["type"], base: CommissionConfig["base"], value: number): CommissionConfig => ({
  type,
  base,
  value,
});

describe("calculateCommission", () => {
  it("percent sobre venda", () => {
    expect(
      calculateCommission({ salePrice: 50000, grossProfit: 6000, config: cfg("percent", "sale", 1) }),
    ).toBe(500);
  });

  it("percent sobre lucro", () => {
    expect(
      calculateCommission({ salePrice: 50000, grossProfit: 6000, config: cfg("percent", "profit", 5) }),
    ).toBe(300);
  });

  it("percent sobre lucro NEGATIVO ⇒ comissão zero", () => {
    expect(
      calculateCommission({ salePrice: 40000, grossProfit: -2500, config: cfg("percent", "profit", 5) }),
    ).toBe(0);
  });

  it("fixo ignora a base — sobre venda", () => {
    expect(
      calculateCommission({ salePrice: 90000, grossProfit: 9000, config: cfg("fixed", "sale", 500) }),
    ).toBe(500);
  });

  it("fixo ignora a base — sobre lucro (mesmo negativo)", () => {
    expect(
      calculateCommission({ salePrice: 90000, grossProfit: -1000, config: cfg("fixed", "profit", 500) }),
    ).toBe(500);
  });

  it("arredonda half-up para centavos", () => {
    // 33333 × 0.075% = 24.99975 → 25.00
    expect(
      calculateCommission({ salePrice: 33333, grossProfit: 0, config: cfg("percent", "sale", 0.075) }),
    ).toBe(25);
    // 5% de 3450 = 172.50 exato (caso do seed)
    expect(
      calculateCommission({ salePrice: 21900, grossProfit: 3450, config: cfg("percent", "profit", 5) }),
    ).toBe(172.5);
  });
});

describe("computeSaleProfit", () => {
  it("calcula bruto, comissão e líquido em cadeia", () => {
    const r = computeSaleProfit({
      salePrice: 52900,
      acquisitionPrice: 44000,
      costsTotal: 1800,
      config: cfg("percent", "profit", 5),
      hasSeller: true,
    });
    expect(r.grossProfit).toBe(7100);
    expect(r.commissionAmount).toBe(355);
    expect(r.netProfit).toBe(6745);
  });

  it("sem vendedor ⇒ comissão zero e líquido = bruto", () => {
    const r = computeSaleProfit({
      salePrice: 52900,
      acquisitionPrice: 44000,
      costsTotal: 1800,
      config: cfg("percent", "profit", 5),
      hasSeller: false,
    });
    expect(r.commissionAmount).toBe(0);
    expect(r.netProfit).toBe(r.grossProfit);
  });

  it("venda com prejuízo: bruto negativo, comissão 0 (percent/profit), líquido = bruto", () => {
    const r = computeSaleProfit({
      salePrice: 30000,
      acquisitionPrice: 32000,
      costsTotal: 1500,
      config: cfg("percent", "profit", 5),
      hasSeller: true,
    });
    expect(r.grossProfit).toBe(-3500);
    expect(r.commissionAmount).toBe(0);
    expect(r.netProfit).toBe(-3500);
  });
});

describe("roundCents", () => {
  it("meio centavo sobe", () => {
    expect(roundCents(10.005)).toBe(10.01);
    expect(roundCents(10.004)).toBe(10);
  });
});
