# 03_CURRENT_STATE_AUDIT.md

# Auditoria do Estado Atual

**Data:** 2026-06-16
**Auditor:** Claude Code

---

# 1. Stack Identificada

| Camada        | Tecnologia                        |
| ------------- | --------------------------------- |
| Framework     | TanStack Start (full-stack React) |
| Frontend      | React 19.2.0 + TypeScript 5.8.3   |
| Build         | Vite 7.3.1                        |
| Roteamento    | TanStack React Router 1.168       |
| Estado        | TanStack React Query 5.83         |
| Estilização   | TailwindCSS 4.2.1                 |
| UI Components | Radix UI + Shadcn                 |
| Validação     | Zod 3.24.2                        |
| Notificações  | Sonner 2.0.7                      |
| Ícones        | Lucide React                      |
| Backend       | Nitro (via TanStack Start)        |
| Package Mgr   | Bun                               |
| Testes        | Vitest 4.1.8                      |

**Supabase:** Não está integrado ainda. Apenas planejado na documentação.

---

# 2. Estrutura de Pastas

```
src/
├── assets/           # Imagens estáticas (logo, fotos mock de veículos)
├── components/
│   ├── admin/        # Componentes do painel (18 arquivos)
│   │   └── new-vehicle/ # 9 steps do formulário de cadastro
│   ├── public/       # Componentes do site público (11 arquivos)
│   ├── shared/       # Componentes reutilizáveis (PriceTag, SectionHeading, WhatsApp)
│   └── ui/           # Componentes base Shadcn/Radix (8 arquivos)
├── data/             # MOCK DATA (4 arquivos)
├── hooks/            # Hooks customizados (use-mobile)
├── lib/              # Utilitários (format, slug, quality-score, whatsapp, plate-lookup)
├── routes/           # Páginas (24 arquivos de rota)
├── services/         # Camada de serviços (3 arquivos — retornam mock data)
├── types/            # Tipagem TypeScript (6 arquivos)
├── router.tsx        # Configuração do roteador
└── styles.css        # Design tokens + Tailwind
```

---

# 3. Páginas e Rotas

## Site Público

| Rota                       | Página               | Status   |
| -------------------------- | -------------------- | -------- |
| `/`                        | Home                 | Completa |
| `/estoque`                 | Estoque / Inventário | Completa |
| `/veiculo/$slug`           | Página do Veículo    | Completa |
| `/contato`                 | Contato              | Completa |
| `/sobre`                   | Sobre                | Completa |
| `/financiamento`           | Financiamento        | Completa |
| `/venda-seu-veiculo`       | Venda seu Veículo    | Completa |
| `/politica-de-privacidade` | Política de Priv.    | Completa |

## Painel Administrativo

| Rota                         | Página                 | Status                  |
| ---------------------------- | ---------------------- | ----------------------- |
| `/admin/`                    | Dashboard              | Interface completa      |
| `/admin/veiculos/`           | Listagem de Veículos   | Interface completa      |
| `/admin/veiculos/novo`       | Cadastro de Veículo    | Interface completa      |
| `/admin/veiculos/:id`        | Edição de Veículo      | Interface completa      |
| `/admin/veiculos/producao`   | Status de Produção     | Interface completa      |
| `/admin/veiculos/qualidade`  | Checklist de Qualidade | Interface completa      |
| `/admin/leads/`              | Pipeline de Leads      | Interface completa      |
| `/admin/leads/atendimentos`  | Histórico de Contatos  | Interface completa      |
| `/admin/leads/historico`     | Histórico de Leads     | Interface completa      |
| `/admin/marketing/conteudo`  | Gestão de Conteúdo     | Interface completa      |
| `/admin/marketing/publicacoes` | Publicações          | Interface completa      |
| `/admin/relatorios`          | Relatórios             | Interface completa      |
| `/admin/configuracoes`       | Configurações          | Interface completa      |

**Importante:** Nenhuma rota administrativa possui proteção de autenticação. Qualquer usuário pode acessar `/admin` sem login.

---

# 4. Formulário de Cadastro de Veículo

O cadastro está implementado como wizard de 9 etapas:

| Etapa | Componente      | Conteúdo                            |
| ----- | --------------- | ----------------------------------- |
| 1     | PlateStep       | Placa do veículo                    |
| 2     | MileageStep     | Quilometragem                       |
| 3     | IdentityStep    | Marca, modelo, versão, ano          |
| 4     | SpecsStep       | Câmbio, combustível, cor, portas    |
| 5     | PriceStep       | Preço e destaque                    |
| 6     | FeaturesStep    | Opcionais e acessórios              |
| 7     | PhotosStep      | Upload de fotos (17 posições)       |
| 8     | ContentStep     | Descrições curta e longa            |
| 9     | ReviewStep      | Revisão final e publicação          |

A interface está validada e completa. Não persiste dados em nenhum banco.

---

# 5. Fontes de Dados (Mock Data)

Toda informação exibida atualmente vem de arquivos locais.

## src/data/mockVehicles.ts
- 7 veículos com dados completos
- Imagens referenciadas localmente em `src/assets/stock/`
- Campos: id, slug, brand, model, version, yearManufacture, yearModel, price, mileage, transmission, fuel, color, doors, plateFinal, features, descriptions, status, featured, mainImage, images, qualityScore, timestamps

## src/data/mockLeads.ts
- 5+ leads de demonstração
- Status possíveis: new → contacted → negotiating → proposal → financing → sold/lost
- Fontes: site_vehicle, site_form, whatsapp, instagram

## src/data/mockBrands.ts
- 10 marcas: Chevrolet, Fiat, Ford, Honda, Hyundai, Jeep, Nissan, Renault, Toyota, Volkswagen
- Sugestões de opcionais por marca

## src/data/mockSettings.ts
- Dados da Primos Automóveis (endereço, WhatsApp, redes sociais, horários)

## src/data/photoSlots.ts
- 17 posições de fotos definidas em 3 grupos (obrigatório, recomendado, opcional)

---

# 6. Camada de Serviços

Os serviços existem mas retornam mock data. Estão preparados para integração:

## src/services/vehiclesService.ts
Funções assíncronas que retornam `mockVehicles`:
- `getVehicles()` — Listagem para o site público
- `getVehicleBySlug()` — Página individual
- `getAdminVehicles()` — Listagem admin
- `createVehicle()` — Cria (não persiste)
- `updateVehicle()` — Atualiza (não persiste)
- `deleteVehicle()` — Remove (não persiste)

**Comentário no código:** *"All methods are async to mirror the future Supabase implementation — swapping the body for a supabase.from('vehicles')... call later should not require any change in consumers."*

## src/services/leadsService.ts
Mesma estrutura com mock leads.

## src/services/settingsService.ts
Retorna `mockSettings`.

---

# 7. Tipagem TypeScript

Tipos bem definidos e centralizados:

| Arquivo       | Tipos                                               |
| ------------- | --------------------------------------------------- |
| vehicle.ts    | Vehicle, VehicleImage, VehicleStatus, Transmission, Fuel, PhotoSlotKey |
| lead.ts       | Lead, LeadStatus, LeadSource                        |
| quality.ts    | QualityScore, QualityCriterion, QualityCriterionKey |
| content.ts    | ContentChannel, AssistedContent                     |
| settings.ts   | DealershipSettings                                  |

---

# 8. Integrações Existentes

| Integração       | Status                            |
| ---------------- | --------------------------------- |
| Supabase Auth    | Não implementado                  |
| Supabase Database | Não implementado                 |
| Supabase Storage | Não implementado                  |
| Supabase Realtime | Não implementado                 |
| WhatsApp         | Helpers de URL implementados      |
| Placa (lookup)   | Utilitário de validação de placa  |
| IA (geração)     | Estrutura preparada, sem backend  |

---

# 9. Design System

**Paleta Principal:**
- Performance Green: `#4CC14F`
- Racing Green: `#2E9F38`
- Carbon (preto): `#0F1411`
- Premium (cinza escuro): `#171B18`

**Tipografia:**
- Display: Sora (600-700)
- Body: Inter (400-600)
- Mono: JetBrains Mono (500)

**Tema:** Dark premium. Todas as variáveis definidas como CSS custom properties.

---

# 10. O Que Está Funcionando

| Funcionalidade                     | Estado          |
| ---------------------------------- | --------------- |
| Site público navegável             | ✅ Funciona     |
| Listagem de veículos (mock)        | ✅ Funciona     |
| Página individual do veículo (mock) | ✅ Funciona    |
| Filtros de estoque                 | ✅ Funciona     |
| Painel admin navegável             | ✅ Funciona     |
| Dashboard com métricas (mock)      | ✅ Funciona     |
| Formulário de cadastro (interface) | ✅ Funciona     |
| Pipeline de leads (mock)           | ✅ Funciona     |
| Score de qualidade                 | ✅ Funciona     |

---

# 11. O Que Não Está Funcionando

| Funcionalidade              | Estado               |
| --------------------------- | -------------------- |
| Login / autenticação        | ❌ Não implementado  |
| Proteção de rotas admin     | ❌ Não implementado  |
| Banco de dados real         | ❌ Não implementado  |
| Upload real de imagens      | ❌ Não implementado  |
| Persistência de veículos    | ❌ Não implementado  |
| Persistência de leads       | ❌ Não implementado  |
| Sincronização painel→site   | ❌ Não implementado  |
| Configurações persistentes  | ❌ Não implementado  |

---

# 12. Riscos Identificados

## Risco 1 — Supabase não instalado
O Supabase SDK (`@supabase/supabase-js`) não aparece em `package.json`.
Precisará ser instalado antes da integração.

## Risco 2 — Imagens armazenadas localmente
As 7 imagens mock estão em `src/assets/stock/`.
Ao substituir por Supabase Storage, os dados mock precisam ser tratados com cuidado para não quebrar veículos que ainda referenciam locais.

## Risco 3 — Status do Veículo divergente do banco
O tipo `VehicleStatus` define: `draft | awaiting_photos | active | reserved | sold | inactive`
O modelo de banco (`05_DATABASE_MODEL.md`) define: `draft | published | reserved | sold | archived`
Há diferença: `active` vs `published`, `inactive` vs `archived`, e `awaiting_photos` sem equivalente no banco.
Precisa ser alinhado antes da implementação do banco.

## Risco 4 — Rotas sem autenticação
Qualquer pessoa pode acessar `/admin` sem login. Isso é crítico para segurança do MVP.

## Risco 5 — Formulário de 9 etapas sem validação de publicação
O ReviewStep permite publicar mas não verifica regras de negócio (ex: pelo menos 1 foto obrigatória).
A validação de publicação precisa ser implementada no backend.

## Risco 6 — TanStack Start vs Next.js
O projeto usa TanStack Start (não Next.js nem Vite puro). É um framework full-stack em cima do Vite.
As server functions ficam em `src/lib/api/`. Isso afeta como as chamadas ao Supabase devem ser estruturadas.

## Risco 7 — Sem variáveis de ambiente configuradas
Não existe `.env` com chaves do Supabase. Precisará ser criado manualmente.

---

# 13. Recomendações

1. Alinhar `VehicleStatus` entre frontend e banco antes de criar as tabelas.
2. Instalar `@supabase/supabase-js` antes de qualquer integração.
3. Implementar autenticação como primeira funcionalidade real.
4. Preservar integralmente a interface existente — apenas substituir as chamadas de serviço.
5. Manter mock data como fallback durante o desenvolvimento para não quebrar o site.
6. Criar o bucket `vehicles` no Supabase Storage antes de implementar upload.

---

# 14. Arquitetura Identificada

```
Browser
  ↓
TanStack Router (client-side routing)
  ↓
Páginas / Routes (src/routes/)
  ↓
Componentes (src/components/)
  ↓
Serviços (src/services/) ← ponto de integração com Supabase
  ↓
Mock Data (src/data/) ← será substituído pelo banco
```

O projeto foi arquitetado para que a substituição dos mocks por Supabase ocorra exclusivamente na camada de serviços, sem necessidade de alterações nos componentes.

---

# 15. Conclusão

O projeto tem uma base sólida e bem estruturada.

A interface está completa, o design está validado, e a arquitetura está preparada para receber integração com Supabase.

O trabalho de implementação consiste em:
1. Instalar Supabase SDK.
2. Criar tabelas no banco.
3. Configurar autenticação.
4. Substituir serviços mock por chamadas reais.
5. Implementar upload de imagens.
6. Garantir sincronização do estoque público.

Nenhuma alteração de interface é necessária.
