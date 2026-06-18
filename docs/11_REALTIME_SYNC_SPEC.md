# 11_REALTIME_SYNC_SPEC.md

# Sincronização entre Painel e Site Público

## Objetivo

Garantir que o painel administrativo e o site público utilizem a mesma fonte de dados.

O objetivo principal é eliminar qualquer necessidade de atualização manual entre sistemas.

Toda alteração realizada no painel deve refletir automaticamente no site público.

---

# Diretriz Principal

Banco de dados é a fonte única da verdade.

O site público não deve possuir estoque próprio.

O painel administrativo não deve possuir estoque próprio.

Ambos devem consumir os mesmos dados.

---

# Fluxo Principal

```txt
Administrador

↓

Cadastra Veículo

↓

Salva Veículo

↓

Banco de Dados

↓

Site Público Atualiza

↓

Veículo Disponível no Estoque
```

---

# Cenário 1 — Novo Veículo

## Ação

Usuário cria um novo veículo.

---

## Resultado Esperado

O sistema deve:

1. Salvar dados do veículo.
2. Salvar imagens.
3. Associar imagens ao veículo.
4. Atualizar estoque público.
5. Disponibilizar página individual.

---

## Resultado Visual

O veículo deve aparecer no estoque sem necessidade de intervenção manual.

---

# Cenário 2 — Editar Veículo

## Ação

Usuário altera:

* preço;
* quilometragem;
* descrição;
* opcionais;
* imagens.

---

## Resultado Esperado

As alterações devem refletir automaticamente no site público.

---

# Cenário 3 — Publicar Veículo

## Ação

Status alterado para:

```txt
published
```

---

## Resultado Esperado

O veículo passa a ser exibido:

* estoque;
* destaque;
* página individual.

---

# Cenário 4 — Despublicar Veículo

## Ação

Status alterado para:

```txt
draft
```

ou

```txt
archived
```

---

## Resultado Esperado

O veículo deixa de aparecer no site público.

---

# Cenário 5 — Veículo Vendido

## Ação

Status alterado para:

```txt
sold
```

---

## Resultado Esperado

O veículo não deve mais aparecer na listagem principal.

A estratégia futura de exibição de veículos vendidos será definida posteriormente.

---

# Consumo de Dados

## Painel Administrativo

Deve consumir:

```txt
vehicles
vehicle_images
vehicle_features
```

---

## Site Público

Deve consumir:

```txt
vehicles
vehicle_images
vehicle_features
```

---

# Regra de Exibição

Exibir apenas:

```txt
status = published
```

---

# Atualização dos Dados

Primeira versão:

Não é obrigatório utilizar websocket.

Pode ser utilizado:

* refetch automático;
* invalidação de cache;
* atualização após gravação.

---

# Realtime Futuro

Caso seja necessário:

Utilizar Supabase Realtime.

Possíveis eventos:

* insert
* update
* delete

---

# Atualização de Imagens

Quando imagens forem:

* adicionadas;
* removidas;
* reordenadas;

o site deve refletir a alteração automaticamente.

---

# Atualização de Destaques

Quando o veículo for marcado como:

```txt
featured = true
```

ele deve aparecer automaticamente nas seções de destaque do site.

---

# Performance

Evitar:

* consultas duplicadas;
* carregamentos excessivos;
* múltiplas chamadas desnecessárias.

---

# Cache

Caso exista cache:

O cache deve ser invalidado após:

* criação;
* edição;
* exclusão;
* publicação.

---

# Estados de Sincronização

## Sucesso

Veículo salvo com sucesso.

---

## Erro

Não foi possível atualizar os dados.

---

## Carregando

Exibir feedback visual.

---

# Compatibilidade

Não alterar:

* layout do site;
* layout do painel;
* experiência atual aprovada.

O objetivo é conectar os dados existentes a uma estrutura real.

---

# Critério de Sucesso

O fluxo será considerado concluído quando:

1. Um veículo for criado no painel.
2. As imagens forem enviadas.
3. Os dados forem persistidos.
4. O veículo aparecer automaticamente no estoque.
5. A página individual funcionar.
6. Alterações futuras refletirem corretamente no site.

Sem necessidade de atualização manual.

---

# Cenário de Demonstração Comercial

Fluxo utilizado na apresentação:

```txt
Login

↓

Novo Veículo

↓

Upload de Fotos

↓

Salvar

↓

Publicar

↓

Abrir Site

↓

Veículo Aparecendo no Estoque
```

Se este fluxo funcionar sem falhas, a demonstração comercial é considerada bem-sucedida.
