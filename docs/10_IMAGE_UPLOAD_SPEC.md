# 10_IMAGE_UPLOAD_SPEC.md

# Especificação de Upload de Imagens

## Objetivo

Definir o comportamento funcional do upload de imagens dos veículos.

Importante:

O objetivo não é alterar a experiência visual já existente.

O objetivo é conectar o fluxo atual a um armazenamento real e garantir funcionamento completo.

---

# Diretriz Principal

Preservar a interface criada no Lovable.

Não criar novos componentes.

Não alterar o fluxo atual.

Não redesenhar a experiência de upload.

O foco é implementar persistência, recuperação e gerenciamento das imagens.

---

# Fluxo Esperado

Usuário acessa:

Admin → Veículos → Novo Veículo

Realiza upload das imagens utilizando a interface atual.

As imagens devem ser:

1. Exibidas em preview.
2. Enviadas para Storage.
3. Associadas ao veículo.
4. Recuperadas posteriormente para edição.

---

# Storage

Utilizar:

Supabase Storage

Bucket:

```txt
vehicles
```

---

# Estrutura Recomendada

```txt
vehicles/

vehicle_id/

image-01.jpg
image-02.jpg
image-03.jpg
```

---

# Comportamento do Upload

Ao selecionar imagens:

O sistema deve:

1. Validar arquivos.
2. Exibir preview.
3. Permitir continuar edição.
4. Fazer upload ao salvar.

---

# Tipos Permitidos

Permitir:

```txt
jpg
jpeg
png
webp
```

---

# Tamanho Máximo

Primeira versão:

```txt
10 MB por imagem
```

---

# Quantidade de Imagens

Não limitar artificialmente.

O sistema deve aceitar múltiplas imagens.

Para demonstração comercial considerar:

```txt
10 a 30 imagens por veículo
```

---

# Preview

A experiência atual deve ser mantida.

O usuário deve visualizar as imagens antes de salvar.

O preview não substitui o upload real.

---

# Imagem Principal

Cada veículo deve possuir uma imagem principal.

Responsabilidades:

* listagem do estoque;
* destaques;
* página individual;
* compartilhamentos futuros.

---

# Ordenação

Caso a interface atual permita ordenação:

Preservar comportamento existente.

Salvar a ordem no banco.

Campo recomendado:

```txt
sort_order
```

---

# Exclusão

O usuário deve conseguir remover imagens.

Ao remover:

* excluir referência do banco;
* excluir arquivo do storage.

Evitar arquivos órfãos.

---

# Edição de Veículo

Ao abrir um veículo já cadastrado:

O sistema deve recuperar:

* imagens existentes;
* imagem principal;
* ordem das imagens.

Sem necessidade de novo upload.

---

# Compressão

Primeira versão:

Não implementar compressão customizada.

Apenas garantir:

* carregamento rápido;
* exibição otimizada.

Caso necessário utilizar apenas redimensionamento simples.

---

# URLs

As URLs das imagens devem ser armazenadas e recuperadas automaticamente.

O frontend não deve depender de caminhos fixos.

---

# Tratamento de Erros

Exemplos:

## Arquivo inválido

Mensagem:

"Formato de arquivo não suportado."

---

## Tamanho excedido

Mensagem:

"Arquivo excede o limite permitido."

---

## Falha de upload

Mensagem:

"Não foi possível enviar a imagem. Tente novamente."

---

# Segurança

Permitir upload apenas para usuários autenticados.

Não permitir gravação anônima no Storage.

---

# Performance

Objetivos:

* upload rápido;
* preview imediato;
* recuperação rápida;
* evitar recarregamentos desnecessários.

---

# Integração com Veículos

As imagens sempre pertencem a um veículo.

Relacionamento:

```txt
vehicle

↓

vehicle_images

↓

storage
```

---

# Compatibilidade

Toda implementação deve respeitar:

* layout atual;
* componentes atuais;
* fluxo atual do Lovable.

Não alterar a experiência validada.

---

# Critério de Sucesso

O módulo será considerado concluído quando:

1. O usuário enviar imagens.
2. As imagens forem armazenadas no Supabase Storage.
3. O veículo for salvo com as imagens vinculadas.
4. As imagens aparecerem no site público.
5. O veículo puder ser editado posteriormente.
6. Nenhuma mudança visual significativa seja necessária.
