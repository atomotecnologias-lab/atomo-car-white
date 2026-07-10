-- ============================================================
-- Atomo Car — Migration 013 — RESET + SEED da demo guiada
-- Idempotente e "evergreen": datas relativas a CURRENT_DATE.
-- Rode no SQL Editor do Supabase sempre que quiser restaurar a
-- demo a um estado pristino e ATUAL (substitui os seeds 004/007).
--
-- Preserva: dealerships, team_members, dealership_settings, auth.users.
-- Zera e repõe: vehicles + imagens/opcionais/aquisições/custos,
--               sales, financial_entries, audit_log, leads.
--
-- Pré-requisito: migrations 001–012 aplicadas.
-- ============================================================

-- ============================================================
-- SEÇÃO A — LIMPEZA (só o operacional da loja atomo-car)
-- ============================================================
DO $$
DECLARE dsid UUID;
BEGIN
  SELECT id INTO dsid FROM dealerships WHERE slug = 'atomo-car' LIMIT 1;
  IF dsid IS NULL THEN
    RAISE EXCEPTION 'Loja atomo-car não encontrada. Rode a migration 004 antes.';
  END IF;

  DELETE FROM audit_log            WHERE dealership_id = dsid;
  -- leads / lead_activities podem não existir neste banco — guardas defensivas
  IF to_regclass('public.lead_activities') IS NOT NULL THEN
    DELETE FROM lead_activities WHERE lead_id IN (SELECT id FROM leads WHERE dealership_id = dsid);
  END IF;
  IF to_regclass('public.leads') IS NOT NULL THEN
    DELETE FROM leads WHERE dealership_id = dsid;
  END IF;
  DELETE FROM financial_entries    WHERE dealership_id = dsid;
  DELETE FROM sales                WHERE dealership_id = dsid;
  DELETE FROM vehicle_costs        WHERE dealership_id = dsid;
  DELETE FROM vehicle_acquisitions WHERE vehicle_id IN (SELECT id FROM vehicles WHERE dealership_id = dsid);
  DELETE FROM vehicle_images       WHERE vehicle_id IN (SELECT id FROM vehicles WHERE dealership_id = dsid);
  DELETE FROM vehicle_features     WHERE vehicle_id IN (SELECT id FROM vehicles WHERE dealership_id = dsid);
  DELETE FROM vehicles             WHERE dealership_id = dsid;
END $$;

-- ============================================================
-- SEÇÃO B — SEED
-- ============================================================

-- ------------------------------------------------------------
-- B1) Veículos NO PÁTIO (6 publicados, com foto) + Celta (vendido)
--     aging via acquired_at = CURRENT_DATE - N
-- ------------------------------------------------------------
INSERT INTO vehicles (id, dealership_id, slug, brand, model, version, year_manufacture, year_model,
                      price, mileage, transmission, fuel_type, color, doors, plate_final,
                      description_short, description_full, status, is_featured, is_published, published_at,
                      acquired_at, acquisition_source, preparation_status)
SELECT v.id::uuid, d.id, v.slug, v.brand, v.model, v.version, v.ym, v.ym,
       v.price, v.km, v.trans, 'flex', v.color, 4, v.plate,
       v.dshort, v.dfull, v.status, v.feat, v.pub,
       CASE WHEN v.pub THEN now() ELSE NULL END,
       (CURRENT_DATE - v.acq_days), v.acq_src, v.prep
FROM dealerships d,
  (VALUES
    ('a0000000-0000-4000-8000-000000000001','jeep-renegade-longitude-1-8-2021','Jeep','Renegade','Longitude 1.8',2021,109900,62400,'automatic','Branco','7',
      'Jeep Renegade Longitude 1.8 2021 branco, automático, único dono.',
      'Jeep Renegade Longitude 1.8 2021/2021 na cor branca, câmbio automático, flex, 62.400 km. Único dono, revisões em concessionária, laudo cautelar aprovado. Aceitamos troca e financiamento.',
      'active',true,true,18,'own_purchase','ready'),
    ('a0000000-0000-4000-8000-000000000002','honda-city-personal-1-5-2020','Honda','City','Personal 1.5',2020,89900,71200,'cvt','Preto','3',
      'Honda City Personal 1.5 2020 preto, CVT, segundo dono.',
      'Honda City Personal 1.5 2020/2020 preto, câmbio CVT, flex, 71.200 km. Segundo dono, revisões realizadas, ótimo estado.',
      'active',true,true,33,'trade_in','ready'),
    ('a0000000-0000-4000-8000-000000000004','hyundai-hb20-comfort-2024','Hyundai','HB20','Comfort 1.0',2024,74900,18700,'manual','Prata','5',
      'Hyundai HB20 Comfort 2024 prata, manual, baixíssima km.',
      'Hyundai HB20 Comfort 1.0 2024/2024 prata, câmbio manual, flex, 18.700 km. Garantia de fábrica vigente, único dono.',
      'active',true,true,25,'own_purchase','ready'),
    ('a0000000-0000-4000-8000-000000000005','ford-ka-se-1-0-2020','Ford','Ka','SE 1.0',2020,58900,67800,'manual','Cinza','9',
      'Ford Ka SE 1.0 2020 cinza, manual, econômico.',
      'Ford Ka SE 1.0 2020/2020 cinza, câmbio manual, flex, 67.800 km. Revisões em dia, ótimo para o dia a dia.',
      'active',false,true,58,'consignment','ready'),
    ('a0000000-0000-4000-8000-000000000003','nissan-kicks-sl-2018','Nissan','Kicks','SL 1.6',2018,86900,84500,'cvt','Vermelho','1',
      'Nissan Kicks SL 2018 vermelho, CVT, câmera 360º.',
      'Nissan Kicks SL 2018/2018 vermelho, câmbio CVT, flex, 84.500 km. Segundo dono, chave presencial, câmera 360º, multimídia, bancos em couro.',
      'active',true,true,72,'own_purchase','ready'),
    ('a0000000-0000-4000-8000-000000000006','volkswagen-up-move-1-0-2015','Volkswagen','Up!','Move 1.0',2015,39900,98200,'manual','Branco','2',
      'VW Up! Move 1.0 2015 branco, manual, econômico.',
      'Volkswagen Up! Move 1.0 2015/2015 branco, câmbio manual, flex, 98.200 km. Baixo custo de manutenção, ideal para uso urbano.',
      'active',false,true,128,'own_purchase','ready'),
    -- Celta: VENDIDO (com foto, aparece na lista de vendas)
    ('a0000000-0000-4000-8000-000000000007','chevrolet-celta-life-ls-1-0-2010','Chevrolet','Celta','Life LS 1.0',2010,21900,142300,'manual','Prata','4',
      'Chevrolet Celta Life LS 1.0 2010 prata, manual.',
      'Chevrolet Celta Life LS 1.0 2010/2010 prata, câmbio manual, flex, 142.300 km. Excelente custo-benefício.',
      'sold',false,false,40,'own_purchase','ready')
  ) AS v(id,slug,brand,model,version,ym,price,km,trans,color,plate,dshort,dfull,status,feat,pub,acq_days,acq_src,prep)
WHERE d.slug = 'atomo-car';

-- ------------------------------------------------------------
-- B2) Veículos VENDIDOS históricos (sem foto) — alimentam gráficos/vendas
--     sold_at é definido em B6; aqui só o cadastro.
-- ------------------------------------------------------------
INSERT INTO vehicles (id, dealership_id, slug, brand, model, version, year_manufacture, year_model,
                      price, mileage, transmission, fuel_type, color, status, is_published,
                      acquired_at, acquisition_source)
SELECT v.id::uuid, d.id, v.slug, v.brand, v.model, v.version, v.ym, v.ym,
       v.price, v.km, v.trans, 'flex', v.color, 'sold', false,
       (CURRENT_DATE - v.acq_days), 'own_purchase'
FROM dealerships d,
  (VALUES
    ('c0000000-0000-4000-8000-000000000001','fiat-argo-drive-1-0-hist','Fiat','Argo','Drive 1.0',2019,52900,58200,'manual','Prata',175),
    ('c0000000-0000-4000-8000-000000000002','chevrolet-onix-lt-1-0-hist','Chevrolet','Onix','LT 1.0',2018,54900,64100,'manual','Branco',172),
    ('c0000000-0000-4000-8000-000000000003','volkswagen-gol-1-6-hist','Volkswagen','Gol','1.6 MSI',2017,45900,78300,'manual','Vermelho',140),
    ('c0000000-0000-4000-8000-000000000004','toyota-corolla-xei-hist','Toyota','Corolla','XEi 2.0',2016,84900,89500,'automatic','Prata',110),
    ('c0000000-0000-4000-8000-000000000005','honda-fit-lx-hist','Honda','Fit','LX 1.5',2017,62900,71800,'cvt','Cinza',82),
    ('c0000000-0000-4000-8000-000000000006','renault-sandero-expression-hist','Renault','Sandero','Expression',2019,42900,55400,'manual','Branco',80),
    ('c0000000-0000-4000-8000-000000000007','hyundai-creta-attitude-hist','Hyundai','Creta','Attitude 1.6',2018,79900,67200,'automatic','Preto',52),
    ('c0000000-0000-4000-8000-000000000008','fiat-toro-freedom-hist','Fiat','Toro','Freedom 1.8',2019,96900,61900,'automatic','Cinza',30)
  ) AS v(id,slug,brand,model,version,ym,price,km,trans,color,acq_days)
WHERE d.slug = 'atomo-car';

-- ------------------------------------------------------------
-- B3) Imagens de capa (7 fotos servidas de /assets)
-- ------------------------------------------------------------
INSERT INTO vehicle_images (vehicle_id, storage_path, image_url, position, is_cover, sort_order)
VALUES
  ('a0000000-0000-4000-8000-000000000001','', '/assets/jeep-renegade-2021.jpg',   'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000002','', '/assets/honda-city-2020.jpg',      'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000004','', '/assets/hyundai-hb20-2024.jpg',    'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000005','', '/assets/ford-ka-2020.jpg',         'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000003','', '/assets/nissan-kicks-2018.jpg',    'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000006','', '/assets/vw-up-2015.jpg',           'front_3_4', true, 0),
  ('a0000000-0000-4000-8000-000000000007','', '/assets/chevrolet-celta-2010.jpg', 'front_3_4', true, 0);

-- ------------------------------------------------------------
-- B4) Opcionais (só carros com foto)
-- ------------------------------------------------------------
INSERT INTO vehicle_features (vehicle_id, feature_name)
VALUES
  ('a0000000-0000-4000-8000-000000000001','Câmbio automático'),
  ('a0000000-0000-4000-8000-000000000001','Faróis de LED'),
  ('a0000000-0000-4000-8000-000000000001','Rodas de liga leve aro 18'),
  ('a0000000-0000-4000-8000-000000000001','Multimídia com Android Auto / CarPlay'),
  ('a0000000-0000-4000-8000-000000000001','Câmera de ré'),
  ('a0000000-0000-4000-8000-000000000001','Sensor de estacionamento'),
  ('a0000000-0000-4000-8000-000000000001','Controle de cruzeiro'),
  ('a0000000-0000-4000-8000-000000000001','Bancos em couro'),
  ('a0000000-0000-4000-8000-000000000001','Ar-condicionado dual zone'),
  ('a0000000-0000-4000-8000-000000000002','Câmbio CVT'),
  ('a0000000-0000-4000-8000-000000000002','Multimídia'),
  ('a0000000-0000-4000-8000-000000000002','Câmera de ré'),
  ('a0000000-0000-4000-8000-000000000002','Sensor de estacionamento'),
  ('a0000000-0000-4000-8000-000000000002','Direção elétrica'),
  ('a0000000-0000-4000-8000-000000000004','Câmbio manual'),
  ('a0000000-0000-4000-8000-000000000004','Direção elétrica'),
  ('a0000000-0000-4000-8000-000000000004','Multimídia'),
  ('a0000000-0000-4000-8000-000000000004','Ar-condicionado'),
  ('a0000000-0000-4000-8000-000000000004','Vidros e travas elétricos'),
  ('a0000000-0000-4000-8000-000000000005','Câmbio manual'),
  ('a0000000-0000-4000-8000-000000000005','Direção hidráulica'),
  ('a0000000-0000-4000-8000-000000000005','Multimídia SYNC'),
  ('a0000000-0000-4000-8000-000000000005','Ar-condicionado'),
  ('a0000000-0000-4000-8000-000000000003','Câmbio CVT'),
  ('a0000000-0000-4000-8000-000000000003','Câmera 360º'),
  ('a0000000-0000-4000-8000-000000000003','Chave presencial'),
  ('a0000000-0000-4000-8000-000000000003','Bancos em couro'),
  ('a0000000-0000-4000-8000-000000000003','Faróis de LED'),
  ('a0000000-0000-4000-8000-000000000006','Câmbio manual'),
  ('a0000000-0000-4000-8000-000000000006','Ar-condicionado'),
  ('a0000000-0000-4000-8000-000000000006','Vidros e travas elétricos'),
  ('a0000000-0000-4000-8000-000000000007','Câmbio manual'),
  ('a0000000-0000-4000-8000-000000000007','Trio elétrico');

-- ------------------------------------------------------------
-- B5) Aquisições (todos os veículos)
-- ------------------------------------------------------------
INSERT INTO vehicle_acquisitions (vehicle_id, acquisition_price, supplier_name) VALUES
  ('a0000000-0000-4000-8000-000000000001', 92000, 'Compra particular — anúncio'),
  ('a0000000-0000-4000-8000-000000000002', 75500, 'Troca — cliente João Batista'),
  ('a0000000-0000-4000-8000-000000000004', 63500, 'Compra particular — indicação'),
  ('a0000000-0000-4000-8000-000000000005', 48500, 'Consignação — Roberto Lima'),
  ('a0000000-0000-4000-8000-000000000003', 72000, 'Leilão Sodré Santoro'),
  ('a0000000-0000-4000-8000-000000000006', 32800, 'Compra particular — anúncio'),
  ('a0000000-0000-4000-8000-000000000007', 17500, 'Compra particular'),
  ('c0000000-0000-4000-8000-000000000001', 44000, NULL),
  ('c0000000-0000-4000-8000-000000000002', 47500, NULL),
  ('c0000000-0000-4000-8000-000000000003', 38000, NULL),
  ('c0000000-0000-4000-8000-000000000004', 74000, NULL),
  ('c0000000-0000-4000-8000-000000000005', 54500, NULL),
  ('c0000000-0000-4000-8000-000000000006', 37800, NULL),
  ('c0000000-0000-4000-8000-000000000007', 68000, NULL),
  ('c0000000-0000-4000-8000-000000000008', 84000, NULL);

-- ------------------------------------------------------------
-- B6) Custos de preparação (incurred_at = CURRENT_DATE - N)
-- ------------------------------------------------------------
INSERT INTO vehicle_costs (dealership_id, vehicle_id, cost_type, amount, description, supplier, incurred_at)
SELECT d.id, c.vid::uuid, c.ctype, c.amount, c.descr, c.supplier, (CURRENT_DATE - c.days)
FROM dealerships d,
  (VALUES
    -- Jeep (total 2.480)
    ('a0000000-0000-4000-8000-000000000001','washing',250,'Lavagem detalhada + higienização','Estética JS',16),
    ('a0000000-0000-4000-8000-000000000001','documentation',780,'Transferência + vistoria','Despachante Küster',14),
    ('a0000000-0000-4000-8000-000000000001','mechanical',1450,'Revisão + pastilhas de freio','Oficina do Marcos',11),
    -- City (800)
    ('a0000000-0000-4000-8000-000000000002','washing',180,'Lavagem completa','Estética JS',31),
    ('a0000000-0000-4000-8000-000000000002','documentation',620,'Transferência','Despachante Küster',28),
    -- HB20 (740)
    ('a0000000-0000-4000-8000-000000000004','washing',150,'Lavagem completa','Estética JS',23),
    ('a0000000-0000-4000-8000-000000000004','documentation',590,'Transferência','Despachante Küster',21),
    -- Ka (2.840)
    ('a0000000-0000-4000-8000-000000000005','bodywork',1650,'Reparo porta dianteira direita','Funilaria Beto',55),
    ('a0000000-0000-4000-8000-000000000005','washing',180,'Lavagem completa','Estética JS',53),
    ('a0000000-0000-4000-8000-000000000005','documentation',590,'Transferência','Despachante Küster',52),
    ('a0000000-0000-4000-8000-000000000005','accessories',420,'Jogo de tapetes + película','Acessórios Center',49),
    -- Kicks (4.990)
    ('a0000000-0000-4000-8000-000000000003','mechanical',2350,'Suspensão dianteira + alinhamento','Oficina do Marcos',70),
    ('a0000000-0000-4000-8000-000000000003','painting',1800,'Pintura para-choque traseiro','Funilaria Beto',66),
    ('a0000000-0000-4000-8000-000000000003','documentation',620,'Transferência','Despachante Küster',68),
    ('a0000000-0000-4000-8000-000000000003','washing',220,'Polimento + lavagem','Estética JS',64),
    -- Up! (3.770) — parado e caro
    ('a0000000-0000-4000-8000-000000000006','mechanical',1850,'Embreagem completa','Oficina do Marcos',125),
    ('a0000000-0000-4000-8000-000000000006','painting',950,'Retoque capô + teto','Funilaria Beto',120),
    ('a0000000-0000-4000-8000-000000000006','documentation',520,'Transferência','Despachante Küster',124),
    ('a0000000-0000-4000-8000-000000000006','washing',150,'Lavagem completa','Estética JS',118),
    ('a0000000-0000-4000-8000-000000000006','other',300,'Chaveiro — cópia de chave',NULL,110),
    -- Celta (950)
    ('a0000000-0000-4000-8000-000000000007','mechanical',500,'Troca de óleo + filtros','Oficina do Marcos',28),
    ('a0000000-0000-4000-8000-000000000007','documentation',450,'Transferência','Despachante Küster',24),
    -- Históricos (2 cada, somam o snapshot da venda)
    ('c0000000-0000-4000-8000-000000000001','documentation',450,'Transferência','Despachante Küster',165),
    ('c0000000-0000-4000-8000-000000000001','mechanical',1350,'Revisão geral','Oficina do Marcos',160),
    ('c0000000-0000-4000-8000-000000000002','documentation',450,'Transferência','Despachante Küster',163),
    ('c0000000-0000-4000-8000-000000000002','accessories',800,'Multimídia + tapetes','Acessórios Center',158),
    ('c0000000-0000-4000-8000-000000000003','painting',1650,'Pintura lateral esquerda','Funilaria Beto',135),
    ('c0000000-0000-4000-8000-000000000003','documentation',450,'Transferência','Despachante Küster',130),
    ('c0000000-0000-4000-8000-000000000004','mechanical',2500,'Correia dentada + revisão','Oficina do Marcos',105),
    ('c0000000-0000-4000-8000-000000000004','documentation',450,'Transferência','Despachante Küster',100),
    ('c0000000-0000-4000-8000-000000000005','mechanical',980,'Revisão + freios','Oficina do Marcos',78),
    ('c0000000-0000-4000-8000-000000000005','accessories',620,'Película + tapetes','Acessórios Center',73),
    ('c0000000-0000-4000-8000-000000000006','bodywork',1000,'Reparo para-lama','Funilaria Beto',76),
    ('c0000000-0000-4000-8000-000000000006','documentation',450,'Transferência','Despachante Küster',71),
    ('c0000000-0000-4000-8000-000000000007','mechanical',1750,'Suspensão + revisão','Oficina do Marcos',48),
    ('c0000000-0000-4000-8000-000000000007','accessories',650,'Engate + tapetes','Acessórios Center',43),
    ('c0000000-0000-4000-8000-000000000008','painting',2300,'Pintura caçamba + capô','Funilaria Beto',20),
    ('c0000000-0000-4000-8000-000000000008','washing',220,'Polimento','Estética JS',15),
    ('c0000000-0000-4000-8000-000000000008','documentation',680,'Transferência + vistoria','Despachante Küster',12)
  ) AS c(vid,ctype,amount,descr,supplier,days)
WHERE d.slug = 'atomo-car';

-- ------------------------------------------------------------
-- B7) VENDAS (9) — evergreen; mo = meses atrás, dy = dia no mês
--     sold_at limitado a hoje (LEAST). Comissão 5% s/ lucro.
--     Métodos variados; documento/entrada/troca preenchidos.
-- ------------------------------------------------------------
INSERT INTO sales (id, dealership_id, vehicle_id, seller_id, buyer_name, buyer_phone, buyer_document,
                   sale_price, sold_at, payment_method, down_payment, trade_in_value,
                   acquisition_price_snapshot, costs_total_snapshot,
                   commission_type_snapshot, commission_base_snapshot, commission_value_snapshot,
                   commission_amount)
SELECT s.id::uuid, d.id, s.vid::uuid, s.seller::uuid, s.buyer, s.phone, s.doc,
       s.price,
       LEAST((date_trunc('month', CURRENT_DATE) - (s.mo || ' months')::interval + (s.dy - 1) * interval '1 day')::date, CURRENT_DATE),
       s.pay, s.down, s.trade,
       s.acq, s.costs, 'percent', 'profit', 5.0, s.comm
FROM dealerships d,
  (VALUES
    -- id, vehicle, seller, buyer, phone, doc, price, pay, down, trade, acq, costs, comm, mo, dy
    ('ac000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000002','Marcelo Souza',    '(47) 99911-2233','052.114.339-20', 52900, 'pix',       0,     0,     44000, 1800, 355.00, 5, 6),
    ('ac000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000003','Fernanda Costa',   '(47) 99922-3344','318.552.107-88', 54900, 'cash',      0,     0,     47500, 1250, 307.50, 5, 18),
    ('ac000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000003','b0000000-0000-4000-8000-000000000002','João Pedro Ramos', '(47) 99933-4455','905.221.663-04', 45900, 'financing', 0,     0,     38000, 2100, 290.00, 4, 9),
    ('ac000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000004','b0000000-0000-4000-8000-000000000003','Ricardo Alves',    '(47) 99944-5566','412.889.556-71', 84900, 'trade_in',  0,     30000, 74000, 2950, 397.50, 3, 14),
    ('ac000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000005','b0000000-0000-4000-8000-000000000002','Juliana Martins',  '(47) 99955-6677','223.447.180-59', 62900, 'pix',       0,     0,     54500, 1600, 340.00, 2, 8),
    ('ac000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000006','b0000000-0000-4000-8000-000000000003','André Luiz Silva', '(47) 99966-7788','667.301.229-13', 42900, 'financing', 0,     0,     37800, 1450, 182.50, 2, 20),
    ('ac000000-0000-4000-8000-000000000007','c0000000-0000-4000-8000-000000000007','b0000000-0000-4000-8000-000000000002','Patrícia Gomes',   '(47) 99977-8899','780.556.442-90', 79900, 'financing', 15000, 0,     68000, 2400, 475.00, 1, 12),
    ('ac000000-0000-4000-8000-000000000008','c0000000-0000-4000-8000-000000000008','b0000000-0000-4000-8000-000000000003','Eduardo Ferreira', '(47) 99988-9900','334.902.117-46', 96900, 'mixed',     25000, 0,     84000, 3200, 485.00, 0, 5),
    ('ac000000-0000-4000-8000-000000000009','a0000000-0000-4000-8000-000000000007','b0000000-0000-4000-8000-000000000002','Luciana Ribeiro',  '(47) 99900-1122','119.774.508-32', 21900, 'cash',      0,     0,     17500, 950,  172.50, 0, 9)
  ) AS s(id,vid,seller,buyer,phone,doc,price,pay,down,trade,acq,costs,comm,mo,dy)
WHERE d.slug = 'atomo-car';

-- ------------------------------------------------------------
-- B8) RECEBÍVEIS das vendas
--   8a) as 7 quitadas (single, pago) — amount = venda − troca
-- ------------------------------------------------------------
INSERT INTO financial_entries (dealership_id, kind, category, description, amount, due_date, paid_at, vehicle_id, sale_id)
SELECT s.dealership_id, 'receivable', 'vehicle_sale',
       'Venda ' || v.brand || ' ' || v.model || ' — ' || s.buyer_name,
       (s.sale_price - s.trade_in_value), s.sold_at, LEAST(s.sold_at + 2, CURRENT_DATE),
       s.vehicle_id, s.id
FROM sales s
JOIN vehicles v ON v.id = s.vehicle_id
WHERE s.dealership_id = (SELECT id FROM dealerships WHERE slug = 'atomo-car' LIMIT 1)
  AND s.id NOT IN ('ac000000-0000-4000-8000-000000000007','ac000000-0000-4000-8000-000000000008');

--   8b) Creta (financiada, mês -1): entrada paga + restante ATRASADO
INSERT INTO financial_entries (dealership_id, kind, category, description, amount, due_date, paid_at, vehicle_id, sale_id)
SELECT d.id, 'receivable', 'down_payment', 'Entrada Hyundai Creta — Patrícia Gomes', 15000,
       (CURRENT_DATE - 30), (CURRENT_DATE - 30),
       'c0000000-0000-4000-8000-000000000007', 'ac000000-0000-4000-8000-000000000007'
FROM dealerships d WHERE d.slug = 'atomo-car';
INSERT INTO financial_entries (dealership_id, kind, category, description, amount, due_date, paid_at, vehicle_id, sale_id)
SELECT d.id, 'receivable', 'installment_income', 'A receber (financiado) Hyundai Creta — Patrícia Gomes', 64900,
       (CURRENT_DATE - 6), NULL,
       'c0000000-0000-4000-8000-000000000007', 'ac000000-0000-4000-8000-000000000007'
FROM dealerships d WHERE d.slug = 'atomo-car';

--   8c) Toro (mista, mês atual): entrada paga + restante EM ABERTO (a vencer)
INSERT INTO financial_entries (dealership_id, kind, category, description, amount, due_date, paid_at, vehicle_id, sale_id)
SELECT d.id, 'receivable', 'down_payment', 'Entrada Fiat Toro — Eduardo Ferreira', 25000,
       (CURRENT_DATE - 4), (CURRENT_DATE - 4),
       'c0000000-0000-4000-8000-000000000008', 'ac000000-0000-4000-8000-000000000008'
FROM dealerships d WHERE d.slug = 'atomo-car';
INSERT INTO financial_entries (dealership_id, kind, category, description, amount, due_date, paid_at, vehicle_id, sale_id)
SELECT d.id, 'receivable', 'installment_income', 'A receber (financiado) Fiat Toro — Eduardo Ferreira', 71900,
       (CURRENT_DATE + 22), NULL,
       'c0000000-0000-4000-8000-000000000008', 'ac000000-0000-4000-8000-000000000008'
FROM dealerships d WHERE d.slug = 'atomo-car';

-- ------------------------------------------------------------
-- B9) COMISSÕES (derivadas das vendas)
--     vendas até -2 meses = pagas; -1 mês e mês atual = EM ABERTO
-- ------------------------------------------------------------
INSERT INTO financial_entries (dealership_id, kind, category, description, amount, due_date, paid_at, sale_id, team_member_id)
SELECT s.dealership_id, 'payable', 'commission',
       'Comissão ' || tm.name || ' — ' || v.brand || ' ' || v.model,
       s.commission_amount,
       (date_trunc('month', s.sold_at) + interval '1 month' - interval '1 day')::date,
       CASE WHEN s.sold_at < (date_trunc('month', CURRENT_DATE) - interval '1 month')
            THEN LEAST((date_trunc('month', s.sold_at) + interval '1 month' + interval '4 days')::date, CURRENT_DATE)
            ELSE NULL END,
       s.id, s.seller_id
FROM sales s
JOIN vehicles v ON v.id = s.vehicle_id
JOIN team_members tm ON tm.id = s.seller_id
WHERE s.dealership_id = (SELECT id FROM dealerships WHERE slug = 'atomo-car' LIMIT 1)
  AND s.commission_amount > 0;

-- ------------------------------------------------------------
-- B10) DESPESAS FIXAS MENSAIS — últimos 5 meses fechados, PAGAS
--      (via generate_series; alimentam o fluxo de caixa)
-- ------------------------------------------------------------
INSERT INTO financial_entries (dealership_id, kind, category, description, amount, due_date, paid_at)
SELECT d.id, 'payable', x.cat,
       x.descr || ' — ' || to_char(m.month, 'MM/YYYY'),
       x.amount,
       (m.month + (x.day - 1) * interval '1 day')::date,
       (m.month + (x.day - 1) * interval '1 day')::date
FROM dealerships d
CROSS JOIN generate_series(
        date_trunc('month', CURRENT_DATE) - interval '5 months',
        date_trunc('month', CURRENT_DATE) - interval '1 month',
        interval '1 month') AS m(month)
CROSS JOIN (VALUES
        ('rent',      'Aluguel do pátio',        4500, 10),
        ('utilities', 'Energia elétrica',         540, 15),
        ('marketing', 'Impulsionamento redes',    800,  5),
        ('other',     'Honorários contador',      650, 20)
     ) AS x(cat, descr, amount, day)
WHERE d.slug = 'atomo-car';

-- ------------------------------------------------------------
-- B11) CONTAS ABERTAS DO MÊS (Atenção hoje / a vencer / vencida)
-- ------------------------------------------------------------
INSERT INTO financial_entries (dealership_id, kind, category, description, amount, due_date, paid_at)
SELECT d.id, 'payable', f.cat, f.descr, f.amount, f.due, NULL
FROM dealerships d,
  (VALUES
    ('rent',     'Aluguel do pátio — mês atual',      4500::numeric, (date_trunc('month', CURRENT_DATE) + interval '9 days')::date),
    ('supplier', 'Estética JS — mensalidade',          890::numeric, (CURRENT_DATE - 5)),   -- VENCIDA
    ('supplier', 'Auto Peças Silva — fatura 1042',    2380::numeric, (CURRENT_DATE + 4)),   -- a vencer (7d)
    ('taxes',    'IPVA frota — parcela 4/6',          1240::numeric, (CURRENT_DATE + 8))    -- a vencer
  ) AS f(cat, descr, amount, due)
WHERE d.slug = 'atomo-car';

-- ------------------------------------------------------------
-- B12) AUDITORIA — backdrop (~10 ações recentes, autores reais)
-- ------------------------------------------------------------
INSERT INTO audit_log (dealership_id, actor_name, action, entity_type, entity_id, vehicle_id, summary, created_at)
SELECT d.id, a.actor, a.action, a.etype, NULLIF(a.eid,'')::uuid, NULLIF(a.vid,'')::uuid, a.summary, (now() - a.ago::interval)
FROM dealerships d,
  (VALUES
    ('Carlos Mendes','create','sale','ac000000-0000-4000-8000-000000000009','a0000000-0000-4000-8000-000000000007','Registrou a venda de Chevrolet Celta para Luciana Ribeiro por R$ 21.900,00','3 hours'),
    ('Ana Paula',    'create','sale','ac000000-0000-4000-8000-000000000008','c0000000-0000-4000-8000-000000000008','Registrou a venda de Fiat Toro para Eduardo Ferreira por R$ 96.900,00','6 hours'),
    ('Administrador','pay','entry','','','Recebeu “Entrada Fiat Toro — Eduardo Ferreira” (R$ 25.000,00)','5 hours'),
    ('Administrador','create','entry','','','Lançou conta a pagar “IPVA frota — parcela 4/6” de R$ 1.240,00','1 day 2 hours'),
    ('Administrador','update','entry','','','Editou o lançamento “Aluguel do pátio — mês atual” — R$ 4.500,00','1 day 5 hours'),
    ('Carlos Mendes','create','cost','','a0000000-0000-4000-8000-000000000001','Lançou custo de Mecânica — R$ 1.450,00','2 days'),
    ('Administrador','update','acquisition','','a0000000-0000-4000-8000-000000000006','Definiu valor de aquisição em R$ 32.800,00','3 days'),
    ('Ana Paula',    'pay','entry','','','Recebeu “Venda Honda Fit LX — Juliana Martins” (R$ 62.900,00)','3 days 4 hours'),
    ('Administrador','create','entry','','','Lançou conta a pagar “Auto Peças Silva — fatura 1042” de R$ 2.380,00','4 days'),
    ('Carlos Mendes','create','cost','','a0000000-0000-4000-8000-000000000003','Lançou custo de Pintura — R$ 1.800,00','5 days')
  ) AS a(actor, action, etype, eid, vid, summary, ago)
WHERE d.slug = 'atomo-car';
