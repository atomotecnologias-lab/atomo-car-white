-- ------------------------------------------------------------
-- 010_receivable_categories.sql
-- Categorias próprias de RECEBIMENTO (Contas a Receber).
-- Antes, receber reaproveitava categorias de pagar (água/luz), sem sentido.
-- Adiciona 'down_payment' (Entrada/Sinal) e 'installment_income' (Parcela/Financiamento)
-- ao CHECK de financial_entries.category.
--
-- Idempotente: DROP IF EXISTS + ADD (rode quantas vezes quiser).
-- ------------------------------------------------------------

ALTER TABLE financial_entries
  DROP CONSTRAINT IF EXISTS financial_entries_category_check;

ALTER TABLE financial_entries
  ADD CONSTRAINT financial_entries_category_check CHECK (category IN (
    'vehicle_sale','vehicle_cost','commission','consignment_payout',
    'rent','utilities','payroll','marketing','taxes','supplier','other',
    'down_payment','installment_income'
  ));
