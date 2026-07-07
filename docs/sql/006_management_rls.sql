-- ============================================================
-- Atomo Car — Migration 006
-- RLS por papel: owner vê tudo; seller não lê dados sensíveis
-- Executar APÓS a migration 005
-- Idempotente: DROP POLICY IF EXISTS antes de cada CREATE
-- ============================================================

-- ------------------------------------------------------------
-- Helpers (SECURITY DEFINER evita recursão de RLS em team_members)
-- Fallback deliberado: usuário autenticado SEM cadastro em
-- team_members é tratado como owner — evita lockout do login
-- da demo antes do seed 007 e de qualquer loja recém-criada.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_is_owner() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT role = 'owner' FROM team_members
      WHERE user_id = auth.uid() AND is_active LIMIT 1),
    auth.role() = 'authenticated'
  );
$$;

CREATE OR REPLACE FUNCTION app_member_id() RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM team_members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ------------------------------------------------------------
-- Habilitar RLS
-- ------------------------------------------------------------
ALTER TABLE team_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_acquisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_costs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealership_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales                ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_entries    ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- team_members: leitura autenticada (vendedor vê nomes da equipe),
-- escrita somente owner
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "team_members_auth_read" ON team_members;
CREATE POLICY "team_members_auth_read"
  ON team_members FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "team_members_owner_write" ON team_members;
CREATE POLICY "team_members_owner_write"
  ON team_members FOR ALL
  USING (app_is_owner());

-- ------------------------------------------------------------
-- Tabelas sensíveis: owner-only para tudo
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "vehicle_acquisitions_owner_all" ON vehicle_acquisitions;
CREATE POLICY "vehicle_acquisitions_owner_all"
  ON vehicle_acquisitions FOR ALL
  USING (app_is_owner());

DROP POLICY IF EXISTS "vehicle_costs_owner_all" ON vehicle_costs;
CREATE POLICY "vehicle_costs_owner_all"
  ON vehicle_costs FOR ALL
  USING (app_is_owner());

DROP POLICY IF EXISTS "dealership_settings_owner_all" ON dealership_settings;
CREATE POLICY "dealership_settings_owner_all"
  ON dealership_settings FOR ALL
  USING (app_is_owner());

DROP POLICY IF EXISTS "sales_owner_all" ON sales;
CREATE POLICY "sales_owner_all"
  ON sales FOR ALL
  USING (app_is_owner());

DROP POLICY IF EXISTS "financial_entries_owner_all" ON financial_entries;
CREATE POLICY "financial_entries_owner_all"
  ON financial_entries FOR ALL
  USING (app_is_owner());

-- ------------------------------------------------------------
-- View para o vendedor: as próprias vendas, SÓ colunas seguras
-- (sem custo, sem lucro). A view roda com privilégio do dono
-- do schema e filtra pelo membro logado.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW seller_sales AS
  SELECT s.id, s.vehicle_id, s.seller_id, s.buyer_name, s.sale_price,
         s.sold_at, s.payment_method, s.commission_amount
  FROM sales s
  WHERE s.seller_id = app_member_id();

GRANT SELECT ON seller_sales TO authenticated;
