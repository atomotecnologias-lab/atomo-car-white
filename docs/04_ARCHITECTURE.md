# 04_ARCHITECTURE.md

# Arquitetura do Projeto

## Objetivo

Definir a arquitetura técnica do Primos Cockpit para suportar:

* site público;
* painel administrativo;
* banco de dados;
* upload de imagens;
* sincronização em tempo real;
* futuras integrações.

A arquitetura deve ser simples para o MVP e preparada para expansão futura.

---

# Stack Principal

## Frontend

* React
* TypeScript
* Vite

---

## Backend

* Supabase

Responsável por:

* banco de dados;
* autenticação;
* storage;
* realtime;
* APIs.

---

## Banco de Dados

* PostgreSQL (Supabase)

---

## Storage

* Supabase Storage

Responsável por:

* imagens dos veículos;
* futuras mídias.

---

## Deploy

* Vercel

---

# Estrutura Geral

```txt
Usuário
    ↓

Frontend React

    ↓

Supabase

├── Auth
├── Database
├── Storage
└── Realtime
```

---

# Separação de Áreas

## Área Pública

Responsável por:

* home;
* estoque;
* página do veículo;
* páginas institucionais.

Não deve possuir dependência direta do painel.

---

## Área Administrativa

Responsável por:

* dashboard;
* veículos;
* cadastro;
* relatórios;
* gestão operacional.

Rotas protegidas.

---

# Estrutura de Pastas

```txt
src/

├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── lib/
├── integrations/
├── types/
├── contexts/
├── features/
└── assets/
```

---

# Organização Recomendada

## features/

Separar por domínio.

```txt
features/

vehicles/
dashboard/
reports/
leads/
auth/
```

Evitar centralizar tudo em uma única pasta.

---

# Camada de Serviços

Toda comunicação com Supabase deve passar por serviços.

Exemplo:

```txt
services/

vehicle.service.ts
auth.service.ts
dashboard.service.ts
```

Não realizar consultas diretamente nos componentes.

---

# Banco de Dados

O banco será a fonte única da verdade.

Nenhuma informação crítica deve permanecer apenas em estado local.

---

# Storage de Imagens

Fluxo:

Usuário
↓
Upload
↓
Supabase Storage
↓
URL pública
↓
Banco de dados
↓
Frontend

---

# Fluxo de Cadastro

Administrador

↓

Cria veículo

↓

Faz upload das imagens

↓

Imagens vão para Storage

↓

Dados vão para Database

↓

Site público atualiza

---

# Atualização do Estoque

O estoque público deve consumir dados diretamente do banco.

Não utilizar mock data.

Não duplicar informações.

---

# Realtime

Sempre que possível utilizar:

Supabase Realtime

Casos previstos:

* novo veículo publicado;
* alteração de status;
* atualização de estoque.

---

# Autenticação

Utilizar:

Supabase Auth

Primeira versão:

* login por e-mail;
* logout;
* sessão persistente.

---

# Controle de Acesso

Primeira versão:

## Admin

Pode:

* visualizar tudo;
* cadastrar;
* editar;
* excluir.

---

Versões futuras:

## Gerente

## Vendedor

## Operador

---

# Tipagem

Todos os modelos devem possuir tipos centralizados.

Exemplo:

```txt
types/

vehicle.ts
lead.ts
user.ts
report.ts
```

---

# Tratamento de Erros

Todo serviço deve possuir:

* loading;
* success;
* error.

Nenhuma operação crítica deve falhar silenciosamente.

---

# Logs

Registrar:

* erros de upload;
* erros de autenticação;
* falhas de gravação.

Facilitar futuras auditorias.

---

# Performance

Prioridades:

* carregamento rápido;
* imagens otimizadas;
* consultas paginadas;
* lazy loading quando necessário.

---

# Escalabilidade

Toda modelagem deve considerar futura expansão para:

* múltiplas lojas;
* múltiplos usuários;
* múltiplos vendedores.

Mesmo que inicialmente exista apenas uma operação.

---

# Arquitetura de Integrações Futuras

Preparar estrutura para:

```txt
integrations/

openai/
claude/
whatsapp/
instagram/
facebook/
marketplaces/
```

Não implementar agora.

Apenas preparar a arquitetura.

---

# Princípios Técnicos

1. Simplicidade antes de complexidade.

2. Banco como fonte única da verdade.

3. Componentes reutilizáveis.

4. Código fortemente tipado.

5. Separação clara entre interface e dados.

6. Evitar acoplamento.

7. Construir pensando na expansão futura.

---

# Definição de Sucesso

A arquitetura será considerada correta quando:

* o admin cadastrar um veículo;
* as imagens forem armazenadas;
* os dados forem salvos;
* o veículo aparecer automaticamente no site público;

sem necessidade de ajustes manuais.

