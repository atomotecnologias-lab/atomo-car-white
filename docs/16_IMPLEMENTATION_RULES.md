# 16_IMPLEMENTATION_RULES.md

# Regras de Implementação

## Objetivo

Definir como o Claude Code deve trabalhar neste projeto.

Estas regras possuem prioridade sobre preferências pessoais de implementação.

---

# Regra 1

Não alterar interfaces aprovadas sem necessidade funcional.

O projeto já possui telas construídas e validadas.

O objetivo é torná-las funcionais.

Não redesenhá-las.

---

# Regra 2

Priorizar funcionalidade antes de refinamento.

Primeiro:

* funcionar.

Depois:

* otimizar.

---

# Regra 3

Sempre apresentar plano antes de grandes alterações.

Antes de:

* refatorações;
* mudanças estruturais;
* migrações;

explicar a estratégia.

---

# Regra 4

Evitar dependências desnecessárias.

Não instalar bibliotecas quando a funcionalidade puder ser implementada com a stack existente.

---

# Regra 5

Preservar componentes existentes.

Reutilizar componentes sempre que possível.

Evitar reconstruir elementos já prontos.

---

# Regra 6

Não criar abstrações excessivas.

Preferir soluções simples, claras e fáceis de manter.

---

# Regra 7

Não criar funcionalidades fora do escopo.

O objetivo atual é:

* autenticação;
* banco;
* upload;
* cadastro;
* sincronização com o site.

Qualquer funcionalidade fora desse escopo deve ser tratada como futura.

---

# Regra 8

Banco de dados é a fonte da verdade.

Não manter dados críticos apenas em estado local.

---

# Regra 9

Não utilizar dados mockados em fluxos finalizados.

Quando um módulo for integrado ao banco, remover a dependência de mocks.

---

# Regra 10

Manter tipagem forte.

Utilizar TypeScript corretamente.

Evitar uso excessivo de:

```ts
any
```

---

# Regra 11

Toda operação deve possuir:

* loading;
* sucesso;
* erro.

O usuário sempre deve receber feedback.

---

# Regra 12

Otimizar para demonstração.

Entre duas soluções possíveis:

Escolher a mais estável para demonstração comercial.

Mesmo que não seja a solução mais sofisticada.

---

# Regra 13

Não quebrar o site público.

Toda alteração deve preservar:

* SEO existente;
* páginas existentes;
* layout existente;
* navegação existente.

---

# Regra 14

Implementar por etapas pequenas.

Evitar mudanças massivas.

Preferir:

* implementar;
* validar;
* avançar.

---

# Regra 15

Documentar alterações relevantes.

Sempre registrar:

* o que foi alterado;
* por que foi alterado;
* impacto da alteração.

---

# Definição de Sucesso

O Claude Code está seguindo corretamente estas regras quando:

* não modifica a experiência aprovada;
* implementa funcionalidades reais;
* mantém o projeto organizado;
* entrega um fluxo estável de cadastro e publicação de veículos.
