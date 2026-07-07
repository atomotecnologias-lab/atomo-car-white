export type PaymentMethod =
  | "cash"
  | "pix"
  | "financing"
  | "consortium"
  | "trade_in"
  | "mixed"
  | "other";

export type CommissionType = "percent" | "fixed";
export type CommissionBase = "sale" | "profit";

export interface CommissionConfig {
  type: CommissionType;
  base: CommissionBase;
  value: number;
}

export interface Sale {
  id: string;
  dealershipId: string;
  vehicleId: string;
  sellerId?: string;
  leadId?: string;
  buyerName: string;
  buyerPhone?: string;
  salePrice: number;
  soldAt: string;
  paymentMethod: PaymentMethod;
  acquisitionPriceSnapshot: number;
  costsTotalSnapshot: number;
  commissionTypeSnapshot: CommissionType;
  commissionBaseSnapshot: CommissionBase;
  commissionValueSnapshot: number;
  commissionAmount: number;
  grossProfit: number;
  netProfit: number;
  notes?: string;
  createdAt: string;
}

/** Linha da view seller_sales — colunas seguras, sem custo/lucro. */
export interface SellerSale {
  id: string;
  vehicleId: string;
  sellerId: string;
  buyerName: string;
  salePrice: number;
  soldAt: string;
  paymentMethod: PaymentMethod;
  commissionAmount: number;
}

export interface RegisterSaleInput {
  vehicleId: string;
  sellerId?: string;
  leadId?: string;
  buyerName: string;
  buyerPhone?: string;
  salePrice: number;
  soldAt: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}
