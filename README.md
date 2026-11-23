# DataGrid · Protótipo

Protótipo em **Angular 20** do [`@brunomouradev/data-grid`](https://www.npmjs.com/package/@brunomouradev/data-grid)
([código da biblioteca](https://github.com/antoniobrunomourateixeira/brunomouradev-ui)).

Todas as opções da grid ficam num painel lateral, os métodos em botões e os eventos num log ao vivo.
O código equivalente em **Angular, React, Vue e HTML puro** é gerado conforme as opções marcadas.

![Visão geral](docs/prints/01-visao-geral.png)

## Prints

**Bootstrap 5 escuro, agrupado por UF, com seleção múltipla e totais por grupo**

![Tema escuro agrupado](docs/prints/02-tema-escuro-agrupado.png)

**Material compacto: filtro no cabeçalho, linha de filtro, barra de filtros ativos e regras de linha (`rowClass` / `rowStyle`)**

![Material com filtros e regras](docs/prints/03-material-filtros-regras.png)

**100 mil linhas com rolagem virtual**

![100 mil linhas](docs/prints/05-100-mil-linhas.png)

**Código gerado (Angular, React, Vue, HTML puro) e log de eventos**

![Código e eventos](docs/prints/04-codigo-e-eventos.png)

## O que dá para testar

- **Dados:** 500 linhas, 100 mil linhas (rolagem virtual) ou servidor simulado (`remoteData`)
- **Aparência:** tema (`default`, `bootstrap4`, `bootstrap5`, `tailwind`, `material`), claro/escuro/auto, densidade, idioma e cor de destaque
- **Filtro e busca:** linha de filtro, funil no cabeçalho, busca global, barra de filtros ativos
- **Colunas:** seletor, arrastar, redimensionar, largura pelo conteúdo, coluna fixa, coluna opcional
- **Seleção:** nenhuma, única ou múltipla
- **Paginação:** tamanho da página, seletor de tamanho, info
- **Agrupamento:** painel de grupos, agrupar ao abrir, expandir/recolher, totais por grupo
- **Totais e regras:** totais no rodapé, `rowClass`, `rowStyle`, `cssClass` e templates de célula (`bmCellTemplate`)
- **Exportação:** Excel e CSV, nome do arquivo
- **Estado:** `stateStoring` (localStorage) e texto de "sem dados"
- **Métodos:** `selectAll`, `selectRows`, `sortBy`, `groupBy`, `expandAll`, `navigateToRow`, `exportToExcel`, `resetColumnLayout`…

## Rodar

Precisa do Node 20.19 ou superior (exigência do Angular 20):

```bash
nvm use 20.19.0
npm install
npm start
```

Abra http://localhost:4200.

## Arquivos

| Arquivo | O que tem |
|---|---|
| `src/app/app.ts` / `app.html` | tela, ligação das opções com a grid, métodos e eventos |
| `src/app/opcoes.ts` | todas as opções do painel e os valores iniciais |
| `src/app/gerador-codigo.ts` | gera o código de exemplo para cada framework |
| `src/app/bm-cell-template.directive.ts` | diretiva `bmCellTemplate` (templates de célula do Angular) |
| `src/app/data.ts` | faturas fictícias (500 ou 100 mil linhas) |
| `src/styles.scss` | CSS das regras de linha/célula via `::part()` |

O modo "Servidor" simula um back-end com o motor da própria lib (`@brunomouradev/data-grid/engine`).

## Links

- Biblioteca: https://github.com/antoniobrunomourateixeira/brunomouradev-ui
- npm: https://www.npmjs.com/package/@brunomouradev/data-grid
