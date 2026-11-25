# brunomouradev-ui · Demonstração

Demonstração em **Angular 20** dos componentes da [brunomouradev-ui](https://github.com/antoniobrunomourateixeira/brunomouradev-ui):
[`@brunomouradev/data-grid`](https://www.npmjs.com/package/@brunomouradev/data-grid) e
[`@brunomouradev/pivot-grid`](https://www.npmjs.com/package/@brunomouradev/pivot-grid).

Cada componente tem uma página com todas as opções num painel lateral, os métodos em botões e os eventos num log ao vivo.
O código equivalente em **Angular, React, Vue e HTML puro** é gerado conforme as opções marcadas.

**▶ Ver rodando:** https://antoniobrunomourateixeira.github.io/datagrid-prototipo/

| Página | Endereço |
|---|---|
| DataGrid | https://antoniobrunomourateixeira.github.io/datagrid-prototipo/#/datagrid |
| PivotGrid | https://antoniobrunomourateixeira.github.io/datagrid-prototipo/#/pivot |

![DataGrid](docs/prints/01-visao-geral.png)

## DataGrid

**Bootstrap 5 escuro, agrupado por UF, com seleção múltipla e totais por grupo**

![Tema escuro agrupado](docs/prints/02-tema-escuro-agrupado.png)

**Material compacto: funil no cabeçalho, linha de filtro, barra de filtros ativos embaixo da tabela (cada filtro com × para remover), regras de linha (`rowClass` / `rowStyle`) e célula por função (`cellRender`)**

![Material com filtros e regras](docs/prints/03-material-filtros-regras.png)

**100 mil linhas com rolagem virtual**

![100 mil linhas](docs/prints/05-100-mil-linhas.png)

**Código gerado (Angular, React, Vue, HTML puro) e log de eventos**

![Código e eventos](docs/prints/04-codigo-e-eventos.png)

### O que dá para testar

- **Dados:** 500 linhas, 100 mil linhas (rolagem virtual) ou servidor simulado (`remoteData`)
- **Aparência:** tema (`default`, `bootstrap4`, `bootstrap5`, `tailwind`, `material`), claro/escuro/auto, densidade, idioma e cor de destaque
- **Filtro e busca:** linha de filtro, funil no cabeçalho, busca global, barra de filtros ativos embaixo da tabela (`show-filter-panel`) e filtros iniciais (`filterValue`, `selectedFilterOperation`, `filterValues`, `filterType`)
- **Colunas:** seletor, arrastar, redimensionar, largura pelo conteúdo, coluna fixa, coluna opcional
- **Seleção:** nenhuma, única ou múltipla
- **Paginação:** tamanho da página, seletor de tamanho, info
- **Agrupamento:** painel de grupos, agrupar ao abrir, expandir/recolher, totais por grupo
- **Totais e regras:** totais no rodapé, `rowClass`, `rowStyle`, `cssClass`, templates de célula (`bmCellTemplate`) e `cellRender` + `cellStyles`
- **Exportação:** Excel e CSV, nome do arquivo e da aba (`export-sheet-name`)
- **Estado e textos:** `stateStoring` (localStorage), `messages` (textos personalizados), `loading` e texto de "sem dados"
- **Servidor:** `remoteData` e `remoteHeaderFilter` (valores do funil vindos do servidor)
- **Teclado:** setas, Enter (`row-enter`), espaço seleciona, Ctrl+A, Ctrl+C copia para o Excel (`copy-rows`)
- **Métodos:** `selectAll`, `selectRows`, `sortBy`, `groupBy`, `expandAll`, `navigateToRow`, `exportToExcel`, `resetColumnLayout`…

## PivotGrid

**Vendedor › Status por Ano › Trimestre, com barras (`dataBar`) e painel de campos para arrastar**

![PivotGrid](docs/prints/06-pivot-visao-geral.png)

**Bootstrap 5, layout tabular, escala de cores (`colorScale`) e dois valores (soma e quantidade)**

![Pivot tabular com cores](docs/prints/07-pivot-tabular-cores.png)

**Drill down: duplo clique numa célula mostra as faturas por trás dela numa DataGrid**

![Drill down](docs/prints/08-pivot-drill-down.png)

### O que dá para testar

- **Campos:** linhas e colunas pré-montadas (UF › Cliente, Vendedor › Status, Ano › Trimestre, Ano › Mês…), campos sem área no painel para arrastar, grupos abertos (`expanded`)
- **Valores:** agregação (`sum`, `avg`, `count`, `min`, `max`), segundo valor, **mostrar valores como** (`summaryDisplayMode`: % do total, % da linha/coluna, % do pai, diferença, acumulado)
- **Formatação condicional:** barras (`dataBar`), escala de cores (`colorScale`) ou regra própria (função)
- **Ordenação e Top N:** linhas pelo maior total (`sortBySummaryField`), `topN` (maiores ou menores), filtro inicial (`filterValues` / `filterType`)
- **Layout:** árvore ou tabular (`row-layout`), linha "X Total", largura do cabeçalho, totais gerais e subtotais
- **Interação:** painel de campos, expandir/recolher tudo, travar arrastar, ordenar e filtrar
- **Exportação e textos:** Excel e CSV, nome do arquivo, `messages`
- **Métodos:** `expandAll`, `collapseAll`, `sortBySummary`, `updateField`, `moveField`, `drillDown`, `getFields`, `exportToExcel`…
- **Eventos:** `cell-click`, `cell-dblclick` (com os registros da célula), `fields-changed`

## Rodar

Precisa do Node 20.19 ou superior (exigência do Angular 20):

```bash
nvm use 20.19.0
npm install
npm start
```

Abra http://localhost:4200. Cada push na `main` publica o site no GitHub Pages (`.github/workflows/pages.yml`).

## Arquivos

| Arquivo | O que tem |
|---|---|
| `src/app/app.ts` / `app.routes.ts` | topo com o menu e as rotas (`#/datagrid`, `#/pivot`) |
| `src/app/datagrid/` | página da DataGrid: tela, opções (`opcoes.ts`) e gerador de código |
| `src/app/pivot/` | página do PivotGrid: tela, opções, campos (`campos.ts`) e gerador de código |
| `src/app/shared/painel-codigo.ts` | cartão do código (abas Angular, React, Vue, HTML puro) |
| `src/app/shared/painel-eventos.ts` | cartão do log de eventos |
| `src/app/shared/bm-cell-template.directive.ts` | diretiva `bmCellTemplate` (templates de célula do Angular) |
| `src/app/shared/data.ts` | faturas fictícias usadas pelas duas páginas |
| `src/app/shared/_demo.scss` | estilos comuns das páginas |
| `src/styles.scss` | estilos globais e CSS das regras de linha/célula via `::part()` |

O modo "Servidor" da DataGrid simula um back-end com o motor da própria lib (`@brunomouradev/data-grid/engine`).

## Links

- Online (GitHub Pages): https://antoniobrunomourateixeira.github.io/datagrid-prototipo/
- Biblioteca: https://github.com/antoniobrunomourateixeira/brunomouradev-ui
- npm: [@brunomouradev/data-grid](https://www.npmjs.com/package/@brunomouradev/data-grid) · [@brunomouradev/pivot-grid](https://www.npmjs.com/package/@brunomouradev/pivot-grid)
