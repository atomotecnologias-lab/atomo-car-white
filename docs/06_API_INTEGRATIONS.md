# 06_API_INTEGRATIONS.md

# Integrações e APIs

## Objetivo

Definir as integrações necessárias para transformar o Primos Cockpit em um MVP funcional para demonstração comercial.

O foco imediato é:

* autenticação;
* banco de dados;
* upload de imagens;
* sincronização entre painel e site público.

Integrações avançadas devem ser preparadas, mas não implementadas no MVP inicial.

---

# Integração Principal

## Supabase

O Supabase será utilizado como base principal do MVP.

Responsabilidades:

* autenticação;
* banco de dados;
* storage de imagens;
* realtime;
* políticas de segurança.

---

# Supabase Auth

## Objetivo

Permitir acesso protegido ao painel administrativo.

## Funcionalidades necessárias

* login por e-mail e senha;
* logout;
* sessão persistente;
* proteção das rotas `/admin`.

## Regras

* O site público deve permanecer acessível sem login.
* O painel administrativo deve exigir autenticação.
* Usuários não autenticados devem ser redirecionados para login.

---

# Supabase Database

## Objetivo

Armazenar os dados reais da operação.

Tabelas principais:

* dealerships;
* users;
* vehicles;
* vehicle_images;
* vehicle_features;
* leads.

## Regra principal

O banco de dados deve ser a fonte única da verdade.

Não manter dados críticos apenas em mock data.

---

# Supabase Storage

## Objetivo

Armazenar imagens dos veículos.

## Bucket

```txt
vehicles
```

## Estrutura recomendada

```txt
vehicles/{vehicle_id}/{image_name}
```

## Funcionalidades obrigatórias

* upload de múltiplas imagens;
* preview antes de salvar;
* definição de imagem principal;
* exclusão de imagem;
* associação da imagem ao veículo.

---

# Supabase Realtime

## Objetivo

Permitir que atualizações no painel reflitam rapidamente no site público.

## Casos de uso

* novo veículo publicado;
* veículo editado;
* veículo vendido;
* veículo arquivado;
* alteração de imagem principal.

## Regra

Realtime deve ser usado quando fizer sentido, mas sem criar complexidade desnecessária.

Para o MVP, também é aceitável utilizar refetch automático após salvar.

---

# API de Consulta por Placa

## Status

Futura integração.

Não implementar no MVP inicial, a menos que solicitado explicitamente.

## Objetivo futuro

Permitir que o usuário digite apenas a placa do veículo e o sistema busque dados básicos automaticamente.

## Dados esperados

* marca;
* modelo;
* versão;
* ano;
* cor;
* combustível;
* dados técnicos.

## Regra

A arquitetura deve deixar espaço para essa integração, mas o cadastro manual deve funcionar independentemente dela.

---

# API de Inteligência Artificial

## Status

Futura integração.

Não implementar no MVP inicial, a menos que solicitado explicitamente.

## Objetivo futuro

Utilizar IA para:

* gerar descrição comercial;
* sugerir opcionais;
* criar texto para anúncio;
* gerar conteúdo para redes sociais;
* analisar estoque;
* sugerir ações comerciais.

## Regra

Criar estrutura de código preparada para serviços de IA, mas sem acoplar o MVP a uma API externa.

---

# Integrações de Marketing

## Status

Futuras integrações.

Não implementar no MVP inicial.

## Possibilidades futuras

* publicação em redes sociais;
* geração de post;
* geração de carrossel;
* preparação de anúncio;
* acompanhamento de cliques.

## Regra

O MVP deve apenas preparar os dados do veículo de forma organizada para facilitar essas integrações depois.

---

# Integrações de Atendimento

## Status

Futuras integrações.

Não implementar no MVP inicial.

## Possibilidades futuras

* WhatsApp;
* Instagram;
* Facebook;
* chatbot;
* qualificação automática de leads;
* distribuição para vendedores.

## Regra

O botão de contato do site público deve funcionar de forma simples, preferencialmente direcionando para WhatsApp.

---

# Variáveis de Ambiente

Criar arquivo `.env.example` com:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Futuras variáveis possíveis:

```env
VITE_AI_API_KEY=
VITE_PLATE_API_KEY=
VITE_WHATSAPP_PHONE=
```

Não inserir chaves reais no código.

---

# Serviços Recomendados

Organizar integrações em camada própria.

```txt
src/services/
  supabase.service.ts
  vehicle.service.ts
  image.service.ts
  auth.service.ts
```

Futuro:

```txt
src/integrations/
  ai/
  plate/
  whatsapp/
  marketing/
```

---

# Regras Técnicas

* Nenhuma chave secreta deve ser exposta no frontend.
* Toda operação crítica deve tratar erro.
* Upload de imagem deve exibir feedback ao usuário.
* Operações de cadastro devem ter loading, sucesso e erro.
* Evitar chamadas duplicadas ao banco.
* Centralizar lógica de API em services.

---

# Critério de Sucesso

A integração será considerada bem-sucedida quando:

1. O administrador conseguir fazer login.
2. O administrador conseguir cadastrar um veículo.
3. As imagens forem salvas no Storage.
4. Os dados forem salvos no Database.
5. O veículo publicado aparecer no site público.
6. O sistema funcionar sem dados mockados no fluxo principal.

