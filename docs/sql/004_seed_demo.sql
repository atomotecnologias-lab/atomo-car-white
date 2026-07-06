-- ============================================================
-- Atomo Car — Migration 004
-- Seed de demonstração: loja + 7 veículos com fotos e opcionais
-- Executar APÓS as migrations 001, 002 e 003
-- Idempotente: pode ser executado mais de uma vez sem duplicar
-- ============================================================

-- ------------------------------------------------------------
-- Loja: renomear a loja padrão para Atomo Car (white-label)
-- ------------------------------------------------------------
UPDATE dealerships
SET name = 'Atomo Car',
    slug = 'atomo-car',
    city = 'Jaraguá do Sul',
    state = 'SC'
WHERE slug = 'primos-automoveis';

INSERT INTO dealerships (name, slug, phone, email, city, state)
SELECT 'Atomo Car', 'atomo-car', '+5511999999999', 'atomotecnologias@gmail.com', 'Jaraguá do Sul', 'SC'
WHERE NOT EXISTS (SELECT 1 FROM dealerships WHERE slug = 'atomo-car');

-- ------------------------------------------------------------
-- Veículos (UUIDs fixos para facilitar re-execução)
-- ------------------------------------------------------------
INSERT INTO vehicles (id, dealership_id, slug, brand, model, version, year_manufacture, year_model, price, mileage, transmission, fuel_type, color, doors, plate_final, description_short, description_full, status, is_featured, is_published, published_at)
VALUES
  ('a0000000-0000-4000-8000-000000000001', (SELECT id FROM dealerships WHERE slug = 'atomo-car'),
   'jeep-renegade-longitude-1-8-2021', 'Jeep', 'Renegade', 'Longitude 1.8', 2021, 2021, 109900, 62400,
   'automatic', 'flex', 'Branco', 4, '7',
   'Jeep Renegade Longitude 1.8 2021 branco, automático, único dono.',
   'Jeep Renegade Longitude 1.8 2021/2021 na cor branca, câmbio automático, flex, com 62.400 km. Único dono, todas as revisões em concessionária, laudo cautelar aprovado. Aceitamos troca e auxiliamos no financiamento.',
   'active', true, true, now()),

  ('a0000000-0000-4000-8000-000000000002', (SELECT id FROM dealerships WHERE slug = 'atomo-car'),
   'honda-city-personal-1-5-2020', 'Honda', 'City', 'Personal 1.5', 2020, 2020, 89900, 71200,
   'cvt', 'flex', 'Preto', 4, '3',
   'Honda City Personal 1.5 2020 preto, CVT, segundo dono.',
   'Honda City Personal 1.5 2020/2020 preto, câmbio CVT, flex, com 71.200 km. Segundo dono, revisões realizadas, ótimo estado de conservação.',
   'active', true, true, now()),

  ('a0000000-0000-4000-8000-000000000003', (SELECT id FROM dealerships WHERE slug = 'atomo-car'),
   'nissan-kicks-sl-2018', 'Nissan', 'Kicks', 'SL 1.6', 2018, 2018, 86900, 84500,
   'cvt', 'flex', 'Vermelho', 4, '1',
   'Nissan Kicks SL 2018 vermelho, CVT, câmera 360º.',
   'Nissan Kicks SL 2018/2018 vermelho, câmbio CVT, flex, com 84.500 km. Segundo dono, chave presencial, câmera 360º, multimídia, bancos em couro.',
   'active', true, true, now()),

  ('a0000000-0000-4000-8000-000000000004', (SELECT id FROM dealerships WHERE slug = 'atomo-car'),
   'hyundai-hb20-comfort-2024', 'Hyundai', 'HB20', 'Comfort 1.0', 2024, 2024, 74900, 18700,
   'manual', 'flex', 'Prata', 4, '5',
   'Hyundai HB20 Comfort 2024 prata, manual, baixíssima km.',
   'Hyundai HB20 Comfort 1.0 2024/2024 prata, câmbio manual, flex, com 18.700 km. Garantia de fábrica vigente, único dono.',
   'active', true, true, now()),

  ('a0000000-0000-4000-8000-000000000005', (SELECT id FROM dealerships WHERE slug = 'atomo-car'),
   'ford-ka-se-1-0-2020', 'Ford', 'Ka', 'SE 1.0', 2020, 2020, 58900, 67800,
   'manual', 'flex', 'Cinza', 4, '9',
   'Ford Ka SE 1.0 2020 cinza, manual, econômico.',
   'Ford Ka SE 1.0 2020/2020 cinza, câmbio manual, flex, com 67.800 km. Revisões em dia, ótimo carro para o dia a dia.',
   'active', false, true, now()),

  ('a0000000-0000-4000-8000-000000000006', (SELECT id FROM dealerships WHERE slug = 'atomo-car'),
   'volkswagen-up-move-1-0-2015', 'Volkswagen', 'Up!', 'Move 1.0', 2015, 2015, 39900, 98200,
   'manual', 'flex', 'Branco', 4, '2',
   'VW Up! Move 1.0 2015 branco, manual, econômico.',
   'Volkswagen Up! Move 1.0 2015/2015 branco, câmbio manual, flex, com 98.200 km. Carro de baixo custo de manutenção, ideal para uso urbano.',
   'active', false, true, now()),

  ('a0000000-0000-4000-8000-000000000007', (SELECT id FROM dealerships WHERE slug = 'atomo-car'),
   'chevrolet-celta-life-ls-1-0-2010', 'Chevrolet', 'Celta', 'Life LS 1.0', 2010, 2010, 21900, 142300,
   'manual', 'flex', 'Prata', 4, '4',
   'Chevrolet Celta Life LS 1.0 2010 prata, manual.',
   'Chevrolet Celta Life LS 1.0 2010/2010 prata, câmbio manual, flex, com 142.300 km. Excelente custo-benefício, documentação em dia.',
   'sold', false, true, now())
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Imagens de capa (fotos servidas pelo próprio site em /assets)
-- ------------------------------------------------------------
DELETE FROM vehicle_images WHERE vehicle_id IN (
  'a0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000005','a0000000-0000-4000-8000-000000000006',
  'a0000000-0000-4000-8000-000000000007');

INSERT INTO vehicle_images (vehicle_id, storage_path, image_url, position, is_cover, sort_order)
VALUES
  ('a0000000-0000-4000-8000-000000000001', '', '/assets/jeep-renegade-2021.jpg',   'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000002', '', '/assets/honda-city-2020.jpg',      'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000003', '', '/assets/nissan-kicks-2018.jpg',    'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000004', '', '/assets/hyundai-hb20-2024.jpg',    'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000005', '', '/assets/ford-ka-2020.jpg',         'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000006', '', '/assets/vw-up-2015.jpg',           'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000007', '', '/assets/chevrolet-celta-2010.jpg', 'front_3_4', true, 0);

-- ------------------------------------------------------------
-- Opcionais
-- ------------------------------------------------------------
DELETE FROM vehicle_features WHERE vehicle_id IN (
  'a0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000005','a0000000-0000-4000-8000-000000000006',
  'a0000000-0000-4000-8000-000000000007');

INSERT INTO vehicle_features (vehicle_id, feature_name)
VALUES
  -- Jeep Renegade
  ('a0000000-0000-4000-8000-000000000001', 'Câmbio automático'),
  ('a0000000-0000-4000-8000-000000000001', 'Faróis de LED'),
  ('a0000000-0000-4000-8000-000000000001', 'Rodas de liga leve aro 18'),
  ('a0000000-0000-4000-8000-000000000001', 'Multimídia com Android Auto / CarPlay'),
  ('a0000000-0000-4000-8000-000000000001', 'Câmera de ré'),
  ('a0000000-0000-4000-8000-000000000001', 'Sensor de estacionamento'),
  ('a0000000-0000-4000-8000-000000000001', 'Controle de cruzeiro'),
  ('a0000000-0000-4000-8000-000000000001', 'Bancos em couro'),
  ('a0000000-0000-4000-8000-000000000001', 'Ar-condicionado dual zone'),
  -- Honda City
  ('a0000000-0000-4000-8000-000000000002', 'Câmbio CVT'),
  ('a0000000-0000-4000-8000-000000000002', 'Multimídia'),
  ('a0000000-0000-4000-8000-000000000002', 'Câmera de ré'),
  ('a0000000-0000-4000-8000-000000000002', 'Sensor de estacionamento'),
  ('a0000000-0000-4000-8000-000000000002', 'Faróis de neblina'),
  ('a0000000-0000-4000-8000-000000000002', 'Bancos em tecido premium'),
  ('a0000000-0000-4000-8000-000000000002', 'Controle de tração e estabilidade'),
  ('a0000000-0000-4000-8000-000000000002', 'Direção elétrica'),
  -- Nissan Kicks
  ('a0000000-0000-4000-8000-000000000003', 'Câmbio CVT'),
  ('a0000000-0000-4000-8000-000000000003', 'Direção elétrica'),
  ('a0000000-0000-4000-8000-000000000003', 'Multimídia'),
  ('a0000000-0000-4000-8000-000000000003', 'Câmera 360º'),
  ('a0000000-0000-4000-8000-000000000003', 'Chave presencial'),
  ('a0000000-0000-4000-8000-000000000003', 'Bancos em couro'),
  ('a0000000-0000-4000-8000-000000000003', 'Rodas de liga leve'),
  ('a0000000-0000-4000-8000-000000000003', 'Faróis de LED'),
  -- Hyundai HB20
  ('a0000000-0000-4000-8000-000000000004', 'Câmbio manual'),
  ('a0000000-0000-4000-8000-000000000004', 'Direção elétrica'),
  ('a0000000-0000-4000-8000-000000000004', 'Multimídia'),
  ('a0000000-0000-4000-8000-000000000004', 'Comandos de som no volante'),
  ('a0000000-0000-4000-8000-000000000004', 'Controle de estabilidade e tração'),
  ('a0000000-0000-4000-8000-000000000004', 'Ar-condicionado'),
  ('a0000000-0000-4000-8000-000000000004', 'Vidros e travas elétricos'),
  -- Ford Ka
  ('a0000000-0000-4000-8000-000000000005', 'Câmbio manual'),
  ('a0000000-0000-4000-8000-000000000005', 'Direção hidráulica'),
  ('a0000000-0000-4000-8000-000000000005', 'Multimídia SYNC'),
  ('a0000000-0000-4000-8000-000000000005', 'Ar-condicionado'),
  ('a0000000-0000-4000-8000-000000000005', 'Vidros e travas elétricos'),
  ('a0000000-0000-4000-8000-000000000005', 'Rodas de liga leve'),
  -- VW Up!
  ('a0000000-0000-4000-8000-000000000006', 'Câmbio manual'),
  ('a0000000-0000-4000-8000-000000000006', 'Direção hidráulica'),
  ('a0000000-0000-4000-8000-000000000006', 'Ar-condicionado'),
  ('a0000000-0000-4000-8000-000000000006', 'Vidros e travas elétricos'),
  ('a0000000-0000-4000-8000-000000000006', 'Computador de bordo'),
  ('a0000000-0000-4000-8000-000000000006', 'Som original'),
  -- Chevrolet Celta
  ('a0000000-0000-4000-8000-000000000007', 'Câmbio manual'),
  ('a0000000-0000-4000-8000-000000000007', 'Direção mecânica'),
  ('a0000000-0000-4000-8000-000000000007', 'Vidros elétricos dianteiros'),
  ('a0000000-0000-4000-8000-000000000007', 'Trio elétrico'),
  ('a0000000-0000-4000-8000-000000000007', 'Som original');
