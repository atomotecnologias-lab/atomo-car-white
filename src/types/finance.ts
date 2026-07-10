export type CostType =
  | "washing"
  | "bodywork"
  | "painting"
  | "mechanical"
  | "documentation"
  | "accessories"
  | "other";

export interface VehicleCost {
  id: string;
  dealershipId: string;
  vehicleId: string;
  costType: CostType;
  amount: number;
  description: string;
  supplier?: string;
  incurredAt: string;
  createdAt: string;
}

export interface VehicleAcquisition {
  id: string;
  vehicleId: string;
  acquisitionPrice: number;
  supplierName?: string;
  notes?: string;
  createdAt: string;
}

/** Resumo financeiro de um veículo (calculado no service). */
export interface VehicleFinancials {
  vehicleId: string;
  acquisitionPrice: number | null;
  costsTotal: number;
  costs: VehicleCost[];
  /** aquisição + custos */
  totalInvested: number;
  /** preço anunciado − investido (enquanto não vendido) */
  projectedMargin: number | null;
}

export type EntryKind = "payable" | "receivable";

export type EntryCategory =
  | "vehicle_sale"
  | "vehicle_cost"
  | "commission"
  | "consignment_payout"
  | "rent"
  | "utilities"
  | "payroll"
  | "marketing"
  | "taxes"
  | "supplier"
  | "other"
  // Recebimento (Contas a Receber) — ver migration 010
  | "down_payment"
  | "installment_income";

/** Derivado de paid_at/due_date — nunca persistido. */
export type EntryStatus = "open" | "overdue" | "paid";

/** Parcelamento (dividir um total) vs recorrência (valor fixo repetido). */
export type SeriesType = "installment" | "recurring";
export type SeriesFrequency = "weekly" | "monthly" | "yearly";

export interface FinancialEntry {
  id: string;
  dealershipId: string;
  kind: EntryKind;
  category: EntryCategory;
  description: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  vehicleId?: string;
  saleId?: string;
  teamMemberId?: string;
  createdAt: string;
  status: EntryStatus;
  /** Séries (recorrente/parcelado) — undefined em contas únicas. */
  groupId?: string;
  seriesType?: SeriesType;
  seriesIndex?: number;
  seriesTotal?: number;
  seriesFrequency?: SeriesFrequency;
}

export interface CreateEntryInput {
  kind: EntryKind;
  category: EntryCategory;
  description: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  vehicleId?: string;
  teamMemberId?: string;
}

export interface CreateSeriesInput {
  kind: EntryKind;
  category: EntryCategory;
  description: string;
  seriesType: SeriesType;
  frequency: SeriesFrequency;
  /** Número de ocorrências (2..60). */
  count: number;
  /** Vencimento da 1ª ocorrência (yyyy-mm-dd). */
  firstDueDate: string;
  /** Parcelamento: valor total a dividir entre as N parcelas. */
  totalAmount?: number;
  /** Recorrência: valor fixo de cada ocorrência. */
  amountPerEntry?: number;
  vehicleId?: string;
  teamMemberId?: string;
}
