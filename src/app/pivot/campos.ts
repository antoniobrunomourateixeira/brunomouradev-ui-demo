import type { PivotCellInfo, PivotField } from '@brunomouradev/pivot-grid';
import { OpcoesPivot } from './opcoes-pivot';
import type { Venda } from './vendas';

/**
 * Monta os campos do PivotGrid a partir das opções. O mesmo resultado serve para a tela
 * e (serializado por `camposCodigo`) para o código de exemplo.
 */

/** Função que também sabe se escrever como código no exemplo. */
type ComCodigo<F> = F & { __codigo: string };
function comCodigo<F extends Function>(fn: F, codigo: string): ComCodigo<F> {
  return Object.assign(fn, { __codigo: codigo });
}

/** Meta por célula de cada medida (usada na regra de cor própria). */
const METAS: Record<OpcoesPivot['medida'], number> = { faturamento: 400_000, lucro: 80_000, quantidade: 300 };

/** Regra própria: prejuízo/devolução em vermelho, acima da meta em verde. */
function regraCor(meta: number) {
  return comCodigo(
    (valor: number | null, info: PivotCellInfo) =>
      info.isTotal || valor == null ? null
        : valor < 0 ? { color: '#c92a2a', 'font-weight': '600' }
        : valor >= meta ? { color: '#1b7a43', 'font-weight': '600', background: '#ebfbee' }
        : null,
    `(valor, info) =>
      info.isTotal || valor == null ? null
        : valor < 0 ? { color: '#c92a2a', 'font-weight': '600' } // prejuízo
        : valor >= ${meta} ? { color: '#1b7a43', 'font-weight': '600', background: '#ebfbee' } // bateu a meta
        : null`,
  );
}

const CAMPO = {
  regiao: { name: 'regiao', dataField: 'regiao', caption: 'Região' },
  uf: { name: 'uf', dataField: 'uf', caption: 'UF' },
  cidade: { name: 'cidade', dataField: 'cidade', caption: 'Cidade' },
  categoria: { name: 'categoria', dataField: 'categoria', caption: 'Categoria' },
  produto: { name: 'produto', dataField: 'produto', caption: 'Produto' },
  canal: { name: 'canal', dataField: 'canal', caption: 'Canal' },
  vendedor: { name: 'vendedor', dataField: 'vendedor', caption: 'Vendedor' },
  cliente: { name: 'cliente', dataField: 'cliente', caption: 'Tipo de cliente' },
  tipo: { name: 'tipo', dataField: 'tipo', caption: 'Venda / devolução' },
  ano: { name: 'ano', dataField: 'data', caption: 'Ano', dataType: 'date', groupInterval: 'year' },
  trimestre: { name: 'trimestre', dataField: 'data', caption: 'Trimestre', dataType: 'date', groupInterval: 'quarter' },
  mes: { name: 'mes', dataField: 'data', caption: 'Mês', dataType: 'date', groupInterval: 'month' },
  diaSemana: { name: 'diaSemana', dataField: 'data', caption: 'Dia da semana', dataType: 'date', groupInterval: 'dayOfWeek' },
} satisfies Record<string, PivotField<Venda>>;

type NomeCampo = keyof typeof CAMPO;

const LINHAS: Record<OpcoesPivot['linhas'], NomeCampo[]> = {
  'regiao-uf': ['regiao', 'uf'],
  'categoria-produto': ['categoria', 'produto'],
  'canal-vendedor': ['canal', 'vendedor'],
  'uf-cidade': ['uf', 'cidade'],
};

const COLUNAS: Record<OpcoesPivot['colunas'], NomeCampo[]> = {
  'ano-trimestre': ['ano', 'trimestre'],
  'ano-mes': ['ano', 'mes'],
  ano: ['ano'],
  canal: ['canal'],
  nenhuma: [],
};

/** Campos de valor (área "data"). */
const MEDIDAS: Record<'faturamento' | 'lucro' | 'quantidade' | 'ticket', PivotField<Venda>> = {
  faturamento: { name: 'faturamento', dataField: 'faturamento', caption: 'Faturamento', format: 'currency' },
  lucro: { name: 'lucro', dataField: 'lucro', caption: 'Lucro', format: 'currency' },
  quantidade: { name: 'quantidade', dataField: 'quantidade', caption: 'Unidades', format: 'integer' },
  ticket: { name: 'ticket', dataField: 'faturamento', caption: 'Ticket médio', summaryType: 'avg', format: 'currency' },
};

export function montarCampos(o: OpcoesPivot): PivotField<Venda>[] {
  const campos: PivotField<Venda>[] = [];
  const usados = new Set<string>();

  LINHAS[o.linhas].forEach((nome, i, arr) => {
    const campo: PivotField<Venda> = { ...CAMPO[nome], area: 'row' };
    if (o.expandido && i < arr.length - 1) campo.expanded = true;
    if (i === 0 && o.ordenarPorTotal) Object.assign(campo, { sortBySummaryField: o.medida, sortOrder: 'desc' });
    if (i === 0 && o.topN) campo.topN = o.topNMenores ? { count: o.topN, bottom: true } : { count: o.topN };
    campos.push(campo);
    usados.add(nome);
  });

  COLUNAS[o.colunas].forEach((nome, i, arr) => {
    if (usados.has(nome)) return; // já está nas linhas
    const campo: PivotField<Venda> = { ...CAMPO[nome], area: 'column' };
    if (o.expandido && i < arr.length - 1) campo.expanded = true;
    campos.push(campo);
    usados.add(nome);
  });

  // Valor principal
  const valor: PivotField<Venda> = {
    ...MEDIDAS[o.medida],
    area: 'data',
    summaryType: o.summaryType,
    format: o.summaryType === 'count' || o.medida === 'quantidade' ? 'integer' : 'currency',
  };
  if (o.summaryDisplayMode !== 'absolute') valor.summaryDisplayMode = o.summaryDisplayMode;
  if (o.conditionalFormat === 'colorScale') valor.conditionalFormat = { type: 'colorScale' };
  if (o.conditionalFormat === 'dataBar') valor.conditionalFormat = { type: 'dataBar' };
  if (o.conditionalFormat === 'regra') valor.conditionalFormat = regraCor(METAS[o.medida]) as any;
  campos.push(valor);

  // Segundo valor
  if (o.segundoValor !== 'nenhum' && o.segundoValor !== o.medida) {
    campos.push({ summaryType: 'sum', ...MEDIDAS[o.segundoValor], area: 'data' });
  }

  // Filtro: só vendas (tira as devoluções), na área de filtros
  if (o.filtroInicial) {
    campos.push({ ...CAMPO.tipo, area: 'filter', filterValues: ['Devolução'], filterType: 'exclude' });
    usados.add('tipo');
  }

  // Os outros campos ficam no painel, sem área, para o usuário arrastar
  for (const nome of Object.keys(CAMPO) as NomeCampo[]) {
    if (!usados.has(nome)) campos.push({ ...CAMPO[nome] });
  }
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
  const linhas = campos.map((c) => `${ind}${valor(c)},${c.area ? '' : ' // sem área: fica no painel para arrastar'}`);
  return `[\n${linhas.join('\n')}\n${ind.slice(2)}]`;
}
