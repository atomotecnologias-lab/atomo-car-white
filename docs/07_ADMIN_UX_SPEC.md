# 07_ADMIN_UX_SPEC.md

# Especificação de UX do Painel Administrativo

## Objetivo

Definir a experiência do painel administrativo do Primos Cockpit.

O painel deve transmitir:

* profissionalismo;
* controle;
* agilidade;
* inteligência operacional.

O usuário deve sentir que está utilizando uma plataforma premium de gestão automotiva.

---

# Filosofia do Produto

O painel não deve parecer:

* ERP antigo;
* sistema financeiro;
* software burocrático;
* dashboard genérico.

O painel deve parecer uma central operacional moderna.

Inspirado em produtos modernos de tecnologia, mas adaptado ao mercado automotivo.

---

# Perfil do Usuário

## Dono da Revenda

Busca:

* controle da operação;
* visão rápida;
* indicadores;
* estoque.

---

## Gerente Comercial

Busca:

* acompanhamento;
* performance;
* oportunidades.

---

## Vendedor

Busca:

* velocidade;
* simplicidade;
* produtividade.

---

# Estrutura Principal

## Dashboard

Objetivo:

Mostrar o que merece atenção hoje.

Não é uma tela de métricas.

É uma tela de operação.

---

### Blocos Principais

#### Resumo Executivo

Exibir:

* veículos disponíveis;
* veículos aguardando publicação;
* veículos acima de 60 dias;
* leads aguardando contato.

---

#### Hoje na Operação

Resumo rápido da situação atual.

Exemplo:

* 8 veículos ativos
* 2 aguardando publicação
* 3 leads sem retorno
* 1 veículo crítico

---

#### Centro de Atenção

Itens que exigem ação.

Exemplos:

* veículo sem foto;
* veículo sem descrição;
* veículo parado;
* lead sem retorno.

---

#### Ações Rápidas

Botões:

* Novo Veículo
* Ver Estoque
* Publicar Veículo
* Gerar Conteúdo
* Relatórios

---

# Módulo de Veículos

Objetivo:

Gerenciar estoque.

---

### Listagem

Visual em tabela premium.

Colunas:

* foto;
* veículo;
* ano;
* km;
* preço;
* status;
* data cadastro.

---

### Funcionalidades

* busca;
* filtros;
* ordenação;
* edição;
* exclusão.

---

# Cadastro de Veículo

## Objetivo

Ser o ponto mais forte do sistema.

Essa é a funcionalidade que mais gera valor para o lojista.

---

# Princípios

### Menos digitação

Reduzir campos desnecessários.

### Fluxo guiado

Passo a passo simples.

### Feedback visual

O usuário deve visualizar exatamente o que está cadastrando.

---

# Estrutura Recomendada

## Etapa 1

Informações principais

* marca
* modelo
* versão
* ano
* km
* preço

---

## Etapa 2

Características

* combustível
* câmbio
* cor
* portas
* opcionais

---

## Etapa 3

Fotos

Upload múltiplo.

Visual moderno.

Preview imediato.

Reordenação.

Definição de imagem principal.

---

## Etapa 4

Publicação

Resumo final.

Botão:

Publicar Veículo

---

# UX de Upload

O upload de imagens deve parecer premium.

Permitir:

* arrastar arquivos;
* múltipla seleção;
* preview;
* reordenação;
* exclusão.

O usuário deve enxergar claramente qual será a foto principal.

---

# Relatórios

Objetivo:

Auxiliar decisões.

Não apenas exibir números.

---

### Mostrar

* evolução de vendas;
* desempenho de estoque;
* oportunidades;
* indicadores comerciais.

---

### Evitar

* excesso de gráficos;
* excesso de tabelas;
* visual de planilha.

---

# Leads

Primeira versão:

Simples.

Objetivo:

Mostrar oportunidades.

---

Exibir:

* nome;
* telefone;
* veículo de interesse;
* status.

---

# Estados do Sistema

Toda tela deve possuir:

## Loading

Skeleton loading.

---

## Sucesso

Feedback visual claro.

---

## Erro

Mensagem amigável.

---

## Vazio

Estado elegante.

Exemplo:

"Nenhum veículo cadastrado ainda."

Botão:

Cadastrar Primeiro Veículo

---

# Design System

## Visual

Dark premium.

---

## Sensações desejadas

* tecnologia;
* confiança;
* organização;
* velocidade;
* profissionalismo.

---

## Evitar

* excesso de cores;
* excesso de informação;
* excesso de elementos.

---

# Responsividade

O painel deve funcionar em:

* desktop;
* notebook;
* tablet.

Mobile não é prioridade do MVP.

---

# Regra Principal

Se existir dúvida entre:

mais informações

ou

mais simplicidade

priorizar simplicidade.

O sistema deve permitir que um funcionário cadastre um veículo rapidamente sem treinamento complexo.

---

# Definição de Sucesso

O UX será considerado bem-sucedido quando um lojista conseguir:

1. Entrar no painel.
2. Entender a situação da operação em menos de 30 segundos.
3. Cadastrar um veículo sem ajuda.
4. Publicar o veículo.
5. Ver o veículo aparecer no site.

Sem dúvidas ou necessidade de treinamento.
