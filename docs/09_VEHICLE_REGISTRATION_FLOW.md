# 09_VEHICLE_REGISTRATION_FLOW.md

# Fluxo de Cadastro de Veículos

## Objetivo

Este documento descreve o comportamento funcional esperado do cadastro de veículos.

Importante:

O objetivo NÃO é redesenhar a interface atual criada no Lovable.

O objetivo é preservar a experiência existente e conectar os componentes já criados a dados reais.

O Claude Code deve priorizar a implementação funcional sem alterar a estrutura visual validada.

---

# Diretriz Principal

Preservar a UX existente.

Não criar novos passos.

Não transformar em wizard.

Não alterar layout sem necessidade.

Não modificar componentes visuais aprovados.

O foco é substituir mock data por persistência real.

---

# Fluxo Atual Esperado

O usuário acessa:

Admin → Veículos → Novo Veículo

Preenche os campos disponíveis na interface atual.

Realiza upload das imagens.

Salva o veículo.

O sistema persiste os dados.

O veículo fica disponível para publicação.

Quando publicado:

* aparece no estoque público;
* recebe página individual;
* fica disponível para consulta no site.

---

# Comportamento Esperado

## Criar Veículo

Ao clicar em salvar:

O sistema deve:

1. Validar os campos obrigatórios.
2. Fazer upload das imagens.
3. Salvar o veículo no banco.
4. Salvar relacionamento das imagens.
5. Retornar confirmação visual.

---

# Editar Veículo

O usuário deve conseguir:

* alterar informações;
* alterar preço;
* alterar descrição;
* alterar opcionais;
* adicionar imagens;
* remover imagens.

Sem recriar o veículo.

---

# Publicar Veículo

Ao alterar status para:

```txt
published
```

O veículo deve:

* aparecer automaticamente no estoque público;
* aparecer em destaques quando aplicável;
* possuir URL própria.

---

# Despublicar Veículo

Ao alterar status para:

```txt
draft
```

ou

```txt
archived
```

O veículo não deve mais aparecer no estoque público.

---

# Upload de Imagens

A experiência visual atual deve ser preservada.

O Claude Code deve apenas implementar:

* upload real;
* armazenamento em storage;
* recuperação das imagens;
* exclusão;
* ordenação existente.

Sem alterar o componente visual.

---

# Imagem Principal

A lógica atual da interface deve ser mantida.

Uma imagem deve ser utilizada como capa.

Essa imagem será exibida:

* na listagem do estoque;
* nos destaques;
* na página individual.

---

# Página Individual

Após publicação do veículo:

Uma página pública deve ser gerada utilizando os dados cadastrados.

A página deve consumir diretamente os dados do banco.

Não utilizar mock data.

---

# Integração com Estoque

O estoque público deve utilizar exclusivamente dados reais.

Sempre que um veículo for:

* criado;
* alterado;
* publicado;
* arquivado;

a informação deve refletir automaticamente no site.

---

# Fonte da Verdade

Toda informação do veículo deve existir no banco de dados.

A interface deve apenas exibir e manipular os dados.

Nenhum dado operacional deve permanecer apenas em estado local.

---

# Regras de Negócio

Um veículo só pode ser publicado quando possuir:

* marca;
* modelo;
* preço;
* pelo menos uma imagem.

---

# Compatibilidade

Toda implementação deve respeitar:

* layout atual;
* componentes atuais;
* experiência criada no Lovable;
* identidade visual existente.

O objetivo deste documento é conectar o sistema ao backend, não redesenhar o produto.

---

# Critério de Sucesso

O fluxo será considerado concluído quando:

1. O usuário cadastrar um veículo pela interface atual.
2. As imagens forem enviadas ao storage.
3. Os dados forem gravados no banco.
4. O veículo aparecer automaticamente no estoque público.
5. A página individual funcionar.
6. Nenhum ajuste visual relevante seja necessário.

