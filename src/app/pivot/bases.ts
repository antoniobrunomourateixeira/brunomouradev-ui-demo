import type { ColumnDef, SummaryItem } from '@brunomouradev/data-grid';
import type { PivotField } from '@brunomouradev/pivot-grid';
import { comCodigo } from './codigo-fn';
import { FAIXAS, gerarTitulos } from './titulos';
import { gerarVendas } from './vendas';

/**
 * Bases de dados do PivotGrid. Cada base traz os próprios campos, combinações prontas de
 * linhas e colunas, medidas, filtro inicial, colunas do drill down e nomes para o código gerado.
 */

export type IdBase = 'vendas' | 'cobranca';

export interface Opcao {
  id: string;
  rotulo: string;
}

export interface Preset extends Opcao {
  campos: string[];
}

export interface Medida extends Opcao {
  campo: PivotField;
  /** Meta por célula, usada na regra de cor própria. */
  meta: number;
  /** true quando passar da meta é ruim (ex.: saldo em aberto). */
  ruimAcima?: boolean;
}

export interface BaseDados {
  id: IdBase;
  rotulo: string;
  titulo: string;
  descricao: string;
  /** "vendas", "títulos": como chamar os registros nos textos. */
  registros: string;
  tamanhos: [number, number];
  gerar: (qtd: number, seed?: number) => any[];
  campos: Record<string, PivotField>;
  linhas: Preset[];
  colunas: Preset[];
  medidas: Medida[];
  segundos: Medida[];
  filtro: { rotulo: string; campo: string; valores: any[] };
  padrao: { linhas: string; colunas: string; medida: string; conditionalFormat: 'nenhum' | 'colorScale' | 'dataBar' | 'regra' };
  /** Cores da escala (colorScale). */
  escala?: { minColor: string; maxColor: string };
  /** Campo movido pelo botão "Mover … para colunas". */
  campoMover: { name: string; rotulo: string };
  detalhe: { colunas: ColumnDef[]; totais: SummaryItem[]; chave: string };
  /** Nomes usados no código de exemplo. */
  codigo: { tipo: string; arquivo: string; lista: string; componente: string; endpoint: string; semDados: string };
}

const negativo = (v: number) => (v < 0 ? 'negativo' : '');

// ─────────────────────────── Vendas ───────────────────────────

const VENDAS: BaseDados = {
  id: 'vendas',
  rotulo: 'Vendas (varejo)',
  titulo: 'Vendas',
  descricao:
    'Rede de eletrônicos de jan/2024 a out/2026: 18 cidades, 4 canais, 16 produtos com preço e custo, Black Friday, Natal, crescimento ano a ano e devoluções.',
  registros: 'vendas',
  tamanhos: [5_000, 50_000],
  gerar: gerarVendas,
  campos: {
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
  },
  linhas: [
    { id: 'regiao-uf', rotulo: 'Região › UF', campos: ['regiao', 'uf'] },
    { id: 'categoria-produto', rotulo: 'Categoria › Produto', campos: ['categoria', 'produto'] },
    { id: 'canal-vendedor', rotulo: 'Canal › Vendedor', campos: ['canal', 'vendedor'] },
    { id: 'uf-cidade', rotulo: 'UF › Cidade', campos: ['uf', 'cidade'] },
  ],
  colunas: [
    { id: 'ano-trimestre', rotulo: 'Ano › Trimestre', campos: ['ano', 'trimestre'] },
    { id: 'ano-mes', rotulo: 'Ano › Mês', campos: ['ano', 'mes'] },
    { id: 'ano', rotulo: 'Ano', campos: ['ano'] },
    { id: 'canal', rotulo: 'Canal', campos: ['canal'] },
    { id: 'nenhuma', rotulo: 'Nenhuma', campos: [] },
  ],
  medidas: [
    { id: 'faturamento', rotulo: 'Faturamento (R$)', meta: 400_000, campo: { name: 'faturamento', dataField: 'faturamento', caption: 'Faturamento', format: 'currency' } },
    { id: 'lucro', rotulo: 'Lucro (R$)', meta: 80_000, campo: { name: 'lucro', dataField: 'lucro', caption: 'Lucro', format: 'currency' } },
    { id: 'quantidade', rotulo: 'Unidades vendidas', meta: 300, campo: { name: 'quantidade', dataField: 'quantidade', caption: 'Unidades', format: 'integer' } },
  ],
  segundos: [
    { id: 'quantidade', rotulo: 'Unidades', meta: 0, campo: { name: 'quantidade', dataField: 'quantidade', caption: 'Unidades', summaryType: 'sum', format: 'integer' } },
    { id: 'lucro', rotulo: 'Lucro', meta: 0, campo: { name: 'lucro', dataField: 'lucro', caption: 'Lucro', summaryType: 'sum', format: 'currency' } },
    { id: 'ticket', rotulo: 'Ticket médio (avg)', meta: 0, campo: { name: 'ticket', dataField: 'faturamento', caption: 'Ticket médio', summaryType: 'avg', format: 'currency' } },
  ],
  filtro: { rotulo: 'Só vendas (sem devoluções)', campo: 'tipo', valores: ['Devolução'] },
  padrao: { linhas: 'regiao-uf', colunas: 'ano-trimestre', medida: 'faturamento', conditionalFormat: 'dataBar' },
  campoMover: { name: 'canal', rotulo: 'Canal' },
  detalhe: {
    chave: 'pedido',
    colunas: [
      { dataField: 'pedido', caption: 'Pedido', width: 90, format: 'integer' },
      { dataField: 'data', caption: 'Data', format: 'date', sortOrder: 'desc' },
      { dataField: 'cidade', caption: 'Cidade' },
      { dataField: 'uf', caption: 'UF', width: 60, alignment: 'center' },
      { dataField: 'canal', caption: 'Canal' },
      { dataField: 'vendedor', caption: 'Vendedor' },
      { dataField: 'produto', caption: 'Produto' },
      { dataField: 'quantidade', caption: 'Qtd', width: 70, format: 'integer' },
      { dataField: 'precoUnitario', caption: 'Preço unit.', format: 'currency' },
      { dataField: 'desconto', caption: 'Desc.', width: 80, format: { style: 'percent', maximumFractionDigits: 0 } },
      { dataField: 'faturamento', caption: 'Faturamento', format: 'currency' },
      { dataField: 'lucro', caption: 'Lucro', format: 'currency', cssClass: negativo },
    ],
    totais: [
      { column: 'quantidade', summaryType: 'sum' },
      { column: 'faturamento', summaryType: 'sum' },
      { column: 'lucro', summaryType: 'sum' },
    ],
  },
  codigo: { tipo: 'Venda', arquivo: 'venda', lista: 'vendas', componente: 'Vendas', endpoint: '/api/vendas', semDados: 'Nenhuma venda no período' },
};

// ─────────────────────────── Carteira de cobrança ───────────────────────────

/** Faixa de atraso: o valor é um número (0 a 6) para ordenar certo; o texto vem do format. */
const formatoFaixa = comCodigo(
  (v: number) => FAIXAS[v] ?? String(v),
  `(v) => ['A vencer', '1 a 30 dias', '31 a 60 dias', '61 a 90 dias', '91 a 180 dias', '181 a 360 dias', 'Mais de 360 dias'][v]`,
);

const COBRANCA: BaseDados = {
  id: 'cobranca',
  rotulo: 'Carteira de cobrança',
  titulo: 'Carteira de cobrança',
  descricao:
    'Assessoria que cobra 6 credores (banco, financeira, varejo, telecom, energia, escola), vencimentos de 2024 a 2026 e data-base 31/10/2026. Quanto mais velha a dívida, menos se recupera e maior o desconto; WhatsApp recupera mais que carta.',
  registros: 'títulos',
  tamanhos: [5_000, 50_000],
  gerar: gerarTitulos,
  campos: {
    credor: { name: 'credor', dataField: 'credor', caption: 'Credor' },
    segmento: { name: 'segmento', dataField: 'segmento', caption: 'Segmento' },
    carteira: { name: 'carteira', dataField: 'carteira', caption: 'Carteira' },
    faixa: { name: 'faixa', dataField: 'faixa', caption: 'Faixa de atraso', dataType: 'number', format: formatoFaixa as any },
    situacao: { name: 'situacao', dataField: 'situacao', caption: 'Situação' },
    canal: { name: 'canal', dataField: 'canal', caption: 'Último contato' },
    operador: { name: 'operador', dataField: 'operador', caption: 'Operador' },
    regiao: { name: 'regiao', dataField: 'regiao', caption: 'Região' },
    uf: { name: 'uf', dataField: 'uf', caption: 'UF' },
    devedor: { name: 'devedor', dataField: 'devedor', caption: 'Devedor' },
    ano: { name: 'ano', dataField: 'vencimento', caption: 'Ano do vencimento', dataType: 'date', groupInterval: 'year' },
    trimestre: { name: 'trimestre', dataField: 'vencimento', caption: 'Trimestre', dataType: 'date', groupInterval: 'quarter' },
    mes: { name: 'mes', dataField: 'vencimento', caption: 'Mês do vencimento', dataType: 'date', groupInterval: 'month' },
  },
  linhas: [
    { id: 'credor-carteira', rotulo: 'Credor › Carteira', campos: ['credor', 'carteira'] },
    { id: 'operador-canal', rotulo: 'Operador › Último contato', campos: ['operador', 'canal'] },
    { id: 'regiao-uf', rotulo: 'Região › UF', campos: ['regiao', 'uf'] },
    { id: 'faixa', rotulo: 'Faixa de atraso', campos: ['faixa'] },
  ],
  colunas: [
    { id: 'faixa', rotulo: 'Faixa de atraso', campos: ['faixa'] },
    { id: 'situacao', rotulo: 'Situação', campos: ['situacao'] },
    { id: 'ano-trimestre', rotulo: 'Ano › Trimestre do vencimento', campos: ['ano', 'trimestre'] },
    { id: 'canal', rotulo: 'Último contato', campos: ['canal'] },
    { id: 'nenhuma', rotulo: 'Nenhuma', campos: [] },
  ],
  medidas: [
    { id: 'saldo', rotulo: 'Saldo em aberto (R$)', meta: 500_000, ruimAcima: true, campo: { name: 'saldo', dataField: 'saldo', caption: 'Saldo em aberto', format: 'currency' } },
    { id: 'recuperado', rotulo: 'Valor recuperado (R$)', meta: 100_000, campo: { name: 'recuperado', dataField: 'recuperado', caption: 'Recuperado', format: 'currency' } },
    { id: 'titulos', rotulo: 'Quantidade de títulos', meta: 400, ruimAcima: true, campo: { name: 'titulos', dataField: 'titulo', caption: 'Títulos', summaryType: 'count', format: 'integer' } },
    { id: 'taxa', rotulo: 'Taxa de recuperação (%)', meta: 40, campo: { name: 'taxa', dataField: 'taxaRecuperacao', caption: 'Taxa de recuperação (%)', summaryType: 'avg', format: { style: 'decimal', maximumFractionDigits: 1 } } },
  ],
  segundos: [
    { id: 'recuperado', rotulo: 'Recuperado', meta: 0, campo: { name: 'recuperado', dataField: 'recuperado', caption: 'Recuperado', summaryType: 'sum', format: 'currency' } },
    { id: 'titulos', rotulo: 'Quantidade de títulos', meta: 0, campo: { name: 'titulos', dataField: 'titulo', caption: 'Títulos', summaryType: 'count', format: 'integer' } },
    { id: 'desconto', rotulo: 'Desconto concedido', meta: 0, campo: { name: 'desconto', dataField: 'descontoConcedido', caption: 'Desconto concedido', summaryType: 'sum', format: 'currency' } },
    { id: 'atraso', rotulo: 'Dias de atraso (média)', meta: 0, campo: { name: 'atraso', dataField: 'diasAtraso', caption: 'Atraso médio (dias)', summaryType: 'avg', format: 'integer' } },
  ],
  filtro: { rotulo: 'Sem títulos já pagos', campo: 'situacao', valores: ['Pago'] },
  padrao: { linhas: 'credor-carteira', colunas: 'faixa', medida: 'saldo', conditionalFormat: 'colorScale' },
  escala: { minColor: '#fff5f5', maxColor: '#ff8787' },
  campoMover: { name: 'situacao', rotulo: 'Situação' },
  detalhe: {
    chave: 'titulo',
    colunas: [
      { dataField: 'titulo', caption: 'Título', width: 90, format: 'integer' },
      { dataField: 'credor', caption: 'Credor' },
      { dataField: 'carteira', caption: 'Carteira' },
      { dataField: 'uf', caption: 'UF', width: 60, alignment: 'center' },
      { dataField: 'vencimento', caption: 'Vencimento', format: 'date', sortOrder: 'asc' },
      { dataField: 'diasAtraso', caption: 'Atraso (dias)', format: 'integer' },
      { dataField: 'situacao', caption: 'Situação' },
      { dataField: 'canal', caption: 'Último contato' },
      { dataField: 'operador', caption: 'Operador' },
      { dataField: 'valorOriginal', caption: 'Valor original', format: 'currency' },
      { dataField: 'valorAtualizado', caption: 'Atualizado', format: 'currency' },
      { dataField: 'descontoConcedido', caption: 'Desconto', format: 'currency' },
      { dataField: 'recuperado', caption: 'Recuperado', format: 'currency' },
      { dataField: 'saldo', caption: 'Saldo', format: 'currency' },
    ],
    totais: [
      { column: 'valorOriginal', summaryType: 'sum' },
      { column: 'recuperado', summaryType: 'sum' },
      { column: 'saldo', summaryType: 'sum' },
    ],
  },
  codigo: { tipo: 'Titulo', arquivo: 'titulo', lista: 'titulos', componente: 'Carteira', endpoint: '/api/titulos', semDados: 'Nenhum título na carteira' },
};

export const BASES: Record<IdBase, BaseDados> = { vendas: VENDAS, cobranca: COBRANCA };
export const LISTA_BASES = [VENDAS, COBRANCA];
