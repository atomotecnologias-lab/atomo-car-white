-- ============================================================
-- Atomo Car — Migration 007
-- Seed de demonstração do módulo de gestão
-- Executar APÓS as migrations 005 e 006
-- Idempotente: UUIDs fixos + ON CONFLICT / DELETE por prefixo
--
-- Prefixos de UUID usados pelo seed:
--   b0000000-… team_members
--   c0000000-… veículos históricos vendidos
--   ac000000-… vendas
--   e0000000-… custos por veículo
--   d0000000-… lançamentos financeiros
-- ============================================================

-- ------------------------------------------------------------
-- 1) Equipe: 1 owner (vinculado ao usuário da demo) + 2 vendedores
-- ------------------------------------------------------------
INSERT INTO team_members (id, dealership_id, user_id, name, email, role)
SELECT 'b0000000-0000-4000-8000-000000000001',
       d.id, u.id, 'Administrador', u.email, 'owner'
FROM dealerships d,
     (SELECT id, email FROM auth.users ORDER BY created_at LIMIT 1) u
WHERE d.slug = 'atomo-car'
ON CONFLICT (id) DO NOTHING;

INSERT INTO team_members (id, dealership_id, name, email, phone, role)
SELECT v.id::uuid, d.id, v.name, v.email, v.phone, 'seller'
FROM dealerships d,
     (VALUES
       ('b0000000-0000-4000-8000-000000000002', 'Carlos Mendes', 'carlos@atomocar.com.br', '(47) 98888-1111'),
       ('b0000000-0000-4000-8000-000000000003', 'Ana Paula',     'ana@atomocar.com.br',    '(47) 98888-2222')
     ) AS v(id, name, email, phone)
WHERE d.slug = 'atomo-car'
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 2) Configuração de comissão: 5% sobre o lucro
-- ------------------------------------------------------------
INSERT INTO dealership_settings (dealership_id, commission_type, commission_base, commission_value)
SELECT id, 'percent', 'profit', 5.0 FROM dealerships WHERE slug = 'atomo-car'
ON CONFLICT (dealership_id) DO NOTHING;

-- ------------------------------------------------------------
-- 3) Jornada dos 7 veículos existentes (aging real escalonado)
-- ------------------------------------------------------------
UPDATE vehicles SET acquired_at = '2026-06-20', acquisition_source = 'own_purchase' WHERE id = 'a0000000-0000-4000-8000-000000000001'; -- Jeep      ~17d
UPDATE vehicles SET acquired_at = '2026-06-05', acquisition_source = 'trade_in'     WHERE id = 'a0000000-0000-4000-8000-000000000002'; -- City      ~32d
UPDATE vehicles SET acquired_at = '2026-04-28', acquisition_source = 'own_purchase' WHERE id = 'a0000000-0000-4000-8000-000000000003'; -- Kicks     ~70d
UPDATE vehicles SET acquired_at = '2026-06-12', acquisition_source = 'own_purchase' WHERE id = 'a0000000-0000-4000-8000-000000000004'; -- HB20      ~25d
UPDATE vehicles SET acquired_at = '2026-05-10', acquisition_source = 'consignment'  WHERE id = 'a0000000-0000-4000-8000-000000000005'; -- Ka        ~58d
UPDATE vehicles SET acquired_at = '2026-03-05', acquisition_source = 'own_purchase' WHERE id = 'a0000000-0000-4000-8000-000000000006'; -- Up!      ~124d (crítico)
UPDATE vehicles SET acquired_at = '2026-04-02', acquisition_source = 'own_purchase' WHERE id = 'a0000000-0000-4000-8000-000000000007'; -- Celta (vendido)

-- ------------------------------------------------------------
-- 4) Aquisições dos 7 veículos existentes
-- ------------------------------------------------------------
INSERT INTO vehicle_acquisitions (vehicle_id, acquisition_price, supplier_name) VALUES
  ('a0000000-0000-4000-8000-000000000001', 92000, 'Compra particular — anúncio'),
  ('a0000000-0000-4000-8000-000000000002', 75500, 'Troca — cliente João Batista'),
  ('a0000000-0000-4000-8000-000000000003', 72000, 'Leilão Sodré Santoro'),
  ('a0000000-0000-4000-8000-000000000004', 63500, 'Compra particular — indicação'),
  ('a0000000-0000-4000-8000-000000000005', 48500, 'Consignação — Roberto Lima'),
  ('a0000000-0000-4000-8000-000000000006', 32800, 'Compra particular — anúncio'),
  ('a0000000-0000-4000-8000-000000000007', 17500, 'Compra particular')
ON CONFLICT (vehicle_id) DO NOTHING;

-- ------------------------------------------------------------
-- 5) Veículos históricos vendidos (invisíveis no site público)
--    Alimentam gráfico de lucro mensal e ranking de vendedores
-- ------------------------------------------------------------
INSERT INTO vehicles (id, dealership_id, slug, brand, model, version, year_manufacture, year_model,
                      price, mileage, transmission, fuel_type, color, status, is_published,
                      acquired_at, acquisition_source)
SELECT v.id::uuid, d.id, v.slug, v.brand, v.model, v.version, v.ym, v.ym,
       v.price, v.km, v.trans, 'flex', v.color, 'sold', false,
       v.acq_at::date, 'own_purchase'
FROM dealerships d,
     (VALUES
       ('c0000000-0000-4000-8000-000000000001', 'fiat-argo-drive-1-0-2019-hist',      'Fiat',      'Argo',    'Drive 1.0',    2019, 52900, 58200, 'manual',    'Prata',   '2026-01-08'),
       ('c0000000-0000-4000-8000-000000000002', 'chevrolet-onix-lt-1-0-2018-hist',    'Chevrolet', 'Onix',    'LT 1.0',       2018, 54900, 64100, 'manual',    'Branco',  '2026-01-15'),
       ('c0000000-0000-4000-8000-000000000003', 'volkswagen-gol-1-6-2017-hist',       'Volkswagen','Gol',     '1.6 MSI',      2017, 45900, 78300, 'manual',    'Vermelho','2026-02-03'),
       ('c0000000-0000-4000-8000-000000000004', 'toyota-corolla-xei-2016-hist',       'Toyota',    'Corolla', 'XEi 2.0',      2016, 84900, 89500, 'automatic', 'Prata',   '2026-02-14'),
       ('c0000000-0000-4000-8000-000000000005', 'honda-fit-lx-2017-hist',             'Honda',     'Fit',     'LX 1.5',       2017, 62900, 71800, 'cvt',       'Cinza',   '2026-03-02'),
       ('c0000000-0000-4000-8000-000000000006', 'renault-sandero-expression-2019-hist','Renault',  'Sandero', 'Expression',   2019, 42900, 55400, 'manual',    'Branco',  '2026-03-20'),
       ('c0000000-0000-4000-8000-000000000007', 'hyundai-creta-attitude-2018-hist',   'Hyundai',   'Creta',   'Attitude 1.6', 2018, 79900, 67200, 'automatic', 'Preto',   '2026-04-10'),
       ('c0000000-0000-4000-8000-000000000008', 'fiat-toro-freedom-2019-hist',        'Fiat',      'Toro',    'Freedom 1.8',  2019, 96900, 61900, 'automatic', 'Cinza',   '2026-05-05')
     ) AS v(id, slug, brand, model, version, ym, price, km, trans, color, acq_at)
WHERE d.slug = 'atomo-car'
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicle_acquisitions (vehicle_id, acquisition_price) VALUES
  ('c0000000-0000-4000-8000-000000000001', 44000),
  ('c0000000-0000-4000-8000-000000000002', 47500),
  ('c0000000-0000-4000-8000-000000000003', 38000),
  ('c0000000-0000-4000-8000-000000000004', 74000),
  ('c0000000-0000-4000-8000-000000000005', 54500),
  ('c0000000-0000-4000-8000-000000000006', 37800),
  ('c0000000-0000-4000-8000-000000000007', 68000),
  ('c0000000-0000-4000-8000-000000000008', 84000)
ON CONFLICT (vehicle_id) DO NOTHING;

-- ------------------------------------------------------------
-- 6) Custos por veículo
--    (DELETE por prefixo e0000000 = só linhas do seed; custos
--     lançados pelo usuário são preservados em re-execução)
-- ------------------------------------------------------------
DELETE FROM vehicle_costs WHERE id::text LIKE 'e0000000-%';

INSERT INTO vehicle_costs (id, dealership_id, vehicle_id, cost_type, amount, description, supplier, incurred_at)
SELECT c.id::uuid, d.id, c.vid::uuid, c.ctype, c.amount, c.descr, c.supplier, c.inc::date
FROM dealerships d,
     (VALUES
       -- Jeep Renegade (ativo) — total 2.480
       ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'washing',       250,  'Lavagem detalhada + higienização', 'Estética JS',        '2026-06-21'),
       ('e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'documentation', 780,  'Transferência + vistoria',         'Despachante Küster', '2026-06-23'),
       ('e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'mechanical',    1450, 'Revisão + pastilhas de freio',     'Oficina do Marcos',  '2026-06-26'),
       -- Honda City (ativo) — total 800
       ('e0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'washing',       180,  'Lavagem completa',                 'Estética JS',        '2026-06-06'),
       ('e0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', 'documentation', 620,  'Transferência',                    'Despachante Küster', '2026-06-10'),
       -- Nissan Kicks (ativo, 70d) — total 4.990
       ('e0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000003', 'mechanical',    2350, 'Suspensão dianteira + alinhamento','Oficina do Marcos',  '2026-05-02'),
       ('e0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000003', 'painting',      1800, 'Pintura para-choque traseiro',     'Funilaria Beto',     '2026-05-08'),
       ('e0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000003', 'washing',       220,  'Polimento + lavagem',              'Estética JS',        '2026-05-12'),
       ('e0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000003', 'documentation', 620,  'Transferência',                    'Despachante Küster', '2026-05-06'),
       -- Hyundai HB20 (ativo) — total 740
       ('e0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000004', 'washing',       150,  'Lavagem completa',                 'Estética JS',        '2026-06-13'),
       ('e0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000004', 'documentation', 590,  'Transferência',                    'Despachante Küster', '2026-06-16'),
       -- Ford Ka (ativo, 58d) — total 2.840
       ('e0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000005', 'bodywork',      1650, 'Reparo porta dianteira direita',   'Funilaria Beto',     '2026-05-14'),
       ('e0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000005', 'washing',       180,  'Lavagem completa',                 'Estética JS',        '2026-05-16'),
       ('e0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000005', 'documentation', 590,  'Transferência',                    'Despachante Küster', '2026-05-18'),
       ('e0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000005', 'accessories',   420,  'Jogo de tapetes + película',       'Acessórios Center',  '2026-05-22'),
       -- VW Up! (ativo, 124d — crítico) — total 3.770
       ('e0000000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000006', 'mechanical',    1850, 'Embreagem completa',               'Oficina do Marcos',  '2026-03-10'),
       ('e0000000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000006', 'painting',      950,  'Retoque capô + teto',              'Funilaria Beto',     '2026-03-18'),
       ('e0000000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000006', 'washing',       150,  'Lavagem completa',                 'Estética JS',        '2026-03-20'),
       ('e0000000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000006', 'documentation', 520,  'Transferência',                    'Despachante Küster', '2026-03-12'),
       ('e0000000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-000000000006', 'other',         300,  'Chaveiro — cópia de chave',        NULL,                 '2026-04-02'),
       -- Celta (vendido) — total 950
       ('e0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000007', 'mechanical',    500,  'Troca de óleo + filtros',          'Oficina do Marcos',  '2026-04-08'),
       ('e0000000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000007', 'documentation', 450,  'Transferência',                    'Despachante Küster', '2026-04-10'),
       -- Históricos (2 custos cada, somando o snapshot da venda)
       ('e0000000-0000-4000-8000-000000000023', 'c0000000-0000-4000-8000-000000000001', 'documentation', 450,  'Transferência',                    'Despachante Küster', '2026-01-12'),
       ('e0000000-0000-4000-8000-000000000024', 'c0000000-0000-4000-8000-000000000001', 'mechanical',    1350, 'Revisão geral',                    'Oficina do Marcos',  '2026-01-20'),
       ('e0000000-0000-4000-8000-000000000025', 'c0000000-0000-4000-8000-000000000002', 'documentation', 450,  'Transferência',                    'Despachante Küster', '2026-01-18'),
       ('e0000000-0000-4000-8000-000000000026', 'c0000000-0000-4000-8000-000000000002', 'accessories',   800,  'Multimídia + tapetes',             'Acessórios Center',  '2026-01-25'),
       ('e0000000-0000-4000-8000-000000000027', 'c0000000-0000-4000-8000-000000000003', 'painting',      1650, 'Pintura lateral esquerda',         'Funilaria Beto',     '2026-02-10'),
       ('e0000000-0000-4000-8000-000000000028', 'c0000000-0000-4000-8000-000000000003', 'documentation', 450,  'Transferência',                    'Despachante Küster', '2026-02-08'),
       ('e0000000-0000-4000-8000-000000000029', 'c0000000-0000-4000-8000-000000000004', 'mechanical',    2500, 'Correia dentada + revisão',        'Oficina do Marcos',  '2026-02-20'),
       ('e0000000-0000-4000-8000-000000000030', 'c0000000-0000-4000-8000-000000000004', 'documentation', 450,  'Transferência',                    'Despachante Küster', '2026-02-18'),
       ('e0000000-0000-4000-8000-000000000031', 'c0000000-0000-4000-8000-000000000005', 'mechanical',    980,  'Revisão + freios',                 'Oficina do Marcos',  '2026-03-08'),
       ('e0000000-0000-4000-8000-000000000032', 'c0000000-0000-4000-8000-000000000005', 'accessories',   620,  'Película + tapetes',               'Acessórios Center',  '2026-03-12'),
       ('e0000000-0000-4000-8000-000000000033', 'c0000000-0000-4000-8000-000000000006', 'bodywork',      1000, 'Reparo para-lama',                 'Funilaria Beto',     '2026-03-25'),
       ('e0000000-0000-4000-8000-000000000034', 'c0000000-0000-4000-8000-000000000006', 'documentation', 450,  'Transferência',                    'Despachante Küster', '2026-03-28'),
       ('e0000000-0000-4000-8000-000000000035', 'c0000000-0000-4000-8000-000000000007', 'mechanical',    1750, 'Suspensão + revisão',              'Oficina do Marcos',  '2026-04-15'),
       ('e0000000-0000-4000-8000-000000000036', 'c0000000-0000-4000-8000-000000000007', 'accessories',   650,  'Engate + tapetes',                 'Acessórios Center',  '2026-04-20'),
       ('e0000000-0000-4000-8000-000000000037', 'c0000000-0000-4000-8000-000000000008', 'painting',      2300, 'Pintura caçamba + capô',           'Funilaria Beto',     '2026-05-12'),
       ('e0000000-0000-4000-8000-000000000038', 'c0000000-0000-4000-8000-000000000008', 'washing',       220,  'Polimento',                        'Estética JS',        '2026-05-20'),
       ('e0000000-0000-4000-8000-000000000039', 'c0000000-0000-4000-8000-000000000008', 'documentation', 680,  'Transferência + vistoria',         'Despachante Küster', '2026-05-15')
     ) AS c(id, vid, ctype, amount, descr, supplier, inc)
WHERE d.slug = 'atomo-car';

-- ------------------------------------------------------------
-- 7) Vendas (snapshots calculados; comissão 5% sobre lucro bruto)
--    gross = venda − aquisição − custos; comissão = 5% × gross
-- ------------------------------------------------------------
INSERT INTO sales (id, dealership_id, vehicle_id, seller_id, buyer_name, buyer_phone,
                   sale_price, sold_at, payment_method,
                   acquisition_price_snapshot, costs_total_snapshot,
                   commission_type_snapshot, commission_base_snapshot, commission_value_snapshot,
                   commission_amount)
SELECT s.id::uuid, d.id, s.vid::uuid, s.seller::uuid, s.buyer, s.phone,
       s.price, s.sold::date, s.pay,
       s.acq, s.costs, 'percent', 'profit', 5.0, s.comm
FROM dealerships d,
     (VALUES
       -- id, vehicle, seller (Carlos=02 / Ana=03), buyer, phone, price, sold_at, payment, acq, costs, commission
       ('ac000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'Marcelo Souza',    '(47) 99911-2233', 52900, '2026-02-10', 'financing', 44000, 1800, 355.00),
       ('ac000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', 'Fernanda Costa',   '(47) 99922-3344', 54900, '2026-02-25', 'pix',       47500, 1250, 307.50),
       ('ac000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'João Pedro Ramos', '(47) 99933-4455', 45900, '2026-03-12', 'cash',      38000, 2100, 290.00),
       ('ac000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000003', 'Ricardo Alves',    '(47) 99944-5566', 84900, '2026-03-28', 'financing', 74000, 2950, 397.50),
       ('ac000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000002', 'Juliana Martins',  '(47) 99955-6677', 62900, '2026-04-15', 'financing', 54500, 1600, 340.00),
       ('ac000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000003', 'André Luiz Silva', '(47) 99966-7788', 42900, '2026-04-30', 'pix',       37800, 1450, 182.50),
       ('ac000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000002', 'Patrícia Gomes',   '(47) 99977-8899', 79900, '2026-05-20', 'financing', 68000, 2400, 475.00),
       ('ac000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000003', 'Eduardo Ferreira', '(47) 99988-9900', 96900, '2026-06-10', 'mixed',     84000, 3200, 485.00),
       ('ac000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000002', 'Luciana Ribeiro',  '(47) 99900-1122', 21900, '2026-06-28', 'cash',      17500,  950, 172.50)
     ) AS s(id, vid, seller, buyer, phone, price, sold, pay, acq, costs, comm)
WHERE d.slug = 'atomo-car'
ON CONFLICT (vehicle_id) DO NOTHING;

-- ------------------------------------------------------------
-- 8) Lançamentos financeiros
--    (DELETE por prefixo d0000000 = só linhas do seed)
-- ------------------------------------------------------------
DELETE FROM financial_entries WHERE id::text LIKE 'd0000000-%';

-- 8a) Recebíveis das 9 vendas (todas recebidas)
INSERT INTO financial_entries (id, dealership_id, kind, category, description, amount, due_date, paid_at, vehicle_id, sale_id)
SELECT f.id::uuid, d.id, 'receivable', 'vehicle_sale', f.descr, f.amount, f.due::date, f.paid::date, f.vid::uuid, f.sid::uuid
FROM dealerships d,
     (VALUES
       ('d0000000-0000-4000-8000-000000000001', 'Venda Fiat Argo Drive 1.0',       52900, '2026-02-10', '2026-02-10', 'c0000000-0000-4000-8000-000000000001', 'ac000000-0000-4000-8000-000000000001'),
       ('d0000000-0000-4000-8000-000000000002', 'Venda Chevrolet Onix LT 1.0',     54900, '2026-02-25', '2026-02-25', 'c0000000-0000-4000-8000-000000000002', 'ac000000-0000-4000-8000-000000000002'),
       ('d0000000-0000-4000-8000-000000000003', 'Venda Volkswagen Gol 1.6',        45900, '2026-03-12', '2026-03-12', 'c0000000-0000-4000-8000-000000000003', 'ac000000-0000-4000-8000-000000000003'),
       ('d0000000-0000-4000-8000-000000000004', 'Venda Toyota Corolla XEi',        84900, '2026-03-28', '2026-03-30', 'c0000000-0000-4000-8000-000000000004', 'ac000000-0000-4000-8000-000000000004'),
       ('d0000000-0000-4000-8000-000000000005', 'Venda Honda Fit LX',              62900, '2026-04-15', '2026-04-17', 'c0000000-0000-4000-8000-000000000005', 'ac000000-0000-4000-8000-000000000005'),
       ('d0000000-0000-4000-8000-000000000006', 'Venda Renault Sandero Expression',42900, '2026-04-30', '2026-04-30', 'c0000000-0000-4000-8000-000000000006', 'ac000000-0000-4000-8000-000000000006'),
       ('d0000000-0000-4000-8000-000000000007', 'Venda Hyundai Creta Attitude',    79900, '2026-05-20', '2026-05-23', 'c0000000-0000-4000-8000-000000000007', 'ac000000-0000-4000-8000-000000000007'),
       ('d0000000-0000-4000-8000-000000000008', 'Venda Fiat Toro Freedom',         96900, '2026-06-10', '2026-06-14', 'c0000000-0000-4000-8000-000000000008', 'ac000000-0000-4000-8000-000000000008'),
       ('d0000000-0000-4000-8000-000000000009', 'Venda Chevrolet Celta Life LS',   21900, '2026-06-28', '2026-06-28', 'a0000000-0000-4000-8000-000000000007', 'ac000000-0000-4000-8000-000000000009')
     ) AS f(id, descr, amount, due, paid, vid, sid)
WHERE d.slug = 'atomo-car';

-- 8b) Comissões (a pagar no fim do mês da venda; 2 recentes em aberto)
INSERT INTO financial_entries (id, dealership_id, kind, category, description, amount, due_date, paid_at, sale_id, team_member_id)
SELECT f.id::uuid, d.id, 'payable', 'commission', f.descr, f.amount, f.due::date,
       CASE WHEN f.paid = '' THEN NULL ELSE f.paid::date END,
       f.sid::uuid, f.member::uuid
FROM dealerships d,
     (VALUES
       ('d0000000-0000-4000-8000-000000000011', 'Comissão Carlos — Fiat Argo',      355.00, '2026-02-28', '2026-03-05', 'ac000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002'),
       ('d0000000-0000-4000-8000-000000000012', 'Comissão Ana — Chevrolet Onix',    307.50, '2026-02-28', '2026-03-05', 'ac000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003'),
       ('d0000000-0000-4000-8000-000000000013', 'Comissão Carlos — VW Gol',         290.00, '2026-03-31', '2026-04-03', 'ac000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002'),
       ('d0000000-0000-4000-8000-000000000014', 'Comissão Ana — Toyota Corolla',    397.50, '2026-03-31', '2026-04-03', 'ac000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000003'),
       ('d0000000-0000-4000-8000-000000000015', 'Comissão Carlos — Honda Fit',      340.00, '2026-04-30', '2026-05-05', 'ac000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000002'),
       ('d0000000-0000-4000-8000-000000000016', 'Comissão Ana — Renault Sandero',   182.50, '2026-04-30', '2026-05-05', 'ac000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000003'),
       ('d0000000-0000-4000-8000-000000000017', 'Comissão Carlos — Hyundai Creta',  475.00, '2026-05-31', '',           'ac000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000002'),
       ('d0000000-0000-4000-8000-000000000018', 'Comissão Ana — Fiat Toro',         485.00, '2026-06-30', '',           'ac000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000003'),
       ('d0000000-0000-4000-8000-000000000019', 'Comissão Carlos — Chevrolet Celta',172.50, '2026-06-30', '2026-07-01', 'ac000000-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000002')
     ) AS f(id, descr, amount, due, paid, sid, member)
WHERE d.slug = 'atomo-car';

-- 8c) Despesas fixas mensais (fev–jun, todas pagas)
INSERT INTO financial_entries (id, dealership_id, kind, category, description, amount, due_date, paid_at)
SELECT f.id::uuid, d.id, 'payable', f.cat, f.descr, f.amount, f.due::date, f.paid::date
FROM dealerships d,
     (VALUES
       -- Aluguel (dia 10)
       ('d0000000-0000-4000-8000-000000000021', 'rent',      'Aluguel do pátio — fevereiro', 4500, '2026-02-10', '2026-02-10'),
       ('d0000000-0000-4000-8000-000000000022', 'rent',      'Aluguel do pátio — março',     4500, '2026-03-10', '2026-03-10'),
       ('d0000000-0000-4000-8000-000000000023', 'rent',      'Aluguel do pátio — abril',     4500, '2026-04-10', '2026-04-10'),
       ('d0000000-0000-4000-8000-000000000024', 'rent',      'Aluguel do pátio — maio',      4500, '2026-05-10', '2026-05-11'),
       ('d0000000-0000-4000-8000-000000000025', 'rent',      'Aluguel do pátio — junho',     4500, '2026-06-10', '2026-06-10'),
       -- Energia (dia 15)
       ('d0000000-0000-4000-8000-000000000026', 'utilities', 'Energia elétrica — fevereiro',  483, '2026-02-15', '2026-02-15'),
       ('d0000000-0000-4000-8000-000000000027', 'utilities', 'Energia elétrica — março',      512, '2026-03-15', '2026-03-16'),
       ('d0000000-0000-4000-8000-000000000028', 'utilities', 'Energia elétrica — abril',      547, '2026-04-15', '2026-04-15'),
       ('d0000000-0000-4000-8000-000000000029', 'utilities', 'Energia elétrica — maio',       601, '2026-05-15', '2026-05-15'),
       ('d0000000-0000-4000-8000-000000000030', 'utilities', 'Energia elétrica — junho',      578, '2026-06-15', '2026-06-17'),
       -- Marketing (dia 5)
       ('d0000000-0000-4000-8000-000000000031', 'marketing', 'Impulsionamento redes — fevereiro', 800, '2026-02-05', '2026-02-05'),
       ('d0000000-0000-4000-8000-000000000032', 'marketing', 'Impulsionamento redes — março',     800, '2026-03-05', '2026-03-05'),
       ('d0000000-0000-4000-8000-000000000033', 'marketing', 'Impulsionamento redes — abril',     800, '2026-04-05', '2026-04-06'),
       ('d0000000-0000-4000-8000-000000000034', 'marketing', 'Impulsionamento redes — maio',      800, '2026-05-05', '2026-05-05'),
       ('d0000000-0000-4000-8000-000000000035', 'marketing', 'Impulsionamento redes — junho',     800, '2026-06-05', '2026-06-05'),
       -- Contador (dia 20)
       ('d0000000-0000-4000-8000-000000000036', 'other',     'Honorários contador — fevereiro',   650, '2026-02-20', '2026-02-20'),
       ('d0000000-0000-4000-8000-000000000037', 'other',     'Honorários contador — março',       650, '2026-03-20', '2026-03-20'),
       ('d0000000-0000-4000-8000-000000000038', 'other',     'Honorários contador — abril',       650, '2026-04-20', '2026-04-22'),
       ('d0000000-0000-4000-8000-000000000039', 'other',     'Honorários contador — maio',        650, '2026-05-20', '2026-05-20'),
       ('d0000000-0000-4000-8000-000000000040', 'other',     'Honorários contador — junho',       650, '2026-06-20', '2026-06-20')
     ) AS f(id, cat, descr, amount, due, paid)
WHERE d.slug = 'atomo-car';

-- 8d) Contas em aberto e vencida (para a demo)
INSERT INTO financial_entries (id, dealership_id, kind, category, description, amount, due_date, paid_at)
SELECT f.id::uuid, d.id, 'payable', f.cat, f.descr, f.amount, f.due::date, NULL
FROM dealerships d,
     (VALUES
       ('d0000000-0000-4000-8000-000000000041', 'rent',     'Aluguel do pátio — julho',            4500, '2026-07-10'),
       ('d0000000-0000-4000-8000-000000000042', 'taxes',    'IPVA frota — parcela 4/6',            1240, '2026-07-20'),
       ('d0000000-0000-4000-8000-000000000043', 'supplier', 'Auto Peças Silva — fatura 1042',      2380, '2026-07-15'),
       ('d0000000-0000-4000-8000-000000000044', 'supplier', 'Estética JS — mensalidade junho',      890, '2026-06-28')  -- VENCIDA
     ) AS f(id, cat, descr, amount, due)
WHERE d.slug = 'atomo-car';
