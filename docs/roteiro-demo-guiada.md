# Roteiro da Demo Guiada — Atomo Car Cockpit

> **Antes de apresentar:** rode `docs/sql/013_demo_seed.sql` no SQL Editor do Supabase.
> Isso zera o operacional e repõe um cenário **atual** (datas relativas a hoje).
> Login: **atomo@car.com** / **123**. Navegue **por cliques** (não digite URLs / não dê refresh
> na página de detalhe de um carro vendido — só o hard-refresh esbarra no SSR anônimo).

Duração alvo: **8–12 minutos**. Fio condutor: **"Estoque é dinheiro — e aqui você enxerga cada real."**

---

## Ato 1 — "Sua loja em 5 segundos" · Central de Operações
Tela inicial após o login.
- **Barra de saúde** (âmbar): a loja tem pontos de atenção — resume tudo em uma linha.
- **Atenção hoje**: conta **vencida** (Estética JS), **veículo parado +120 dias** (VW Up!), recebimento atrasado (Creta financiada).
- **4 KPIs de dinheiro**: Lucro do mês (com Δ% vs. mês passado), Você tem a receber, A vencer em 7 dias (vencidas em vermelho), Capital em estoque.
- **Lucro por mês** (6 meses) com o mês atual destacado + **Previsão de caixa**.
- **Dinheiro parado no pátio** por faixa (0–60 saudável … +120 crítico) — o Up! é o vilão.

**Fala-chave:** "Em 5 segundos o dono sabe se a loja está bem e o que precisa de ação hoje."

## Ato 2 — "Cada carro é dinheiro" · Estoque + detalhe
- **Veículos → Estoque**: 6 carros publicados, com foto, aging variado.
- Abra o **Jeep Renegade** (clique). Passeie pelas abas:
  - **Custos & Margem**: aquisição + custos de preparação → **margem projetada**.
  - **Fotos** · **Conteúdo IA** (texto de anúncio/SEO/redes) · **Qualidade** (checklist).
  - **Histórico**: a **auditoria do carro** — quem lançou custo, definiu aquisição etc.

**Fala-chave:** "Você sabe exatamente quanto investiu e quanto vai lucrar em cada carro."

## Ato 3 — "Cadastro em minutos" · Novo veículo
- **Veículos → Novo veículo**: mostre o wizard e o **preenchimento por placa** (autofill).
- *(Opcional)* cadastrar um carro ao vivo e publicar → aparece no site.

**Fala-chave:** "Menos digitação: a placa preenche o carro; publica em um clique."

## Ato 4 — "Vendeu? Lucro real na hora" · Registrar venda
- **Vendas → Registrar venda**: escolha um carro do pátio, mostre os 3 passos.
- No passo 2, destaque **Documento (CPF/CNPJ)** e, ao escolher **Financiamento**, os campos
  **Entrada** e a **prévia do recebível** (entra agora X, fica a receber Y).
- Passo 3: **lucro real** (venda − aquisição − custos − comissão) calculado na hora.
- *(Opcional)* confirmar a venda → cai em Vendas Realizadas; reflete em Comissões, A receber e Atividade.

**Fala-chave:** "No fim da venda o dono já sabe o lucro líquido e a comissão do vendedor."

## Ato 5 — "O dinheiro da loja" · Financeiro
- **Visão geral**: fluxo de caixa com **filtro de período** (3/6/12 meses) + próximos compromissos.
- **A pagar**: recorrências (aluguel/energia/marketing/contador), **vencida em vermelho**,
  botões **Editar/Pagar**; mostre **"Lançar" → Repetir** (recorrência/parcelamento) com prévia.
- **A receber**: recebíveis de vendas **financiadas em aberto** + **atrasado** (Creta) +
  categorias próprias de receita (**Entrada/Sinal**, **Parcela/Financiamento**).
- **Custos por veículo**: relatório de investido × margem, com busca e ordenação.

**Fala-chave:** "Contas a pagar e a receber, recorrências e custos — tudo num lugar só."

## Ato 6 — "Time e comissões" · Comissões
- **Vendas → Comissões**: total a pagar + **em aberto** (Carlos e Ana) e **histórico pago**.
- Mostre **marcar como paga**.

## Ato 7 — "Nada escapa" · Atividade
- **Atividade**: feed de **quem fez o quê** (vendas, custos, pagamentos, edições) com autor e horário.

**Fala-chave:** "Rastreabilidade total — cada ação fica registrada com nome e data."

## Ato 8 — "O site que vende sozinho" · Site público
- Abra o **site público** → estoque publicado (os 6 carros com foto), página individual do veículo.

**Fala-chave:** "O que você cadastra no painel já está no ar para o cliente."

---

### Dicas de operação
- **Resetar a demo a qualquer momento:** rode `013_demo_seed.sql` de novo (idempotente).
- **Papel vendedor** (opcional): `vendedor@teste.com` / `123` → menu reduzido, sem custos/lucro/financeiro (mostra o controle de acesso).
- Evite **F5** na página de um **carro vendido** (SSR anônimo → "não encontrado"); navegue por cliques.
