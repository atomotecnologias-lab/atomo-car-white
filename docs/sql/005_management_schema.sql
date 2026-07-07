-- ============================================================
-- Atomo Car — Migration 005
-- Domínio de gestão: jornada do veículo, custos, vendas,
-- equipe, comissões e financeiro
-- Executar APÓS as migrations 001–004
-- Idempotente: pode ser executada mais de uma vez
-- ============================================================

-- ------------------------------------------------------------
-- 1) Jornada do veículo (campos NÃO sensíveis — vendedor pode ver)
-- ------------------------------------------------------------
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS acquired_at DATE,
  ADD COLUMN IF NOT EXISTS acquisition_source TEXT NOT NULL DEFAULT 'own_purchase'
    CHECK (acquisition_source IN ('own_purchase','consignment','trade_in')),
  ADD COLUMN IF NOT EXISTS preparation_status TEXT NOT NULL DEFAULT 'none'
    CHECK (preparation_status IN ('none','in_preparation','ready'));

-- ------------------------------------------------------------
-- 2) Equipe / papéis
-- user_id é opcional: o dono cadastra vendedores sem login e
-- vincula o auth.users depois, quando o vendedor ganhar acesso.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  user_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('owner','seller')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS team_members_dealership_idx ON team_members(dealership_id);

-- ------------------------------------------------------------
-- 3) Aquisição do veículo (SENSÍVEL — owner-only via RLS na 006)
-- 1:1 com vehicles.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_acquisitions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id        UUID NOT NULL UNIQUE REFERENCES vehicles(id) ON DELETE CASCADE,
  acquisition_price NUMERIC(12,2) NOT NULL CHECK (acquisition_price >= 0),
  supplier_name     TEXT,
  notes             TEXT,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 4) Custos por veículo (SENSÍVEL)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_costs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  vehicle_id    UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  cost_type     TEXT NOT NULL CHECK (cost_type IN
    ('washing','bodywork','painting','mechanical','documentation','accessories','other')),
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description   TEXT NOT NULL DEFAULT '',
  supplier      TEXT,
  incurred_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vehicle_costs_vehicle_id_idx  ON vehicle_costs(vehicle_id);
CREATE INDEX IF NOT EXISTS vehicle_costs_incurred_at_idx ON vehicle_costs(incurred_at DESC);

-- ------------------------------------------------------------
-- 5) Configurações da loja (comissão; extensível a outras)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dealership_settings (
  dealership_id    UUID PRIMARY KEY REFERENCES dealerships(id) ON DELETE CASCADE,
  commission_type  TEXT NOT NULL DEFAULT 'percent' CHECK (commission_type IN ('percent','fixed')),
  commission_base  TEXT NOT NULL DEFAULT 'sale'    CHECK (commission_base IN ('sale','profit')),
  commission_value NUMERIC(12,4) NOT NULL DEFAULT 1.0 CHECK (commission_value >= 0),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 6) Vendas (SENSÍVEL)
-- Snapshots imutáveis no ato da venda — documento contábil.
-- vehicle_id UNIQUE: um veículo tem no máximo uma venda ativa;
-- desfazer venda = DELETE (cascateia lançamentos via sale_id).
-- gross/net_profit são colunas geradas (não desincronizam).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id  UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  vehicle_id     UUID NOT NULL UNIQUE REFERENCES vehicles(id) ON DELETE CASCADE,
  seller_id      UUID REFERENCES team_members(id) ON DELETE SET NULL,
  lead_id        UUID REFERENCES leads(id) ON DELETE SET NULL,
  buyer_name     TEXT NOT NULL,
  buyer_phone    TEXT,
  sale_price     NUMERIC(12,2) NOT NULL CHECK (sale_price > 0),
  sold_at        DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN
    ('cash','pix','financing','consortium','trade_in','mixed','other')),
  acquisition_price_snapshot NUMERIC(12,2) NOT NULL DEFAULT 0,
  costs_total_snapshot       NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_type_snapshot   TEXT NOT NULL,
  commission_base_snapshot   TEXT NOT NULL,
  commission_value_snapshot  NUMERIC(12,4) NOT NULL,
  commission_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  gross_profit NUMERIC(12,2) GENERATED ALWAYS AS
    (sale_price - acquisition_price_snapshot - costs_total_snapshot) STORED,
  net_profit   NUMERIC(12,2) GENERATED ALWAYS AS
    (sale_price - acquisition_price_snapshot - costs_total_snapshot - commission_amount) STORED,
  notes        TEXT,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sales_sold_at_idx   ON sales(sold_at DESC);
CREATE INDEX IF NOT EXISTS sales_seller_id_idx ON sales(seller_id);

-- ------------------------------------------------------------
-- 7) Financeiro: contas a pagar e a receber (SENSÍVEL)
-- kind: payable | receivable. paid_at NULL = em aberto.
-- Status (open|overdue|paid) é DERIVADO no service — sem coluna.
-- sale_id ON DELETE CASCADE: desfazer venda limpa lançamentos.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS financial_entries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id  UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  kind           TEXT NOT NULL CHECK (kind IN ('payable','receivable')),
  category       TEXT NOT NULL DEFAULT 'other' CHECK (category IN
    ('vehicle_sale','vehicle_cost','commission','consignment_payout','rent','utilities',
     'payroll','marketing','taxes','supplier','other')),
  description    TEXT NOT NULL,
  amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  due_date       DATE NOT NULL,
  paid_at        DATE,
  vehicle_id     UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  sale_id        UUID REFERENCES sales(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS financial_entries_due_idx
  ON financial_entries(dealership_id, kind, due_date);
CREATE INDEX IF NOT EXISTS financial_entries_open_idx
  ON financial_entries(due_date) WHERE paid_at IS NULL;
