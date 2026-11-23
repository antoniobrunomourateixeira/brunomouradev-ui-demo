import type { Appearance, Density, SelectionMode, ThemeName } from '@brunomouradev/data-grid';

/** Tudo o que o painel de opções controla. */
export interface Opcoes {
  // Dados
  fonte: 'local' | 'grande' | 'remoto';

  // Aparência
  theme: ThemeName;
  appearance: Appearance;
  density: Density;
  locale: 'pt-BR' | 'en-US';
  corPrimaria: string;
  showRowLines: boolean;
  showColumnLines: boolean;
  rowAlternationEnabled: boolean;
  hoverStateDisabled: boolean;

  // Filtro e busca
  showFilterRow: boolean;
  showHeaderFilter: boolean;
  showSearchPanel: boolean;
  showFilterPanel: boolean;

  // Colunas
  columnChooserEnabled: boolean;
  allowColumnReordering: boolean;
  allowColumnResizing: boolean;
  columnAutoWidth: boolean;
  fixarId: boolean;
  colunaOpcional: boolean;

  // Seleção
  selectionMode: SelectionMode;

  // Paginação / rolagem
  virtualScrolling: boolean;
  pagingEnabled: boolean;
  pageSize: number;
  showPageSizeSelector: boolean;
  showInfo: boolean;

  // Agrupamento
  showGroupPanel: boolean;
  agruparPor: '' | 'cliente.uf' | 'status' | 'vendedor';
  autoExpandAll: boolean;
  groupSummary: boolean;

  // Totais
  summary: boolean;

  // Regras visuais e templates
  rowClass: boolean;
  rowStyle: boolean;
  cssClassCelula: boolean;
  cellTemplates: boolean;

  // Exportação
  showExportButton: boolean;
  exportXlsx: boolean;
  exportCsv: boolean;
  exportFileName: string;

  // Estado / textos
  stateStoring: boolean;
  noDataText: string;
}

export const OPCOES_PADRAO: Opcoes = {
  fonte: 'local',
  theme: 'default',
  appearance: 'light',
  density: 'standard',
  locale: 'pt-BR',
  corPrimaria: '',
  showRowLines: true,
  showColumnLines: false,
  rowAlternationEnabled: false,
  hoverStateDisabled: false,
  showFilterRow: true,
  showHeaderFilter: true,
  showSearchPanel: true,
  showFilterPanel: false,
  columnChooserEnabled: true,
  allowColumnReordering: true,
  allowColumnResizing: true,
  columnAutoWidth: false,
  fixarId: false,
  colunaOpcional: true,
  selectionMode: 'multiple',
  virtualScrolling: false,
  pagingEnabled: true,
  pageSize: 20,
  showPageSizeSelector: true,
  showInfo: true,
  showGroupPanel: true,
  agruparPor: '',
  autoExpandAll: true,
  groupSummary: true,
  summary: true,
  rowClass: false,
  rowStyle: false,
  cssClassCelula: true,
  cellTemplates: true,
  showExportButton: true,
  exportXlsx: true,
  exportCsv: true,
  exportFileName: 'faturas',
  stateStoring: false,
  noDataText: '',
};
