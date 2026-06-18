# 02_PRODUCT_REQUIREMENTS.md

# Requisitos do Produto

## Nome do Produto

Primos Cockpit

---

# Objetivo

Construir uma plataforma operacional para revendas de veículos seminovos.

O foco principal é simplificar o cadastro, gestão e publicação de veículos, criando uma experiência moderna para o lojista.

---

# Escopo do MVP

A primeira versão funcional deve permitir uma demonstração comercial completa.

O sistema deve possibilitar:

* login administrativo;
* cadastro de veículos;
* upload de imagens;
* publicação de veículos;
* atualização automática do estoque público;
* visualização dos veículos cadastrados;
* dashboard administrativo;
* relatórios básicos.

---

# Módulos do Sistema

## Site Público

### Home

Objetivos:

* transmitir confiança;
* apresentar a empresa;
* exibir veículos em destaque;
* gerar contato comercial.

Funcionalidades:

* banner principal;
* veículos em destaque;
* diferenciais da empresa;
* botão de contato;
* navegação para estoque.

---

### Estoque

Objetivos:

* listar veículos disponíveis;
* facilitar busca e navegação.

Funcionalidades:

* listagem de veículos;
* filtros;
* ordenação;
* busca.

---

### Página do Veículo

Objetivos:

* apresentar o veículo de forma profissional.

Funcionalidades:

* galeria de imagens;
* informações técnicas;
* descrição;
* opcionais;
* botão de contato.

---

# Painel Administrativo

## Dashboard

Objetivo:

Apresentar visão geral da operação.

Funcionalidades:

* quantidade de veículos;
* veículos pendentes;
* leads pendentes;
* alertas;
* indicadores operacionais;
* insights futuros.

---

## Veículos

Objetivo:

Gerenciar estoque.

Funcionalidades:

* listar veículos;
* pesquisar veículos;
* editar veículo;
* excluir veículo;
* alterar status.

---

## Cadastro de Veículo

Objetivo:

Cadastrar veículos rapidamente.

Funcionalidades obrigatórias:

* marca;
* modelo;
* versão;
* ano fabricação;
* ano modelo;
* quilometragem;
* preço;
* cor;
* combustível;
* câmbio;
* descrição;
* opcionais;
* upload de fotos;
* imagem principal.

---

## Leads

Objetivo:

Centralizar oportunidades comerciais.

Primeira versão:

* dados simulados ou básicos.

Versões futuras:

* integração com WhatsApp;
* integração com formulários;
* CRM completo.

---

## Relatórios

Objetivo:

Gerar visão executiva da operação.

Primeira versão:

* indicadores básicos;
* gráficos;
* resumo operacional.

Versões futuras:

* conversão;
* origem de leads;
* desempenho de vendedores;
* análise de estoque.

---

# Status de Veículo

Todo veículo deve possuir um status.

Status disponíveis:

* Rascunho
* Publicado
* Reservado
* Vendido
* Arquivado

---

# Campos Obrigatórios

Nenhum veículo pode ser publicado sem:

* marca;
* modelo;
* versão;
* ano;
* preço;
* pelo menos uma foto.

---

# Gestão de Imagens

Cada veículo deve permitir:

* múltiplas imagens;
* seleção da imagem principal;
* reordenação;
* exclusão.

---

# Atualização do Site

Quando um veículo for publicado:

* deve aparecer automaticamente no estoque.

Quando um veículo for removido:

* deve desaparecer do estoque.

Quando um veículo for alterado:

* deve refletir no site.

---

# Requisitos de Performance

O sistema deve:

* carregar rapidamente;
* otimizar imagens;
* evitar consultas desnecessárias;
* manter boa experiência em dispositivos móveis.

---

# Requisitos de UX

A experiência deve ser:

* intuitiva;
* rápida;
* moderna;
* profissional.

O usuário principal não é técnico.

Toda operação deve exigir o menor número possível de cliques.

---

# Requisitos de Escalabilidade

Mesmo sendo um MVP, a arquitetura deve permitir:

* múltiplas lojas;
* múltiplos usuários;
* múltiplos vendedores;
* múltiplos estoques.

Sem necessidade de refatoração completa no futuro.

---

# Funcionalidades Futuras

Estas funcionalidades NÃO fazem parte do MVP atual.

Devem apenas ser consideradas na arquitetura.

## Inteligência Artificial

* geração de descrição;
* geração de anúncios;
* sugestões comerciais;
* análise de estoque.

---

## Marketing

* geração de conteúdo;
* publicação automática;
* campanhas.

---

## Atendimento

* WhatsApp;
* chatbot;
* qualificação de leads;
* distribuição de atendimentos.

---

## CRM Avançado

* pipeline comercial;
* atividades;
* negociações;
* histórico.

---

# Critério de Sucesso

O MVP será considerado pronto quando:

1. Um veículo puder ser cadastrado pelo painel.
2. As imagens forem enviadas para storage.
3. Os dados forem salvos no banco.
4. O veículo aparecer automaticamente no site público.
5. O fluxo completo funcionar sem intervenção técnica.

