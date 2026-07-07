-- ============================================================
-- Atomo Car — Migration 008
-- Vincula o LOGIN de demonstração (auth.users) ao vendedor
-- Carlos Mendes (team_members).
--
-- PRÉ-REQUISITO (já feito no painel do Supabase):
--   Authentication → Users → conta criada com
--     Email: vendedor@teste.com  · ✅ Auto Confirm User
--
-- Rode este arquivo no SQL Editor.
-- Idempotente: se o usuário não existir, atualiza 0 linhas.
-- ============================================================

UPDATE team_members
SET user_id = (SELECT id FROM auth.users WHERE email = 'vendedor@teste.com')
WHERE id = 'b0000000-0000-4000-8000-000000000002'   -- Carlos Mendes (vendedor)
  AND EXISTS (SELECT 1 FROM auth.users WHERE email = 'vendedor@teste.com');

-- Conferência (deve retornar Carlos Mendes com user_id preenchido):
-- SELECT name, email, role, user_id FROM team_members WHERE id = 'b0000000-0000-4000-8000-000000000002';
