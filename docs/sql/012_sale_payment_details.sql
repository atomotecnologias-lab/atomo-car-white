-- ============================================================
-- Atomo Car — Migration 012
-- Detalhes de pagamento da venda: documento do comprador,
-- entrada (financiamento/consórcio) e valor da troca.
-- Não afetam gross/net_profit (que seguem o sale_price total).
-- Idempotente: ADD COLUMN IF NOT EXISTS.
-- ============================================================

ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS buyer_document TEXT,
  ADD COLUMN IF NOT EXISTS down_payment   NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trade_in_value NUMERIC(12,2) NOT NULL DEFAULT 0;
