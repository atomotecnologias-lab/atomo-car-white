-- ============================================================
-- Atomo Car — Migration 011
-- Auditoria: quem fez o quê e quando (append-only).
-- Executar APÓS a migration 006 (usa app_is_owner()).
-- Idempotente: IF NOT EXISTS + DROP POLICY IF EXISTS.
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id  UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  actor_user_id  UUID REFERENCES auth.users(id),
  actor_name     TEXT NOT NULL DEFAULT 'Sistema',
  action         TEXT NOT NULL,   -- create | update | delete | pay | unpay | undo | status
  entity_type    TEXT NOT NULL,   -- sale | cost | acquisition | entry | vehicle
  entity_id      UUID,
  vehicle_id     UUID REFERENCES vehicles(id) ON DELETE SET NULL, -- associação p/ histórico do veículo
  summary        TEXT NOT NULL,   -- frase pronta em pt-BR
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_recent_idx
  ON audit_log(dealership_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_vehicle_idx
  ON audit_log(vehicle_id, created_at DESC);

-- ------------------------------------------------------------
-- RLS: leitura só do dono; inserção por qualquer autenticado
-- (um vendedor que registra venda também gera log).
-- Append-only: sem update/delete.
-- ------------------------------------------------------------
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_owner_read" ON audit_log;
CREATE POLICY "audit_log_owner_read"
  ON audit_log FOR SELECT
  USING (app_is_owner());

DROP POLICY IF EXISTS "audit_log_auth_insert" ON audit_log;
CREATE POLICY "audit_log_auth_insert"
  ON audit_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
