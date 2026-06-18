# 14_TASKS_FOR_CLAUDE.md

# Objetivo

Este documento define as tarefas atuais do Claude Code.

Importante:

Não iniciar grandes refatorações.

Não redesenhar o produto.

Não alterar interfaces aprovadas.

O objetivo é transformar o protótipo atual em um MVP funcional para demonstração comercial.

---

# Situação Atual

O projeto já possui:

* Site público construído.
* Painel administrativo construído.
* Dashboard criado.
* Relatórios criados.
* Cadastro de veículos criado.
* Componentes visuais aprovados.

Atualmente a maior parte dos dados é mockada.

---

# Diretriz Principal

Preservar a experiência criada no Lovable.

Implementar funcionalidades reais.

Evitar mudanças visuais sem necessidade funcional.

---

# Fase 1 — Auditoria

Antes de alterar código:

Realizar auditoria completa.

Identificar:

* stack utilizada;
* estrutura de pastas;
* rotas;
* componentes;
* mocks existentes;
* fontes de dados;
* dependências;
* riscos técnicos.

---

# Entregável Esperado

Relatório contendo:

* arquitetura atual;
* pontos de atenção;
* plano de implementação.

Não implementar nada antes desta análise.

---

# Fase 2 — Integração Supabase

Objetivo:

Substituir dados mockados por dados reais.

---

# Tarefas

Criar integração com:

* Supabase Auth
* Supabase Database
* Supabase Storage

---

# Configuração

Criar:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

# Fase 3 — Banco de Dados

Criar tabelas conforme:

05_DATABASE_MODEL.md

---

# Tabelas Obrigatórias

* dealerships
* users
* vehicles
* vehicle_images
* vehicle_features

---

# Não Implementar Ainda

* CRM avançado
* automações
* IA
* integrações externas

---

# Fase 4 — Autenticação

Implementar:

* login
* logout
* proteção de rotas

---

# Regras

Proteger:

```txt
/admin/*
```

---

# Não Alterar

* Layout existente
* Navegação existente
* Design existente

---

# Fase 5 — Cadastro Real de Veículos

Objetivo:

Conectar o formulário atual ao banco.

---

# Implementar

* criar veículo
* editar veículo
* salvar veículo
* atualizar veículo

---

# Não Alterar

Estrutura visual aprovada.

---

# Fase 6 — Upload de Imagens

Objetivo:

Conectar upload atual ao Supabase Storage.

---

# Implementar

* upload
* preview
* recuperação
* exclusão

---

# Preservar

Toda experiência atual criada no Lovable.

---

# Fase 7 — Estoque Público

Objetivo:

Consumir dados reais.

---

# Implementar

Listagem pública utilizando:

```txt
vehicles
vehicle_images
```

---

# Regra

Mostrar apenas:

```txt
status = published
```

---

# Fase 8 — Página Individual

Criar carregamento real dos veículos.

---

# Implementar

* galeria
* dados técnicos
* descrição
* opcionais

Consumindo dados reais.

---

# Fase 9 — Sincronização

Objetivo:

Garantir fluxo de demonstração.

---

# Fluxo Obrigatório

```txt
Login

↓

Cadastrar Veículo

↓

Upload de Fotos

↓

Salvar

↓

Publicar

↓

Abrir Site

↓

Veículo Aparece no Estoque
```

---

# Critério de Aprovação

A fase só é considerada concluída quando o fluxo funcionar de ponta a ponta.

---

# Não Fazer

Não criar:

* novos módulos
* CRM avançado
* IA
* automações
* redesign
* novos dashboards

Sem solicitação explícita.

---

# Prioridade Absoluta

Garantir que o cadastro realizado no painel reflita corretamente no site público.

Essa é a funcionalidade mais importante do MVP.

---

# Resultado Esperado

Ao final da implementação:

1. Login funcional.
2. Banco funcional.
3. Upload funcional.
4. Cadastro funcional.
5. Estoque funcional.
6. Página individual funcional.
7. Site e painel utilizando dados reais.

Sem dependência de mock data.

---

# Ordem Obrigatória de Trabalho

1. Auditoria.
2. Planejamento.
3. Supabase.
4. Banco.
5. Auth.
6. Cadastro.
7. Upload.
8. Estoque.
9. Página Individual.
10. Testes.

Não inverter a ordem.

---

# Definição de MVP Concluído

O MVP será considerado concluído quando um lojista conseguir:

* acessar o painel;
* cadastrar um veículo;
* subir fotos;
* publicar;
* abrir o site;
* visualizar o veículo publicado.

Sem intervenção técnica.

