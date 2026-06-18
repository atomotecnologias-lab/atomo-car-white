-- ============================================================
-- Primos Cockpit — Migration 003
-- Supabase Storage — Bucket de veículos
-- Executar APÓS a migration 002
-- ============================================================

-- Criar bucket vehicles (público para leitura)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicles', 'vehicles', true)
ON CONFLICT (id) DO NOTHING;

-- Política: leitura pública das imagens
CREATE POLICY "vehicles_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicles');

-- Política: upload somente para autenticados
CREATE POLICY "vehicles_images_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicles' AND auth.role() = 'authenticated');

-- Política: exclusão somente para autenticados
CREATE POLICY "vehicles_images_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vehicles' AND auth.role() = 'authenticated');

-- Política: atualização somente para autenticados
CREATE POLICY "vehicles_images_auth_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vehicles' AND auth.role() = 'authenticated');
