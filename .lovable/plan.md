# Otimização Mobile — Site Público + Cockpit /admin

Trabalho em camadas, sem mudar regras de negócio. Foco em layout responsivo, navegação touch e performance.

## 1. Navegação e shell

**Site público (`_public.tsx`)**
- Header com menu hamburger (Sheet do shadcn) abaixo de `md`. Logo compacta, CTA principal visível.
- Footer em coluna única no mobile, blocos colapsáveis.

**Cockpit (`admin.tsx`)**
- Sidebar vira drawer (Sheet) controlado por botão no `AdminTopbar` em telas `< lg`.
- Topbar: título truncado, ações secundárias em menu "..." no mobile, busca em ícone que expande.
- Bottom nav opcional (Home, Estoque, Leads, Relatórios) para acesso rápido em telas pequenas.

## 2. Páginas públicas

- **Home (`_public.index.tsx`)**: hero com tipografia fluida (`clamp`), grids `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, imagens com `loading="lazy"` e `sizes`.
- **Estoque (`_public.estoque.tsx`)**: filtros colapsam em Sheet "Filtrar"; cards em 1 coluna mobile, 2 em sm, 3 em lg.
- **Detalhe do veículo (`_public.veiculo.$slug.tsx`)**: galeria swipeable, specs em accordion, CTA fixo no rodapé (`sticky bottom-0`) com WhatsApp/Simular.
- **Contato, Sobre, Financiamento, Vender**: formulários full-width, inputs `h-12`, espaçamento confortável.

## 3. Cockpit /admin

- **Home Dashboard (`admin.index.tsx`)**: KPI cards em grid `grid-cols-2 lg:grid-cols-4`, gráficos com altura mínima e scroll horizontal quando necessário, tabelas viram cards no mobile.
- **Estoque (`admin.veiculos.index.tsx`)**: tabela vira lista de cards `< md`; ações em menu kebab; filtros em Sheet.
- **Leads (`admin.leads.*`)**: kanban scrollável horizontal com snap; detalhe em drawer.
- **Relatórios (`admin.relatorios.tsx`)**: gráficos SVG com `viewBox` responsivo; KPI strip 2 colunas mobile; rankings em cards empilhados.
- **Novo veículo (`admin.veiculos.novo.tsx`)**: stepper horizontal vira progress bar + label no mobile; botões Voltar/Próximo fixos no rodapé; uploads de foto otimizados para `capture="environment"`.

## 4. Padrões responsivos aplicados em todo lugar

- Containers: `px-4 sm:px-6 lg:px-8`, `max-w-7xl mx-auto`.
- Tipografia fluida: `text-2xl sm:text-3xl lg:text-4xl` em títulos chave.
- Headers densos seguem padrão `grid-cols-[minmax(0,1fr)_auto]` + `min-w-0` + `shrink-0` para não estourar.
- Tabelas com `overflow-x-auto` + variante card `< md` quando aplicável.
- Toques: alvos `min-h-11`, espaçamento entre ações `gap-3+`.
- Modais/Sheets full-screen `< sm`.

## 5. Performance

- Imagens públicas com `loading="lazy"`, `decoding="async"`, `sizes` apropriados; LCP da home com `fetchpriority="high"` e preload via `head().links`.
- Code-splitting por rota já é nativo do TanStack — garantir que componentes pesados (galeria, gráficos) usem `lazy()` quando fora do viewport inicial.
- Reduzir reflows em listas longas (virtualização só se necessário).
- Revisar bundle de admin: evitar importar gráficos no shell.

## 6. QA

- Testar em viewports 360, 390, 414, 768, 1024 com `browser--view_preview`.
- Verificar admin (home, estoque, leads, relatórios, novo veículo) e site (home, estoque, detalhe).
- Conferir Web Vitals com `browser--performance_profile` na home pública.

## Detalhes técnicos

- Sheet/Drawer: `@/components/ui/sheet`.
- Hook `useIsMobile` já existente em `src/hooks/use-mobile.tsx` para condicionar shell.
- Sem alteração em server functions, schema ou regras de negócio.
- Sem novas dependências.
