-- ============================================================
-- Atomo Car — Migration 009
-- Séries financeiras: contas recorrentes e recebimentos parcelados.
-- Cada ocorrência é materializada como uma linha em financial_entries;
-- estas colunas apenas AGRUPAM e ROTULAM as linhas de uma mesma série.
--
-- Executar APÓS a migration 005.
-- Idempotente: ADD COLUMN IF NOT EXISTS.
-- 100% retrocompatível: todas as colunas são NULL para contas únicas
-- e para lançamentos gerados por vendas.
-- ============================================================

ALTER TABLE financial_entries
  ADD COLUMN IF NOT EXISTS group_id UUID,
  ADD COLUMN IF NOT EXISTS series_type TEXT
    CHECK (series_type IN ('installment','recurring')),
  ADD COLUMN IF NOT EXISTS series_index INTEGER,
  ADD COLUMN IF NOT EXISTS series_total INTEGER,
  ADD COLUMN IF NOT EXISTS series_frequency TEXT
    CHECK (series_frequency IN ('weekly','monthly','yearly'));

CREATE INDEX IF NOT EXISTS financial_entries_group_idx
  ON financial_entries(group_id);
