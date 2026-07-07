import type { CommissionConfig } from "@/types/sale";

/**
 * Arredondamento half-up para centavos.
 * O toFixed(4) intermediário corrige o ruído de ponto flutuante
 * (ex.: 10.005 × 100 = 1000.4999…) antes do round.
 */
export function roundCents(value: number): number {
  return Math.round(Number((value * 100).toFixed(4))) / 100;
}

export interface CommissionInput {
  salePrice: number;
  /** Lucro bruto = venda − aquisição − custos. Pode ser negativo. */
  grossProfit: number;
  config: CommissionConfig;
}

/**
 * Regras (docs no plano):
 * - percent × sale:   round(salePrice × value/100)
 * - percent × profit: round(max(grossProfit, 0) × value/100) — prejuízo ⇒ comissão 0
 * - fixed (qualquer base): valor fixo
 * - Venda sem vendedor: quem chama passa comissão 0 (não é decidido aqui).
 */
export function calculateCommission({ salePrice, grossProfit, config }: CommissionInput): number {
  if (config.type === "fixed") {
    return roundCents(config.value);
  }
  const base = config.base === "sale" ? salePrice : Math.max(grossProfit, 0);
  return roundCents((base * config.value) / 100);
}

export interface ProfitBreakdown {
  acquisitionPrice: number;
  costsTotal: number;
  salePrice: number;
  grossProfit: number;
  commissionAmount: number;
  netProfit: number;
}

/** Consolida o cálculo completo da venda (lucros + comissão). */
export function computeSaleProfit(params: {
  salePrice: number;
  acquisitionPrice: number;
  costsTotal: number;
  config: CommissionConfig;
  hasSeller: boolean;
}): ProfitBreakdown {
  const { salePrice, acquisitionPrice, costsTotal, config, hasSeller } = params;
  const grossProfit = roundCents(salePrice - acquisitionPrice - costsTotal);
  const commissionAmount = hasSeller
    ? calculateCommission({ salePrice, grossProfit, config })
    : 0;
  return {
    acquisitionPrice,
    costsTotal,
    salePrice,
    grossProfit,
    commissionAmount,
    netProfit: roundCents(grossProfit - commissionAmount),
  };
}
