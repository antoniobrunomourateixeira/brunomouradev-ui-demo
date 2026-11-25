import type { PivotCellInfo, PivotField } from '@brunomouradev/pivot-grid';
import { BASES, Medida } from './bases';
import { ComCodigo, comCodigo } from './codigo-fn';
import { OpcoesPivot } from './opcoes-pivot';

/**
 * Monta os campos do PivotGrid a partir das opções e da base escolhida. O mesmo resultado
 * serve para a tela e (serializado por `camposCodigo`) para o código de exemplo.
 */

/** Regra própria de cor: negativo em vermelho e a meta destacada (verde se é bom, vermelho se é ruim). */
function regraCor(m: Medida) {
  const destaque = m.ruimAcima
    ? { color: '#c92a2a', 'font-weight': '600', background: '#fff5f5' }
    : { color: '#1b7a43', 'font-weight': '600', background: '#ebfbee' };
  const css = `{ color: '${destaque.color}', 'font-weight': '600', background: '${destaque.background}' }`;
  return comCodigo(
    (valor: number | null, info: PivotCellInfo) =>
      info.isTotal || valor == null ? null : valor < 0 ? { color: '#c92a2a', 'font-weight': '600' } : valor >= m.meta ? destaque : null,
    `(valor, info) =>
      info.isTotal || valor == null ? null
        : valor < 0 ? { color: '#c92a2a', 'font-weight': '600' }
        : valor >= ${m.meta} ? ${css} // ${m.ruimAcima ? 'acima do limite' : 'bateu a meta'}
        : null`,
  );
}

export function montarCampos(o: OpcoesPivot): PivotField[] {
  const base = BASES[o.base];
  const campos: PivotField[] = [];
  const usados = new Set<string>();
  const medida = base.medidas.find((m) => m.id === o.medida) ?? base.medidas[0];

  const linhas = (base.linhas.find((p) => p.id === o.linhas) ?? base.linhas[0]).campos;
  linhas.forEach((nome, i) => {
    const campo: PivotField = { ...base.campos[nome], area: 'row' };
    if (o.expandido && i < linhas.length - 1) campo.expanded = true;
    if (i === 0 && o.ordenarPorTotal) Object.assign(campo, { sortBySummaryField: medida.id, sortOrder: 'desc' });
    if (i === 0 && o.topN) campo.topN = o.topNMenores ? { count: o.topN, bottom: true } : { count: o.topN };
    campos.push(campo);
    usados.add(nome);
  });

  const colunas = (base.colunas.find((p) => p.id === o.colunas) ?? base.colunas[0]).campos;
  colunas.forEach((nome, i) => {
    if (usados.has(nome)) return; // já está nas linhas
    const campo: PivotField = { ...base.campos[nome], area: 'column' };
    if (o.expandido && i < colunas.length - 1) campo.expanded = true;
    campos.push(campo);
    usados.add(nome);
  });

  // Valor principal
  const valor: PivotField = { ...medida.campo, area: 'data' };
  if (!medida.campo.summaryType || medida.campo.summaryType === 'sum') {
    valor.summaryType = o.summaryType;
    if (o.summaryType === 'count') valor.format = 'integer';
  }
  if (o.summaryDisplayMode !== 'absolute') valor.summaryDisplayMode = o.summaryDisplayMode;
  if (o.conditionalFormat === 'colorScale') valor.conditionalFormat = { type: 'colorScale', ...(base.escala ?? {}) };
  if (o.conditionalFormat === 'dataBar') valor.conditionalFormat = { type: 'dataBar' };
  if (o.conditionalFormat === 'regra') valor.conditionalFormat = regraCor(medida) as any;
  campos.push(valor);

  // Segundo valor
  const segundo = base.segundos.find((s) => s.id === o.segundoValor);
  if (segundo && segundo.id !== medida.id) campos.push({ ...segundo.campo, area: 'data' });

  // Filtro inicial
  if (o.filtroInicial) {
    const nome = base.filtro.campo;
    const existente = campos.find((c) => c.name === nome);
    if (existente) Object.assign(existente, { filterValues: base.filtro.valores, filterType: 'exclude' });
    else campos.push({ ...base.campos[nome], area: 'filter', filterValues: base.filtro.valores, filterType: 'exclude' });
    usados.add(nome);
  }

  // Os outros campos ficam no painel, sem área, para o usuário arrastar
  for (const nome of Object.keys(base.campos)) {
    if (!usados.has(nome)) campos.push({ ...base.campos[nome] });
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
