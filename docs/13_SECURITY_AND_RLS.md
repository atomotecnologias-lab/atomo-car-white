# 13_SECURITY_AND_RLS.md

# Segurança e Controle de Acesso

## Objetivo

Definir as regras de autenticação, autorização e proteção de dados do Primos Cockpit.

O objetivo desta fase é criar uma base segura para o MVP funcional sem adicionar complexidade desnecessária.

---

# Diretriz Principal

Segurança simples.

Segurança funcional.

Segurança escalável.

Não criar estruturas complexas antes da necessidade.

---

# Autenticação

Utilizar:

Supabase Auth

---

# Login

Primeira versão:

* e-mail;
* senha.

---

# Funcionalidades Obrigatórias

* login;
* logout;
* sessão persistente;
* recuperação futura de senha.

---

# Painel Administrativo

Todas as rotas administrativas devem exigir autenticação.

Exemplos:

```txt
/admin

/admin/dashboard

/admin/vehicles

/admin/reports

/admin/settings
```

---

# Site Público

O site público deve permanecer aberto.

Exemplos:

```txt
/

/estoque

/veiculo/:slug

/sobre

/contato
```

---

# Controle de Acesso

Primeira versão:

Apenas perfil:

```txt
admin
```

---

# Objetivo

Simplificar a implementação.

Evitar complexidade antes da necessidade.

---

# Expansão Futura

Perfis previstos:

```txt
admin

manager

seller
```

Não implementar nesta fase.

Apenas considerar na modelagem.

---

# Banco de Dados

Todo dado operacional deve ser protegido.

Nenhuma tabela deve permitir escrita pública.

---

# Storage

Bucket principal:

```txt
vehicles
```

---

# Regras

Upload permitido apenas para usuários autenticados.

---

# Leitura

As imagens dos veículos podem ser públicas.

Necessário para exibição no site.

---

# Política Recomendada

## Upload

Somente usuários autenticados.

---

## Exclusão

Somente usuários autenticados.

---

## Atualização

Somente usuários autenticados.

---

## Leitura

Pública.

---

# Row Level Security (RLS)

Habilitar RLS em todas as tabelas.

---

# Tabelas

```txt
dealerships

users

vehicles

vehicle_images

vehicle_features

leads
```

---

# Política Inicial

## Usuário autenticado

Pode:

* criar;
* editar;
* visualizar;
* excluir.

---

## Usuário não autenticado

Não pode:

* criar;
* editar;
* excluir.

---

# Estratégia do MVP

Como existe apenas uma loja:

Não implementar segregação por empresa nesta fase.

A estrutura deve estar preparada para isso futuramente.

---

# Logs

Registrar:

* falhas de login;
* erros de upload;
* erros de gravação.

---

# Variáveis de Ambiente

Nunca armazenar credenciais diretamente no código.

Utilizar:

```env
VITE_SUPABASE_URL=

VITE_SUPABASE_ANON_KEY=
```

---

# Segredos

Nunca expor:

* service_role_key
* tokens administrativos
* credenciais do banco

---

# Frontend

Não confiar apenas em validações do frontend.

Toda operação crítica deve ser protegida pelo backend e pelas políticas do Supabase.

---

# Proteção de Rotas

Ao acessar:

```txt
/admin/*
```

Verificar:

* sessão válida;
* usuário autenticado.

Caso contrário:

Redirecionar para login.

---

# Critério de Sucesso

A segurança será considerada adequada para o MVP quando:

1. O site público permanecer aberto.
2. O painel exigir login.
3. O banco impedir alterações públicas.
4. O storage impedir uploads anônimos.
5. Apenas usuários autenticados conseguirem administrar veículos.

Sem comprometer a simplicidade da implementação.
