# Primos Cockpit — Documentação do Produto

> Plataforma operacional inteligente para revendas de veículos seminovos.
> Documento de demonstração — visão geral do que foi construído, tecnologias e funcionamento.

---

## 1. O que é

O **Primos Cockpit** não é só um site de veículos. É uma **plataforma operacional** que centraliza o estoque, o cadastro de veículos, a publicação online e a gestão comercial da revenda em um único ambiente.

São, na prática, **dois produtos integrados** que consomem a mesma base de dados:

| Interface | Para quem | Função |
|---|---|---|
| **Site público** | Cliente final | Vitrine de estoque, página do veículo, contato via WhatsApp |
| **Painel administrativo** | Lojista / vendedor | Cadastro, publicação, leads, relatórios e operação |

A regra central do produto: **ESTOQUE = DINHEIRO**. Tudo é desenhado para reduzir trabalho manual e acelerar a publicação dos veículos.

---

## 2. Stack tecnológica

### Frontend
- **React 19** + **TypeScript 5.8** — tipagem forte em todo o código
- **TanStack Start** — framework full-stack com SSR e *server functions*
- **TanStack Router** — roteamento baseado em arquivos (`src/routes/`)
- **TanStack Query** — cache de dados, refetch e invalidação
- **Vite 7** — build e dev server

### Estilo e UI
- **Tailwind CSS 4** — design system dark "premium" (tema em `src/styles.css`)
- **Radix UI** — componentes acessíveis (tabs, select, radio, label)
- **lucide-react** — ícones
- **sonner** — notificações (toasts)

### Backend e dados
- **Supabase** — PostgreSQL, Auth, Storage e Realtime
- **Server Functions** (`createServerFn`) — código que roda no servidor, mantendo chaves de API fora do navegador

### Inteligência Artificial
- **OpenAI `gpt-4o-mini`** — texto (JSON estruturado) e **visão** (leitura de fotos)

### Integrações externas
- **wdapi2.com.br** (apiplacas.com.br) — consulta de dados do veículo por placa

### Qualidade e deploy
- **Zod** — validação de dados
- **Vitest** — testes unitários
- **ESLint + Prettier** — padronização
- **Vercel** — deploy automático a cada push na branch `main`

---

## 3. Arquitetura

```
                    Usuário (navegador / celular)
                              │
              ┌───────────────┴───────────────┐
        Site público                    Painel admin
        (_public.*)                     (admin.*  — protegido por login)
              └───────────────┬───────────────┘
                              │
                   Camada de serviços
            (src/services/*  +  src/lib/api/*)
                              │
        ┌─────────────┬───────┴───────┬──────────────┐
     Supabase      OpenAI         API de Placa     (futuras
   (dados/fotos)  (IA texto/visão) (wdapi2)        integrações)
```

**Princípios aplicados:**
- O **banco de dados é a fonte única da verdade** — site e painel leem os mesmos dados.
- Nenhuma chave secreta vai para o navegador — IA e placa rodam em *server functions*.
- Componentização e tipagem forte; nada de consultas diretas dentro de componentes.

### Estrutura de pastas (resumo)
```
src/
├── routes/         → páginas (file-based routing)
│   ├── _public.*   → site público
│   └── admin.*     → painel administrativo
├── components/     → componentes de UI (admin, public, ui, stepper…)
├── services/       → acesso a dados (vehicles, leads, images, settings)
├── lib/            → utilitários, IA, placa, server functions (api/)
├── contexts/       → AuthContext (sessão Supabase)
├── hooks/          → use-mobile etc.
├── types/          → tipagem central (vehicle, lead, settings…)
└── data/           → dados de apoio (marcas, slots de foto, mocks)
```

---

## 4. Site público

Rotas em `src/routes/_public.*`:

| Página | Rota | Conteúdo |
|---|---|---|
| **Home** | `/` | Banner, veículos em destaque, diferenciais, contato |
| **Estoque** | `/estoque` | Listagem com busca, filtros e ordenação |
| **Veículo** | `/veiculo/:slug` | Galeria, ficha técnica, opcionais, descrição, WhatsApp |
| **Sobre** | `/sobre` | Institucional |
| **Contato** | `/contato` | Endereço, mapa, redes sociais, WhatsApp |
| **Financiamento** | `/financiamento` | Informações |
| **Venda seu veículo** | `/venda-seu-veiculo` | Captação |
| **Política de privacidade** | `/politica-de-privacidade` | Legal |

- Exibe apenas veículos com status **publicado**.
- Contato direcionado ao **WhatsApp** da loja.
- Redes sociais corretas (Instagram `@primos_automoveislm`, Facebook `primosautomoveislm`).

---

## 5. Painel administrativo

Rotas em `src/routes/admin.*` — **protegidas por autenticação** (redireciona para `/login` sem sessão).

| Módulo | Rota | Função |
|---|---|---|
| **Dashboard** | `/admin` | Visão da operação: estoque que precisa de atenção, pipeline, ações rápidas |
| **Estoque** | `/admin/veiculos` | Lista de veículos com busca, filtros e abas de status |
| **Novo veículo** | `/admin/veiculos/novo` | Cadastro guiado (ver seção 6) |
| **Detalhe / edição** | `/admin/veiculos/:id` | Editar dados, gerenciar fotos (capa, remover, reordenar), alterar preço |
| **Em produção** | `/admin/veiculos/producao` | Pipeline de preparação do veículo |
| **Qualidade** | `/admin/veiculos/qualidade` | Pontuação dos anúncios (fotos, dados, descrição) |
| **Leads — Pipeline** | `/admin/leads` | Funil comercial estilo kanban |
| **Leads — Atendimentos** | `/admin/leads/atendimentos` | Conversas abertas, WhatsApp e ligação |
| **Leads — Histórico** | `/admin/leads/historico` | Negócios encerrados |
| **Marketing — Conteúdo IA** | `/admin/marketing/conteudo` | Geração de textos por canal |
| **Marketing — Publicações** | `/admin/marketing/publicacoes` | Agenda de posts |
| **Relatórios** | `/admin/relatorios` | KPIs, evolução, ranking de vendedores, origem de leads |
| **Configurações** | `/admin/configuracoes` | Dados da revenda |

> Visual **dark premium**, pensado para transmitir confiança e organização, com foco em poucos cliques.

---

## 6. Cadastro de veículo com IA (o coração do produto)

Fluxo guiado em etapas (`/admin/veiculos/novo`). O objetivo é **reduzir a digitação ao máximo**:

1. **Placa** — o usuário tira uma foto da placa →
   - a IA de **visão** lê os 7 caracteres (OCR);
   - a **consulta por placa** busca marca, modelo, versão, ano, cor e combustível;
   - a **IA** completa a ficha (versão por extenso, câmbio, portas, opcionais).
2. **Quilometragem** — foto do hodômetro → a **IA de visão** lê o KM total.
3. **Identidade / Especificações / Preço / Opcionais** — revisão dos dados.
   - Na etapa de preço, a IA pode **sugerir uma faixa de mercado**.
4. **Fotos** — diagrama do carro com posições; no celular abre **a câmera direto**;
   barra de progresso de 0–100% durante o upload.
5. **Conteúdo** — a IA gera **descrição curta e completa** do anúncio.
6. **Revisão e publicação** — confere e publica.

Ao publicar, o veículo aparece **automaticamente** no estoque público e ganha página individual.

> **Robustez:** toda função de IA tem *fallback* — se a foto estiver ilegível ou a IA falhar, o cadastro continua manualmente, sem travar.

---

## 7. Como funciona a Inteligência Artificial

Toda a IA roda em **server functions** (`src/lib/api/ai.functions.ts`), com a chave da OpenAI protegida no servidor. O cliente chama os wrappers em `src/lib/ai.ts`.

| Função | Entrada | Saída |
|---|---|---|
| `enrichVehicleServer` | marca, modelo, versão, ano | versão completa, câmbio, combustível, portas, opcionais |
| `generateContentServer` | dados do veículo | descrição curta + descrição completa |
| `suggestPriceServer` | marca, modelo, versão, ano, km | faixa de preço (mín/máx/sugerido) |
| `readPlateServer` | foto (base64) | placa (7 caracteres) — **visão** |
| `readOdometerServer` | foto (base64) | quilometragem — **visão** |

**Detalhes técnicos:**
- Modelo: `gpt-4o-mini` (texto e multimodal).
- Respostas em **JSON estruturado** (`response_format: json_object`).
- Leitura de fotos usa `temperature: 0` para máxima precisão.
- As imagens são **comprimidas no navegador** (máx. 1280px, JPEG) antes do envio — payload leve e resposta rápida.

---

## 8. Consulta por placa

- Server function `lookupPlate` (`src/lib/plate-lookup.ts` + `src/lib/api/plate-lookup.functions.ts`).
- Backend: `https://wdapi2.com.br/consulta/{PLACA}/{TOKEN}` (sem bloqueio de Cloudflare/CORS).
- Roda no servidor para proteger o token e evitar bloqueios do navegador.

---

## 9. Banco de dados (Supabase / PostgreSQL)

Schema em `docs/sql/`. Tabelas principais:

| Tabela | Função |
|---|---|
| `dealerships` | Revendas (preparado para múltiplas lojas) |
| `users` | Usuários e papéis (admin, manager, seller) |
| `vehicles` | Veículos — tabela central |
| `vehicle_images` | Fotos (capa, ordenação, caminho no Storage) |
| `vehicle_features` | Opcionais |
| `leads` | Oportunidades comerciais |
| `lead_activities` | Histórico de interações |

- **Storage**: bucket `vehicles` (`vehicles/{id}/...`) para as fotos.
- **RLS** (Row Level Security) configurado em `002_rls_policies.sql`.
- **Status do veículo**: `draft`, `awaiting_photos`, `active`, `reserved`, `sold`, `inactive`.

> Arquitetura já preparada para **múltiplas lojas / múltiplos usuários** sem refatoração estrutural.

---

## 10. Mobile-first

O painel foi otimizado para o celular (o lojista opera no telefone):

- **Bottom tab bar** fixa com atalhos (Início, Estoque, Novo, Leads, Mais).
- **Tabelas viram cards** no mobile — sem rolagem horizontal.
- **Alvos de toque** maiores (≥ 40px) e ações nunca escondidas.
- **Sem texto sobre ícones** — regra de design aplicada em todo o painel.
- **Câmera direta** nos uploads de foto.
- Diagrama de fotos, abas e filtros adaptados ao toque.

---

## 11. Fluxo de demonstração comercial

```
Login  →  Novo veículo  →  Foto da placa (IA preenche)
      →  Foto do hodômetro (IA lê o KM)  →  IA gera descrição
      →  Upload de fotos  →  Publicar
      →  Abrir o site  →  Veículo aparece no estoque
```

Se esse fluxo roda de ponta a ponta sem intervenção técnica, o **MVP está validado**.

---

## 12. Como rodar o projeto

```bash
# instalar dependências
npm install        # (ou bun install)

# ambiente de desenvolvimento
npm run dev        # http://localhost:8080

# build de produção
npm run build

# testes / lint
npm run lint
```

**Deploy:** automático na **Vercel** a cada push na branch `main`.

---

## 13. Variáveis de ambiente

| Variável | Visibilidade | Uso |
|---|---|---|
| `VITE_SUPABASE_URL` | pública | URL do Supabase |
| `VITE_SUPABASE_ANON_KEY` | pública | Chave anônima do Supabase |
| `OPENAI_API_KEY` | **servidor** | IA (texto e visão) |
| `OPENAI_MODEL` | servidor | Modelo (padrão `gpt-4o-mini`) |
| `PLATE_API_TOKEN` | **servidor** | Consulta por placa |

> Variáveis sem o prefixo `VITE_` ficam **apenas no servidor** — nunca são expostas no navegador.

---

## 14. Próximas evoluções (roadmap)

Já previstas na arquitetura, **não** no escopo atual:

- Substituir dados ainda mockados (leads, relatórios, publicações) por dados reais.
- Integrações de **marketing** (publicação automática em redes/marketplaces).
- Integrações de **atendimento** (WhatsApp, chatbot, qualificação de leads).
- **CRM** completo (pipeline, atividades, negociações).
- IA para análise de estoque e recomendações comerciais.

---

## 15. Resumo executivo

O Primos Cockpit entrega hoje uma **operação real funcionando**: um lojista consegue, **pelo celular**, cadastrar um veículo em poucos minutos — com a IA lendo placa e hodômetro por foto, completando a ficha e escrevendo o anúncio — publicar e ver o resultado imediatamente no site. Tudo sobre uma base moderna (React 19, TanStack, Supabase, OpenAI) e preparada para crescer como produto multi-lojas.
