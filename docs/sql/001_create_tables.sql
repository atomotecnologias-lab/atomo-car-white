-- ============================================================
-- Primos Cockpit — Migration 001
-- Criação das tabelas principais
-- Executar no Supabase Dashboard → SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- DEALERSHIPS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dealerships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  phone      TEXT,
  email      TEXT,
  city       TEXT,
  state      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir a Primos Automóveis como loja padrão
INSERT INTO dealerships (name, slug, phone, email, city, state)
VALUES ('Primos Automóveis', 'primos-automoveis', '+554799759-2023', 'atomotecnologias@gmail.com', 'Jaraguá do Sul', 'SC')
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- VEHICLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id    UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  slug             TEXT NOT NULL UNIQUE,
  brand            TEXT NOT NULL,
  model            TEXT NOT NULL,
  version          TEXT NOT NULL DEFAULT '',
  year_manufacture INTEGER NOT NULL,
  year_model       INTEGER NOT NULL,
  price            NUMERIC(12,2) NOT NULL,
  mileage          INTEGER NOT NULL DEFAULT 0,
  transmission     TEXT NOT NULL DEFAULT 'manual',
  fuel_type        TEXT NOT NULL DEFAULT 'flex',
  color            TEXT NOT NULL DEFAULT '',
  doors            INTEGER NOT NULL DEFAULT 4,
  plate_final      TEXT,
  description_short TEXT NOT NULL DEFAULT '',
  description_full  TEXT NOT NULL DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','awaiting_photos','active','reserved','sold','inactive')),
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  published_at     TIMESTAMPTZ,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS vehicles_dealership_id_idx ON vehicles(dealership_id);
CREATE INDEX IF NOT EXISTS vehicles_status_idx ON vehicles(status);
CREATE INDEX IF NOT EXISTS vehicles_is_published_idx ON vehicles(is_published);
CREATE INDEX IF NOT EXISTS vehicles_is_featured_idx ON vehicles(is_featured);
CREATE INDEX IF NOT EXISTS vehicles_created_at_idx ON vehicles(created_at DESC);
CREATE INDEX IF NOT EXISTS vehicles_slug_idx ON vehicles(slug);

-- ------------------------------------------------------------
-- VEHICLE IMAGES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id   UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  image_url    TEXT NOT NULL,
  position     TEXT,
  is_cover     BOOLEAN NOT NULL DEFAULT false,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vehicle_images_vehicle_id_idx ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS vehicle_images_is_cover_idx ON vehicle_images(vehicle_id, is_cover);

-- ------------------------------------------------------------
-- VEHICLE FEATURES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_features (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id   UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS vehicle_features_vehicle_id_idx ON vehicle_features(vehicle_id);

-- ------------------------------------------------------------
-- LEADS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id  UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  vehicle_id     UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  source         TEXT NOT NULL DEFAULT 'site_form'
                 CHECK (source IN ('site_vehicle','site_form','whatsapp','instagram','facebook','google','other')),
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','contacted','negotiating','proposal','financing','sold','lost')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_contact_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS leads_dealership_id_idx ON leads(dealership_id);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);

-- ------------------------------------------------------------
-- TRIGGER: atualizar updated_at automaticamente em vehicles
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicles_updated_at ON vehicles;
CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
