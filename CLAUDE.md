# CLAUDE.md

# Projeto

Primos Cockpit

Plataforma operacional inteligente para revendas de veículos seminovos.

---

# Visão do Produto

O Primos Cockpit não é apenas um site de veículos.

O projeto tem como objetivo se tornar uma plataforma operacional que centraliza estoque, cadastro de veículos, marketing, atendimento, leads, relatórios e automações em um único ambiente.

O site público é apenas uma das interfaces da plataforma.

O principal foco do produto é reduzir trabalho operacional do lojista, aumentar a velocidade de publicação dos veículos e melhorar a gestão comercial da revenda.

---

# Objetivo Atual

Prioridade máxima:

Transformar o protótipo existente em um MVP funcional para demonstração comercial.

O fluxo mínimo obrigatório deve permitir:

1. Login no painel administrativo.
2. Cadastro real de veículos.
3. Upload de fotos.
4. Armazenamento em banco de dados.
5. Atualização automática do estoque público.
6. Visualização do veículo cadastrado no site.
7. Página individual do veículo.
8. Dashboard administrativo funcional.

O objetivo atual NÃO é construir todas as automações futuras.

O objetivo é demonstrar uma operação real funcionando.

---

# Diretriz Principal

Sempre considerar que:

ESTOQUE = DINHEIRO

O painel administrativo deve priorizar:

* estoque
* publicação
* leads
* operação comercial

antes de métricas secundárias.

---

# Perfil do Usuário

Usuário principal:

* dono de revenda
* gerente comercial
* vendedor

Conhecimento técnico esperado:

Baixo.

A experiência deve ser simples, rápida e intuitiva.

---

# Pilares do Produto

## 1. Velocidade

Cadastrar um veículo deve ser rápido.

Reduzir ao máximo a digitação manual.

---

## 2. Inteligência

O sistema deve futuramente utilizar IA para:

* descrição de veículos
* geração de anúncios
* geração de conteúdo
* análise de estoque
* recomendações comerciais

Sempre projetar pensando nessa expansão.

---

## 3. Profissionalismo

Toda interface deve transmitir:

* confiança
* organização
* autoridade
* transparência

---

## 4. Escalabilidade

Mesmo sendo um projeto para a Primos Automóveis, a arquitetura deve permitir futura transformação em produto multi-lojas.

Evitar qualquer implementação excessivamente específica para um único cliente.

---

# Escopo Atual

## Site Público

* Home
* Estoque
* Página individual do veículo
* Sobre
* Contato

---

## Painel Administrativo

* Dashboard
* Veículos
* Cadastro de Veículos
* Leads
* Relatórios

---

# Stack Desejada

Frontend:

* React
* TypeScript
* Vite

Backend:

* Supabase

Banco:

* PostgreSQL (Supabase)

Storage:

* Supabase Storage

Autenticação:

* Supabase Auth

Deploy:

* Vercel

---

# Regras Técnicas

* Não quebrar o site público existente.
* Não remover o design premium atual.
* Priorizar componentização.
* Evitar código duplicado.
* Evitar dados mockados permanentes.
* Utilizar tipagem forte.
* Preparar estrutura para crescimento futuro.

---

# Upload de Imagens

O upload de imagens é uma funcionalidade crítica.

O sistema deve permitir:

* múltiplas fotos
* imagem principal
* ordenação
* preview
* armazenamento em Storage

---

# Realtime

Sempre que possível:

Cadastro realizado no painel → refletido automaticamente no estoque público.

---

# Antes de Alterar Código

Ler obrigatoriamente:

@docs/01_PROJECT_CONTEXT.md

@docs/02_PRODUCT_REQUIREMENTS.md

@docs/04_ARCHITECTURE.md

@docs/05_DATABASE_MODEL.md

@docs/06_API_INTEGRATIONS.md

@docs/07_ADMIN_UX_SPEC.md

@docs/09_VEHICLE_REGISTRATION_FLOW.md

@docs/10_IMAGE_UPLOAD_SPEC.md

@docs/11_REALTIME_SYNC_SPEC.md

@docs/14_TASKS_FOR_CLAUDE.md

---

# Fluxo de Trabalho

Antes de implementar qualquer funcionalidade:

1. Entender a arquitetura atual.
2. Identificar riscos.
3. Propor plano de execução.
4. Implementar em pequenas etapas.
5. Validar funcionamento.
6. Documentar alterações.

Nunca executar grandes refatorações sem análise prévia.

---

# Meta do MVP

Demonstrar para um lojista que:

* consegue cadastrar um veículo em poucos minutos;
* consegue publicar o veículo no estoque online;
* consegue visualizar a atualização em tempo real;
* possui uma plataforma moderna para gestão da revenda.

Se esta meta for atingida, o MVP é considerado bem-sucedido.
