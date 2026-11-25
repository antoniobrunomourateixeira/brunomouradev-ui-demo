import type { PivotCellInfo, PivotField } from '@brunomouradev/pivot-grid';
import type { Fatura } from '../shared/data';
import { OpcoesPivot } from './opcoes-pivot';

/**
 * Monta os campos do PivotGrid a partir das opções. O mesmo resultado serve para a tela
 * e (serializado por `camposCodigo`) para o código de exemplo.
 */

/** Função que também sabe se escrever como código no exemplo. */
type ComCodigo<F> = F & { __codigo: string };
function comCodigo<F extends Function>(fn: F, codigo: string): ComCodigo<F> {
  return Object.assign(fn, { __codigo: codigo });
}

const regraCor = comCodigo(
  (valor: number | null, info: PivotCellInfo) =>
    info.isTotal || valor == null ? null : valor < 0 ? { color: '#c92a2a', 'font-weight': '600' } : valor > 50000 ? { color: '#1b7a43', 'font-weight': '600' } : null,
  `(valor, info) =>
      info.isTotal || valor == null ? null
        : valor < 0 ? { color: '#c92a2a', 'font-weight': '600' }
        : valor > 50000 ? { color: '#1b7a43', 'font-weight': '600' }
        : null`,
);

export function montarCampos(o: OpcoesPivot): PivotField<Fatura>[] {
  // Campos de linha conforme o preset
  const linhas: Record<OpcoesPivot['linhas'], PivotField<Fatura>[]> = {
    'uf-cliente': [
      { name: 'uf', dataField: 'cliente.uf', caption: 'UF' },
      { name: 'cliente', dataField: 'cliente.nome', caption: 'Cliente' },
    ],
    'vendedor-status': [
      { name: 'vendedor', dataField: 'vendedor', caption: 'Vendedor' },
      { name: 'status', dataField: 'status', caption: 'Status' },
    ],
    'forma-uf': [
      { name: 'forma', dataField: 'forma', caption: 'Forma de pgto' },
      { name: 'uf', dataField: 'cliente.uf', caption: 'UF' },
    ],
  };
  const colunas: Record<OpcoesPivot['colunas'], PivotField<Fatura>[]> = {
    'ano-trimestre': [
      { name: 'ano', dataField: 'vencimento', caption: 'Ano', dataType: 'date', groupInterval: 'year' },
      { name: 'trimestre', dataField: 'vencimento', caption: 'Trimestre', dataType: 'date', groupInterval: 'quarter' },
    ],
    'ano-mes': [
      { name: 'ano', dataField: 'vencimento', caption: 'Ano', dataType: 'date', groupInterval: 'year' },
      { name: 'mes', dataField: 'vencimento', caption: 'Mês', dataType: 'date', groupInterval: 'month' },
    ],
    status: [{ name: 'status', dataField: 'status', caption: 'Status' }],
    nenhuma: [],
  };

  const campos: PivotField<Fatura>[] = [];
  const usados = new Set<string>();

  linhas[o.linhas].forEach((f, i) => {
    const campo: PivotField<Fatura> = { ...f, area: 'row' };
    if (o.expandido && i < linhas[o.linhas].length - 1) campo.expanded = true;
    if (i === 0 && o.ordenarPorTotal) Object.assign(campo, { sortBySummaryField: 'valor', sortOrder: 'desc' });
    if (i === 0 && o.topN) campo.topN = o.topNMenores ? { count: o.topN, bottom: true } : { count: o.topN };
    campos.push(campo);
    usados.add(f.name!);
  });

  colunas[o.colunas].forEach((f, i, arr) => {
    if (usados.has(f.name!)) return; // status já está nas linhas
    const campo: PivotField<Fatura> = { ...f, area: 'column' };
    if (o.expandido && i < arr.length - 1) campo.expanded = true;
    campos.push(campo);
    usados.add(f.name!);
  });

  // Valores
  const valor: PivotField<Fatura> = {
    name: 'valor',
    dataField: 'valor',
    caption: 'Valor',
    area: 'data',
    summaryType: o.summaryType,
    format: o.summaryType === 'count' ? 'integer' : 'currency',
  };
  if (o.summaryDisplayMode !== 'absolute') valor.summaryDisplayMode = o.summaryDisplayMode;
  if (o.conditionalFormat === 'colorScale') valor.conditionalFormat = { type: 'colorScale' };
  if (o.conditionalFormat === 'dataBar') valor.conditionalFormat = { type: 'dataBar' };
  if (o.conditionalFormat === 'regra') valor.conditionalFormat = regraCor as any;
  campos.push(valor);
  if (o.quantidade) {
    campos.push({ name: 'qtd', dataField: 'id', caption: 'Qtd', area: 'data', summaryType: 'count', format: 'integer' });
  }

  // Filtro: tudo menos Cancelado (na área de filtros, se Status não estiver em uso)
  if (o.filtroInicial) {
    const status = campos.find((c) => c.name === 'status');
    if (status) Object.assign(status, { filterValues: ['Cancelado'], filterType: 'exclude' });
    else {
      campos.push({ name: 'status', dataField: 'status', caption: 'Status', area: 'filter', filterValues: ['Cancelado'], filterType: 'exclude' });
      usados.add('status');
    }
  }

  // Campos sem área: ficam no painel para o usuário arrastar
  const disponiveis: PivotField<Fatura>[] = [
    { name: 'uf', dataField: 'cliente.uf', caption: 'UF' },
    { name: 'cliente', dataField: 'cliente.nome', caption: 'Cliente' },
    { name: 'vendedor', dataField: 'vendedor', caption: 'Vendedor' },
    { name: 'status', dataField: 'status', caption: 'Status' },
    { name: 'forma', dataField: 'forma', caption: 'Forma de pgto' },
    { name: 'ano', dataField: 'vencimento', caption: 'Ano', dataType: 'date', groupInterval: 'year' },
    { name: 'mes', dataField: 'vencimento', caption: 'Mês', dataType: 'date', groupInterval: 'month' },
    { name: 'desconto', dataField: 'desconto', caption: 'Desconto', summaryType: 'avg', format: 'percent' },
  ];
  for (const f of disponiveis) if (!usados.has(f.name!)) campos.push(f);

  return campos;
}

/** Escreve os campos como código (TS ou JS). */
export function camposCodigo(campos: PivotField[], ind = '  '): string {
  const valor = (v: any): string => {
    if (typeof v === 'function') return (v as ComCodigo<Function>).__codigo ?? String(v);
    if (typeof v === 'string') return `'${v}'`;
    if (Array.isArray(v)) return `[${v.map(valor).join(', ')}]`;
    if (v && typeof v === 'object') return `{ ${Object.entries(v).map(([k, x]) => `${k}: ${valor(x)}`).join(', ')} }`;
    return String(v);
  };
  const linhas = campos.map((c) => {
    const area = c.area ? '' : ' // sem área: fica disponível no painel';
    return `${ind}${valor(c)},${area}`;
  });
  return `[\n${linhas.join('\n')}\n${ind.slice(2)}]`;
}
