# Fluxograma do Projeto — Atomo Car

Documentação visual de como o sistema funciona de ponta a ponta, gerada a partir da leitura do código (rotas, páginas, componentes, services, tipos e banco).

**Legenda usada nos diagramas**
- 🟢 **Existe** — implementado e funcionando.
- 🟡 **Parcial / mock** — existe na interface mas com dados simulados ou sem integração real.
- 🔵 **Planejado / futuro** — previsto na arquitetura, ainda não implementado.
- ⚠️ **Ponto a confirmar** — comportamento não 100% claro só pelo código.

> Stack: **React + TypeScript + Vite + TanStack Router/Start (SSR)** · **Supabase** (Auth, PostgreSQL, Storage, RLS) · **Tailwind v4 / shadcn** · **React Query**. Deploy na **Vercel**.

---

## 1. Fluxograma geral do sistema

Visão macro: o sistema tem **dois mundos** que consomem o mesmo banco — o **site público** (vitrine) e o **painel administrativo** (a "Central de Operações"). O painel exige login e tem dois papéis (dono e vendedor). Há ainda duas páginas avulsas de demonstração comercial.

```mermaid
flowchart TD
    U["Usuário"] --> Tipo{"O que acessa?"}

    Tipo -->|Site público| Site["Site público (_public)"]
    Tipo -->|Painel| Login["/login — Supabase Auth"]
    Tipo -->|Demo comercial| Demo["/apresentacao e /demo-azul"]

    subgraph Publico["🟢 Site público (vitrine)"]
        Site --> Home["/ Home"]
        Site --> Estoque["/estoque"]
        Site --> Veic["/veiculo/:slug"]
        Site --> Inst["Sobre · Contato · Financiamento · Venda seu veículo"]
        Estoque --> Veic
        Veic --> Wpp["Contato via WhatsApp (wa.me)"]
    end

    Login --> Auth{"Autenticado?"}
    Auth -->|Não| Login
    Auth -->|Sim| Papel{"Papel do usuário"}

    Papel -->|Dono| Dono["Painel completo"]
    Papel -->|Vendedor| Vend["Painel restrito"]

    subgraph Painel["🟢 Painel administrativo (/admin)"]
        Dono --> Dash["Dashboard / Central de Operações"]
        Dono --> Vei["Veículos: Estoque · Novo · Preparação · Qualidade"]
        Dono --> Vendas["Vendas: Realizadas · Registrar · Comissões"]
        Dono --> Fin["Financeiro: Visão geral · A pagar · A receber · Custos"]
        Dono --> Mkt["Marketing: Conteúdo IA 🟡 · Publicações 🟡"]
        Dono --> Rel["Relatórios"]
        Dono --> Cfg["Configurações: Loja · Equipe · Comissão"]

        Vend --> DashV["Dashboard do vendedor"]
        Vend --> VeiV["Veículos: Estoque · Novo"]
    end

    Vei -->|publica veículo| Estoque
    Vendas -->|dá baixa no estoque| Estoque
    Fin --> Dash
    Vendas --> Dash

    Leads["Leads 🟡 (tabela + service mock, sem tela no painel)"]:::future

    classDef future fill:#eef,stroke:#88a,stroke-dasharray: 4 3;
```

> **Observações**
> - **Leads** 🟡: existe a tabela `leads` e um `leadsService` (mock), mas a área de Leads foi **removida do painel** por enquanto (sem integração de canais). O contato do site é feito por **link de WhatsApp**, não grava lead no banco. ⚠️ *Ponto a confirmar: os formulários de "Contato" e "Venda seu veículo" mostram sucesso mas não parecem persistir no banco.*
> - **/apresentacao** e **/demo-azul** são páginas de demonstração comercial (pitch + site alternativo), fora do fluxo operacional.

---

## 2. Fluxo do dono da loja

Caminho principal do dono ao abrir o painel: ele começa pela **saúde da loja**, resolve o que exige atenção, confere o placar financeiro e age (registrar venda, lançar custo, publicar carro).

```mermaid
flowchart TD
    A["Dono faz login"] --> B["/admin — Central de Operações"]
    B --> C["Barra de saúde: 🟢 saudável / 🟡 atenção / 🔴 ação"]
    C --> D{"Há pendências?"}

    D -->|Sim| E["Bloco 'Atenção hoje'"]
    E --> E1["Contas vencidas"]
    E --> E2["Recebimentos atrasados"]
    E --> E3["Veículos parados +90 dias"]
    E1 --> Pagar["Ir para A pagar"]
    E2 --> Receber["Ir para A receber"]
    E3 --> EstoqueD["Ir para Estoque / Preparação"]

    D -->|Não| F["Placar do mês"]
    C --> F
    F --> F1["Lucro do mês (Δ vs mês anterior)"]
    F --> F2["A receber / A vencer / Capital em estoque"]
    F --> F3["Gráfico de lucro 6 meses + Previsão de caixa"]
    F --> F4["Dinheiro parado por faixa 60/90/120"]

    B --> G{"Ação rápida"}
    G -->|Registrar venda| H["/admin/vendas/nova"]
    G -->|Novo veículo| I["/admin/veiculos/novo"]
    G -->|Lançar custo| J["/admin/financeiro/custos"]

    H --> K["Venda calcula lucro + comissão"]
    K --> L["Atualiza dashboard e financeiro"]
    L --> B
```

> O **dashboard do vendedor** é uma variação desta tela: mostra só o próprio estoque, suas vendas (via view segura `seller_sales`) e comissões — **sem** capital, lucro da loja ou financeiro.

---

## 3. Fluxo de cadastro de veículo

Cadastro guiado em **9 etapas** (`/admin/veiculos/novo`). A placa dispara consulta automática (API nacional) e enriquecimento por **IA**. As fotos hoje são **opcionais** (contam só para a nota de qualidade). Ao concluir, o carro é salvo e — dependendo do status escolhido — vai direto para o site.

```mermaid
flowchart TD
    Start["Início — /admin/veiculos/novo"] --> S1["1. Placa (foto ou digitação)"]
    S1 --> LP{"Consultar placa?"}
    LP -->|Sim| API["API de placa (wdapi2) → marca/modelo/ano/cor/combustível"]
    API --> IA["IA completa versão, câmbio, portas, opcionais"]
    LP -->|Não| S2
    IA --> S2["2. Quilometragem"]
    S2 --> S3["3. Identificação: marca, modelo, ano"]
    S3 --> S4["4. Especificações: câmbio, combustível, cor"]
    S4 --> S5["5. Preço & entrada"]
    S5 --> S5a["Preço de venda + valor de aquisição + origem"]
    S5a --> S5b["Status inicial: Rascunho / Aguardando fotos / Publicar agora"]
    S5b --> S6["6. Opcionais"]
    S6 --> S7["7. Fotos 🟢 opcionais (diagrama de posições)"]
    S7 --> S8["8. Conteúdo: descrições"]
    S8 --> S9["9. Revisão"]
    S9 --> Save{"Concluir cadastro"}

    Save --> C1["createVehicle → tabela vehicles"]
    C1 --> C2["upsertAcquisition → vehicle_acquisitions"]
    C2 --> C3["saveVehicleImages → Storage + vehicle_images (se houver fotos)"]
    C3 --> Pub{"status = 'active'?"}
    Pub -->|Sim| Site["is_published = true → aparece no site /estoque"]
    Pub -->|Não| Guard["Fica no painel (rascunho/aguardando)"]

    Site --> Detalhe["/admin/veiculos/:id"]
    Guard --> Detalhe
    Detalhe --> Custos["Aba Custos & Margem → vehicle_costs"]
    Custos --> DashImpacto["Impacta 'Capital em estoque' e 'Dinheiro parado' no dashboard"]
```

> **Preparação vs Publicação são eixos independentes.** O carro nasce em "Aguardando" na tela de **Preparação** (`preparation_status`), e a **publicação no site** é controlada pelo status comercial (`status`/`is_published`). A tela de Preparação tem uma "ponte suave": ao ficar **Pronto**, oferece o botão **Publicar no site**.

---

## 4. Fluxo financeiro

O financeiro gira em torno de **uma tabela** (`financial_entries`) com dois tipos: **a pagar** (payable) e **a receber** (receivable). Cada lançamento pode ser **único**, **recorrente** (valor fixo repetido) ou **parcelado** (um total dividido). O **status** (em aberto / vencido / pago) é **derivado** de `paid_at` e `due_date` — não é uma coluna fixa.

```mermaid
flowchart TD
    Novo["Novo lançamento (EntryForm)"] --> Tipo{"Único, recorrente ou parcelado?"}

    Tipo -->|Único| U["createEntry → 1 linha"]
    Tipo -->|Recorrente| R["createEntrySeries: valor fixo × N ocorrências"]
    Tipo -->|Parcelado| P["createEntrySeries: divide o total em N parcelas"]

    R --> Mat["Materializa N linhas (mesmo group_id, com data de cada uma)"]
    P --> Mat
    U --> DB[("financial_entries")]
    Mat --> DB

    DB --> Status{"Status derivado"}
    Status -->|paid_at preenchido| Pago["Pago / Recebido"]
    Status -->|vencimento < hoje| Vencido["Vencido"]
    Status -->|senão| Aberto["Em aberto"]

    Aberto --> Acao["Marcar como pago/recebido → paid_at = hoje"]
    Vencido --> Acao

    subgraph Telas["Telas do Financeiro"]
        VG["Visão geral: KPIs + fluxo de caixa 6 meses + próximos compromissos"]
        AP["A pagar (payable) — tags: vencida, mensal, parcela X/N"]
        AR["A receber (receivable)"]
        CU["Custos por veículo"]
    end

    DB --> VG
    DB --> AP
    DB --> AR

    VG --> Dash["Dashboard do dono: A vencer, A receber, Previsão de caixa, Contas vencidas"]

    Origem["Origem automática dos lançamentos"] -.->|venda gera receber + comissão| DB
    Origem -.->|custo/despesa manual| DB
```

> **Regras confirmadas no código**
> - `getMonthlyCashflow` só conta lançamentos **pagos** (fluxo realizado) → futuros em aberto não distorcem o passado.
> - Excluir uma **série** remove só as parcelas **em aberto** (preserva as já pagas).
> - Comissões e recebimentos de venda **nascem automaticamente** ao registrar uma venda (ver fluxo 5).

---

## 5. Fluxo de venda de veículo

Registrar uma venda (`/admin/vendas/nova` → `salesService.registerSale`) é uma **cadeia**: calcula os números com "fotografia" (snapshot) do momento, cria a venda, **dá baixa no estoque** (some do site) e gera automaticamente o recebimento e a comissão. Tudo é **reversível** (desfazer venda).

```mermaid
flowchart TD
    A["Veículo no pátio (status ativo)"] --> B["/admin/vendas/nova"]
    B --> C{"Aquisição registrada?"}
    C -->|Não| C1["Bloqueia: registre o valor de aquisição primeiro"]
    C -->|Sim| D["Prévia: lucro bruto = venda − aquisição − custos"]
    D --> E["Comissão pela regra da loja (percent/fixo, sobre venda/lucro)"]
    E --> F{"Venda abaixo do custo?"}
    F -->|Sim| F1["Confirmar venda com prejuízo"]
    F -->|Não| G["Registrar venda"]
    F1 --> G

    G --> H["INSERT sales (snapshots de aquisição, custos, comissão, lucros)"]
    H --> I["updateVehicleStatus('sold') → is_published = false"]
    I --> J["Some do site e do Estoque (vai para 'Vendas')"]
    H --> K["Gera A RECEBER (à vista = pago; financiado = em aberto +30d)"]
    H --> L["Gera COMISSÃO a pagar (fim do mês) se houver vendedor"]
    H --> M["Se consignação: gera repasse ao consignante"]

    K --> Dash["Atualiza dashboard: Lucro do mês, A receber, gráfico"]
    L --> Dash
    J --> Dash

    Dash --> Undo{"Desfazer venda?"}
    Undo -->|Sim| U["DELETE sale (cascade nos lançamentos) + veículo volta a ativo"]
    U --> A
```

> **Lucro real (KPI do dashboard)** = venda − aquisição − custos − comissão (`net_profit`, coluna gerada no banco). A **margem prevista** (carro no pátio) = preço anunciado − investido.

---

## 6. Arquitetura técnica simplificada

Camadas: **UI (rotas/páginas/componentes)** → **camada de services** → **Supabase**. Regra do projeto: componentes **não** falam com o banco direto — sempre via `services/`. Segredos (token de placa, chave de IA) rodam em **server functions** do TanStack Start.

```mermaid
flowchart TD
    subgraph FE["Frontend — React + TanStack Router/Start (SSR)"]
        direction TB
        Rotas["Rotas: _public/* · /login · /admin/*"]
        Ctx["AuthContext (sessão + papel)"]
        Comp["Componentes: AdminSidebar/Topbar/BottomNav, EntryForm, CostsMarginTab, wizard new-vehicle, Stepper"]
        RQ["React Query (cache/estado servidor)"]
    end

    subgraph SVC["Camada de services (src/services)"]
        direction TB
        S1["vehiclesService · imageService"]
        S2["salesService · costsService"]
        S3["financeService · settingsService"]
        S4["teamService · dealershipService · leadsService 🟡"]
    end

    subgraph LIB["Libs & regras (src/lib)"]
        L1["commission · aging · dates · quality-score · format · slug"]
        L2["ai (OpenAI) · plate-lookup (wdapi2) · whatsapp"]
        L3["supabase.ts (client)"]
    end

    subgraph BE["Supabase"]
        direction TB
        Auth["Auth (e-mail/senha)"]
        DB[("PostgreSQL + RLS")]
        Storage["Storage (fotos)"]
    end

    subgraph EXT["Integrações externas"]
        Placa["API de placa — wdapi2"]
        OpenAI["OpenAI — enriquecer ficha, descrição, preço, OCR placa/odômetro"]
        Wpp["WhatsApp (wa.me links)"]
    end

    Rotas --> Ctx
    Rotas --> Comp
    Comp --> RQ
    RQ --> SVC
    Comp --> LIB
    SVC --> L3
    L3 --> Auth
    L3 --> DB
    S1 --> Storage
    L2 --> Placa
    L2 --> OpenAI
    Comp --> Wpp
    Ctx --> Auth
```

### Entidades de dados (tabelas principais)

```mermaid
erDiagram
    dealerships ||--o{ vehicles : tem
    dealerships ||--o{ team_members : tem
    dealerships ||--|| dealership_settings : configura
    vehicles ||--o{ vehicle_images : possui
    vehicles ||--o{ vehicle_features : possui
    vehicles ||--o| vehicle_acquisitions : entrada
    vehicles ||--o{ vehicle_costs : custos
    vehicles ||--o| sales : venda
    team_members ||--o{ sales : vende
    sales ||--o{ financial_entries : gera
    vehicles ||--o{ financial_entries : referencia
    team_members ||--o{ financial_entries : comissao
    leads ||--o| vehicles : interesse
```

> **RLS (segurança no banco):** dados sensíveis (custos, aquisição, vendas, financeiro) são **owner-only**. O vendedor vê o estoque e as próprias vendas por uma **view segura** (`seller_sales`), sem custo/lucro — o bloqueio é no banco, não só na tela.

---

## A) Resumo da arquitetura atual

- **Frontend** React + TypeScript + Vite, com **TanStack Router/Start** (roteamento por arquivo e SSR). Rotas divididas em **site público** (`_public.*`), **login** e **painel** (`admin.*`).
- **Estado servidor** com **React Query**; **contexto de auth** carrega sessão e papel (dono/vendedor).
- **Camada de services** isola todo acesso ao Supabase (nenhum componente consulta o banco direto). Regras de negócio puras em `src/lib` (comissão, aging, datas, qualidade).
- **Backend Supabase**: PostgreSQL com **RLS por papel**, Auth por e-mail/senha e Storage para fotos. Migrations versionadas em `docs/sql/001…009`.
- **Server functions** (TanStack Start) guardam segredos e chamam **APIs externas**: consulta de placa (wdapi2) e **OpenAI** (enriquecer ficha, gerar descrição/preço, OCR de placa e odômetro).
- **Deploy** na Vercel.

## B) Principais fluxos do sistema

1. **Cadastro de veículo** guiado (9 etapas) com placa → API + IA, fotos opcionais, custos e publicação.
2. **Venda** com cálculo de lucro/comissão, baixa automática do estoque e geração de recebimento/comissão (reversível).
3. **Financeiro** com contas a pagar/receber, lançamentos únicos, recorrentes e parcelados; status derivado; fluxo de caixa.
4. **Dashboard do dono** ("Central de Operações"): saúde da loja, atenção hoje, capital parado, previsão de caixa.
5. **Papéis**: dono vê tudo; vendedor tem visão restrita, garantida por RLS.

## C) Pontos confusos encontrados no código

- **Leads** 🟡: tabela + `leadsService` existem, mas a área foi removida do painel e o service é **mock**. ⚠️ Formulários públicos (Contato, Venda seu veículo) mostram sucesso mas **não gravam** lead — confirmar intenção.
- **Marketing** 🟡: "Publicações" é mock (sem integração real com redes/portais); "Conteúdo IA" gera texto mas **não publica**.
- **`pseudoChannels`** na listagem de estoque exibe canais de publicação **fictícios** (cosmético) — pode confundir quem lê o dado como real.
- **Validação do wizard**: o avançar é travado por etapa; a conclusão final checa só a etapa de Revisão. Como cada etapa já foi validada para avançar, funciona — mas a lógica de "validar tudo só no fim" fica implícita.
- **Snapshot vs. atual**: a venda guarda snapshots de custo/aquisição; se um custo for lançado **depois** da venda, ele não entra no lucro registrado (correto, mas não sinalizado na tela).
- Alguns arquivos ainda misturam **tokens de marca** (bg-carbon, text-clean) com utilitários de cor — já foi feito um sweep no wizard, mas vale padronizar no restante do painel.

## D) Sugestões de melhorias na organização do projeto

1. **Agrupar por feature** (ex.: `features/vehicles`, `features/finance`, `features/sales`) reunindo rota + componentes + service, em vez de espalhar por `routes/`, `components/`, `services/`.
2. **Remover ou marcar claramente os mocks** (leads, publicações, pseudoChannels) para não passarem por dados reais numa demo.
3. **Centralizar as chaves de query** do React Query (hoje strings soltas como `["sales"]`, `["admin","vehicles"]`) num único módulo para evitar cache dessincronizado.
4. **Extrair um hook `useVehiclesFinance`** (junta vehicles + acquisitions + costs + sales) já usado em 3 telas com a mesma derivação.
5. **Documentar o modelo de status** (comercial vs. preparação) num README curto — é a fonte de confusão mais provável para quem entra no projeto.
6. **Tema claro**: concluir o sweep de cores (padronizar tokens semânticos) no restante do painel além do wizard.

## E) Próximos fluxogramas que deveriam ser criados futuramente

- **Fluxo de papéis e permissões (RLS)** — o que cada papel enxerga/bloqueia, com a view `seller_sales`.
- **Ciclo de vida do veículo** (máquina de estados): rascunho → aguardando fotos → ativo → reservado → vendido / inativo, cruzado com preparação (none → em preparação → pronto).
- **Fluxo de recorrência/parcelamento** detalhado (geração das ocorrências, edição/exclusão de série).
- **Integração com IA** (placa → enriquecimento → conteúdo → preço) como diagrama de sequência.
- **Fluxo de leads/atendimento** — quando as integrações de canais (WhatsApp/Instagram) forem implementadas.
- **Pipeline de publicação/marketing** — quando houver publicação real em portais/redes.

---

_Documento gerado a partir da leitura do código atual. Nada de código funcional foi alterado._
