import type { Appearance, Density, SummaryDisplayMode, SummaryType, ThemeName } from '@brunomouradev/pivot-grid';
import { BASES, IdBase } from './bases';

/** Tudo o que o painel de opções do PivotGrid controla. */
export interface OpcoesPivot {
  base: IdBase;
  fonte: 'local' | 'grande';

  // Aparência
  theme: ThemeName;
  appearance: Appearance;
  density: Density;
  locale: 'pt-BR' | 'en-US';
  corPrimaria: string;

  // Layout dos campos
  /** id de um preset da base (bases.ts). */
  linhas: string;
  colunas: string;
  expandido: boolean;

  // Valores
  medida: string;
  summaryType: SummaryType;
  /** 'nenhum' ou o id de um segundo valor da base. */
  segundoValor: string;
  summaryDisplayMode: SummaryDisplayMode;
  conditionalFormat: 'nenhum' | 'colorScale' | 'dataBar' | 'regra';

  // Ordenação, Top N e filtro
  ordenarPorTotal: boolean;
  topN: 0 | 3 | 5 | 10;
  topNMenores: boolean;
  filtroInicial: boolean;

  // Totais e layout das linhas
  rowLayout: 'tree' | 'tabular';
  showRowTotals: boolean;
  showRowGrandTotals: boolean;
  showColumnGrandTotals: boolean;
  showColumnTotals: boolean;
  rowHeaderWidth: number;

  // Interação
  showFieldPanel: boolean;
  showExpandButtons: boolean;
  allowFieldDragging: boolean;
  allowSorting: boolean;
  allowFiltering: boolean;

  // Exportação
  showExportButton: boolean;
  exportXlsx: boolean;
  exportCsv: boolean;
  exportFileName: string;

  // Textos
  mensagens: boolean;
}

export const PIVOT_PADRAO: OpcoesPivot = {
  base: 'vendas',
  fonte: 'local',
  theme: 'default',
  appearance: 'light',
  density: 'standard',
  locale: 'pt-BR',
  corPrimaria: '',
  linhas: 'regiao-uf',
  colunas: 'ano-trimestre',
  expandido: false,
  medida: 'faturamento',
  summaryType: 'sum',
  segundoValor: 'nenhum',
  summaryDisplayMode: 'absolute',
  conditionalFormat: 'dataBar',
  ordenarPorTotal: true,
  topN: 0,
  topNMenores: false,
  filtroInicial: false,
  rowLayout: 'tree',
  showRowTotals: true,
  showRowGrandTotals: true,
  showColumnGrandTotals: true,
  showColumnTotals: true,
  rowHeaderWidth: 220,
  showFieldPanel: true,
  showExpandButtons: true,
  allowFieldDragging: true,
  allowSorting: true,
  allowFiltering: true,
  showExportButton: true,
  exportXlsx: true,
  exportCsv: true,
  exportFileName: 'vendas',
  mensagens: false,
};

export const MODOS_EXIBICAO: { id: SummaryDisplayMode; rotulo: string }[] = [
  { id: 'absolute', rotulo: 'Valor' },
  { id: 'percentOfGrandTotal', rotulo: '% do total geral' },
  { id: 'percentOfRowTotal', rotulo: '% do total da linha' },
  { id: 'percentOfColumnTotal', rotulo: '% do total da coluna' },
  { id: 'percentOfParentRow', rotulo: '% do grupo pai (linhas)' },
  { id: 'percentOfParentColumn', rotulo: '% do grupo pai (colunas)' },
  { id: 'differenceFromPrevious', rotulo: 'Diferença da coluna anterior' },
  { id: 'percentDifferenceFromPrevious', rotulo: '% de diferença da anterior' },
  { id: 'runningTotal', rotulo: 'Acumulado' },
];

/** Opções ao trocar de base: o que depende dos campos volta ao padrão daquela base. */
export function opcoesDaBase(o: OpcoesPivot, base: IdBase): OpcoesPivot {
  const p = BASES[base].padrao;
  return {
    ...o,
    base,
    linhas: p.linhas,
    colunas: p.colunas,
    medida: p.medida,
    conditionalFormat: p.conditionalFormat,
    segundoValor: 'nenhum',
    summaryType: 'sum',
    summaryDisplayMode: 'absolute',
    topN: 0,
    filtroInicial: false,
    exportFileName: base === 'vendas' ? 'vendas' : 'carteira',
  };
}
