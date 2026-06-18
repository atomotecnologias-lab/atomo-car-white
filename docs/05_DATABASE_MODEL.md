# 05_DATABASE_MODEL.md

# Modelagem de Banco de Dados

## Objetivo

Definir a estrutura principal de dados do Primos Cockpit.

A modelagem deve atender:

* MVP funcional;
* sincronização entre painel e site;
* upload de imagens;
* escalabilidade futura.

---

# Tabela: dealerships

Representa uma revenda.

Mesmo existindo apenas uma loja inicialmente, toda estrutura deve considerar múltiplas revendas futuramente.

## Campos

| Campo      | Tipo      |
| ---------- | --------- |
| id         | uuid      |
| name       | text      |
| slug       | text      |
| phone      | text      |
| email      | text      |
| city       | text      |
| state      | text      |
| created_at | timestamp |

---

# Tabela: users

Usuários do sistema.

## Campos

| Campo         | Tipo      |
| ------------- | --------- |
| id            | uuid      |
| dealership_id | uuid      |
| name          | text      |
| email         | text      |
| role          | text      |
| active        | boolean   |
| created_at    | timestamp |

---

# Roles

Valores possíveis:

```txt
admin
manager
seller
```

---

# Tabela: vehicles

Tabela principal do sistema.

Representa um veículo cadastrado.

## Campos

| Campo            | Tipo      |
| ---------------- | --------- |
| id               | uuid      |
| dealership_id    | uuid      |
| created_by       | uuid      |
| brand            | text      |
| model            | text      |
| version          | text      |
| year_manufacture | integer   |
| year_model       | integer   |
| mileage          | integer   |
| price            | numeric   |
| color            | text      |
| transmission     | text      |
| fuel_type        | text      |
| doors            | integer   |
| plate            | text      |
| description      | text      |
| featured         | boolean   |
| status           | text      |
| published_at     | timestamp |
| created_at       | timestamp |
| updated_at       | timestamp |

---

# Status do Veículo

```txt
draft
published
reserved
sold
archived
```

---

# Tabela: vehicle_images

Imagens dos veículos.

Separada da tabela principal.

## Campos

| Campo        | Tipo      |
| ------------ | --------- |
| id           | uuid      |
| vehicle_id   | uuid      |
| storage_path | text      |
| image_url    | text      |
| is_cover     | boolean   |
| sort_order   | integer   |
| created_at   | timestamp |

---

# Regras

Um veículo pode possuir várias imagens.

Uma imagem pode ser definida como capa.

A ordenação deve ser controlada por:

```txt
sort_order
```

---

# Tabela: vehicle_features

Opcionais e acessórios.

Permite flexibilidade.

## Campos

| Campo        | Tipo |
| ------------ | ---- |
| id           | uuid |
| vehicle_id   | uuid |
| feature_name | text |

---

# Exemplos

```txt
Ar Condicionado

Direção Elétrica

Multimídia

Banco em Couro

Teto Solar

Piloto Automático
```

---

# Tabela: leads

Preparação para CRM.

Não é prioridade do MVP.

## Campos

| Campo         | Tipo      |
| ------------- | --------- |
| id            | uuid      |
| dealership_id | uuid      |
| vehicle_id    | uuid      |
| name          | text      |
| phone         | text      |
| email         | text      |
| source        | text      |
| status        | text      |
| created_at    | timestamp |

---

# Status de Lead

```txt
new
contacted
negotiation
proposal
won
lost
```

---

# Tabela: lead_activities

Histórico de interação.

Preparação futura.

## Campos

| Campo         | Tipo      |
| ------------- | --------- |
| id            | uuid      |
| lead_id       | uuid      |
| activity_type | text      |
| notes         | text      |
| created_at    | timestamp |

---

# Relacionamentos

```txt
dealerships

└── users

└── vehicles
        ├── vehicle_images
        ├── vehicle_features
        └── leads
                └── lead_activities
```

---

# Índices Recomendados

## vehicles

Criar índices para:

```sql
brand
model
status
featured
created_at
```

---

## leads

Criar índices para:

```sql
status
vehicle_id
created_at
```

---

# Campos Utilizados no Site Público

A listagem pública deverá consumir:

```txt
brand
model
version
year_model
mileage
price
cover_image
status
```

Apenas veículos:

```txt
status = published
```

---

# Campos Utilizados na Página Individual

Além dos dados básicos:

```txt
description

vehicle_features

vehicle_images
```

---

# Storage

Bucket:

```txt
vehicles
```

Estrutura recomendada:

```txt
vehicles/

vehicle-id/

01.jpg
02.jpg
03.jpg
04.jpg
```

---

# Preparação para IA

Futuros campos possíveis:

```txt
ai_description

ai_tags

ai_score

market_price_estimate

stock_health_score
```

Não implementar agora.

Apenas considerar na arquitetura.

---

# Regras de Negócio

Um veículo só pode ser publicado quando possuir:

* marca
* modelo
* versão
* ano
* preço
* pelo menos uma imagem

---

# Critério de Sucesso

A modelagem será considerada correta quando:

1. O veículo puder ser salvo.
2. As imagens puderem ser vinculadas.
3. O site conseguir listar veículos.
4. A página individual conseguir carregar todas as informações.
5. O sistema estiver preparado para expansão futura sem necessidade de refatoração estrutural.
