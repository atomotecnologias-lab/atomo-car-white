-- ============================================================
-- Primos Cockpit — Migration 002
-- Row Level Security (RLS)
-- Executar APÓS a migration 001
-- ============================================================

-- ------------------------------------------------------------
-- Habilitar RLS em todas as tabelas
-- ------------------------------------------------------------
ALTER TABLE dealerships     ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads           ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- DEALERSHIPS
-- Leitura pública | Escrita somente autenticado
-- ------------------------------------------------------------
CREATE POLICY "dealerships_public_read"
  ON dealerships FOR SELECT
  USING (true);

CREATE POLICY "dealerships_auth_write"
  ON dealerships FOR ALL
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- VEHICLES
-- Leitura pública (apenas publicados) | Leitura total para admin | Escrita autenticada
-- ------------------------------------------------------------
CREATE POLICY "vehicles_public_read"
  ON vehicles FOR SELECT
  USING (is_published = true);

CREATE POLICY "vehicles_auth_read_all"
  ON vehicles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "vehicles_auth_insert"
  ON vehicles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "vehicles_auth_update"
  ON vehicles FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "vehicles_auth_delete"
  ON vehicles FOR DELETE
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- VEHICLE IMAGES
-- Leitura pública | Escrita autenticada
-- ------------------------------------------------------------
CREATE POLICY "vehicle_images_public_read"
  ON vehicle_images FOR SELECT
  USING (true);

CREATE POLICY "vehicle_images_auth_write"
  ON vehicle_images FOR ALL
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- VEHICLE FEATURES
-- Leitura pública | Escrita autenticada
-- ------------------------------------------------------------
CREATE POLICY "vehicle_features_public_read"
  ON vehicle_features FOR SELECT
  USING (true);

CREATE POLICY "vehicle_features_auth_write"
  ON vehicle_features FOR ALL
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- LEADS
-- Leitura/Escrita somente autenticado (dados sensíveis)
-- Exceção: INSERT público (formulário de contato do site)
-- ------------------------------------------------------------
CREATE POLICY "leads_auth_read"
  ON leads FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "leads_public_insert"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "leads_auth_update"
  ON leads FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "leads_auth_delete"
  ON leads FOR DELETE
  USING (auth.role() = 'authenticated');
