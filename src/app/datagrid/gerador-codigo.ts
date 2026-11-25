import { ArquivoCodigo, Linguagem, VERSAO } from '../shared/codigo';
import { Opcoes } from './opcoes';

/**
 * Gera o código de exemplo (Angular, React, Vue e HTML puro) a partir das opções
 * marcadas no painel. Só entram no código as opções diferentes do padrão da grid.
 */


/** Atributos simples (texto e liga/desliga) que funcionam em qualquer framework. */
function atributos(o: Opcoes): string[] {
  const a: string[] = [];
  if (o.theme !== 'default') a.push(`theme="${o.theme}"`);
  if (o.appearance !== 'light') a.push(`appearance="${o.appearance}"`);
  if (o.density !== 'standard') a.push(`density="${o.density}"`);
  if (o.locale !== 'pt-BR') a.push(`locale="${o.locale}"`);
  a.push('key-expr="id"');
  if (o.selectionMode !== 'none') a.push(`selection-mode="${o.selectionMode}"`);
  const bools: [boolean, string][] = [
    [o.showFilterRow, 'show-filter-row'],
    [o.showHeaderFilter, 'show-header-filter'],
    [o.showSearchPanel, 'show-search-panel'],
    [o.showFilterPanel, 'show-filter-panel'],
    [o.showGroupPanel, 'show-group-panel'],
    [o.showExportButton, 'show-export-button'],
    [o.columnChooserEnabled, 'column-chooser-enabled'],
    [o.allowColumnReordering, 'allow-column-reordering'],
    [o.allowColumnResizing, 'allow-column-resizing'],
    [o.columnAutoWidth, 'column-auto-width'],
    [o.showColumnLines, 'show-column-lines'],
    [o.rowAlternationEnabled, 'row-alternation-enabled'],
    [o.hoverStateDisabled, 'hover-state-disabled'],
    [o.virtualScrolling, 'virtual-scrolling'],
  ];
  for (const [on, nome] of bools) if (on) a.push(nome);
  if (!o.autoExpandAll) a.push('auto-expand-all="false"');
  if (o.showExportButton) {
    const f = formatos(o);
    if (f !== 'xlsx,csv') a.push(`export-formats="${f}"`);
    if (o.exportFileName && o.exportFileName !== 'dados') a.push(`export-file-name="${o.exportFileName}"`);
    if (o.exportXlsx && o.exportSheetName && o.exportSheetName !== 'Dados') a.push(`export-sheet-name="${o.exportSheetName}"`);
  }
  if (o.noDataText) a.push(`no-data-text="${o.noDataText}"`);
  if (o.loading) a.push('loading');
  return a;
}

function formatos(o: Opcoes): string {
  return [o.exportXlsx && 'xlsx', o.exportCsv && 'csv'].filter(Boolean).join(',') || 'xlsx';
}

/** Propriedades de objeto/função que precisam ser passadas por código. */
interface Prop {
  nome: string;
  /** Nome da variável/campo que guarda o valor. */
  variavel: string;
}

function propriedades(o: Opcoes): Prop[] {
  const p: Prop[] = [];
  if (o.fonte === 'remoto') {
    p.push({ nome: 'remoteData', variavel: 'carregar' });
    p.push({ nome: 'remoteHeaderFilter', variavel: 'valoresFunil' });
  }
  else p.push({ nome: 'dataSource', variavel: 'faturas' });
  p.push({ nome: 'columns', variavel: 'colunas' });
  if (o.summary) p.push({ nome: 'summary', variavel: 'totais' });
  if (o.groupSummary && (o.showGroupPanel || o.agruparPor)) p.push({ nome: 'groupSummary', variavel: 'totaisGrupo' });
  if (pagingDiferente(o)) p.push({ nome: 'paging', variavel: 'paginacao' });
  if (o.rowClass) p.push({ nome: 'rowClass', variavel: 'classeLinha' });
  if (o.rowStyle) p.push({ nome: 'rowStyle', variavel: 'estiloLinha' });
  if (o.stateStoring) p.push({ nome: 'stateStoring', variavel: 'estadoSalvo' });
  if (o.mensagens) p.push({ nome: 'messages', variavel: 'textos' });
  if (o.cellRender) p.push({ nome: 'cellStyles', variavel: 'cssCelulas' });
  if (!o.showRowLines) p.push({ nome: 'showRowLines', variavel: 'false' });
  return p;
}

function pagingDiferente(o: Opcoes): boolean {
  return !o.pagingEnabled || o.pageSize !== 20 || o.showPageSizeSelector || !o.showInfo;
}

function pagingObj(o: Opcoes): string {
  if (!o.pagingEnabled) return '{ enabled: false }';
  const partes = [`pageSize: ${o.pageSize}`];
  if (o.showPageSizeSelector) partes.push('showPageSizeSelector: true', 'allowedPageSizes: [10, 20, 50, 100]');
  if (!o.showInfo) partes.push('showInfo: false');
  return `{ ${partes.join(', ')} }`;
}

/** Definição das colunas como texto. */
function colunasCodigo(o: Opcoes, ts: boolean, ind = '  '): string {
  const g = (campo: string) => (o.agruparPor === campo ? ', groupIndex: 0' : '');
  const linhas: string[] = [];
  linhas.push(`{ dataField: 'id', caption: 'Nº', width: 80, format: 'integer', allowHiding: false${o.fixarId ? ', fixed: true' : ''} }`);
  linhas.push(`{ dataField: 'cliente.nome', caption: 'Cliente', minWidth: 180 }`);
  linhas.push(`{ dataField: 'cliente.uf', caption: 'UF', width: 70, alignment: 'center'${g('cliente.uf')} }`);
  linhas.push(`{ dataField: 'vendedor', caption: 'Vendedor'${g('vendedor')} }`);
  const filtroStatus = o.filtrosIniciais ? ", filterValues: ['Cancelado'], filterType: 'exclude'" : '';
  linhas.push(`{ dataField: 'status', caption: 'Status'${o.cellTemplates ? ", cellTemplate: 'status'" : ''}${filtroStatus}${g('status')} }`);
  linhas.push(`{ dataField: 'forma', caption: 'Forma de pgto'${o.cellRender ? ', cellRender: renderForma' : ''} }`);
  linhas.push(`{ dataField: 'emissao', caption: 'Emissão', format: 'date'${o.colunaOpcional ? ', visible: false' : ''} }`);
  linhas.push(`{ dataField: 'vencimento', caption: 'Vencimento', format: 'date', sortOrder: 'asc' }`);
  const valorTipo = ts ? '(v: number)' : '(v)';
  linhas.push(
    `{ dataField: 'valor', caption: 'Valor', format: 'currency'${o.filtrosIniciais ? ", filterValue: 1000, selectedFilterOperation: '>='" : ''}${o.cssClassCelula ? `, cssClass: ${valorTipo} => (v < 0 ? 'negativo' : '')` : ''} }`,
  );
  linhas.push(`{ dataField: 'desconto', caption: 'Desconto', format: 'percent' }`);
  linhas.push(`{ dataField: 'recebido', caption: 'Recebido', ${o.cellTemplates ? "cellTemplate: 'progresso'" : "format: 'percent'"} }`);
  linhas.push(`{ dataField: 'ativo', caption: 'Ativo', dataType: 'boolean' }`);
  if (o.cellTemplates) {
    linhas.push(
      `{ dataField: '__acoes', caption: 'Ações', width: 90, cellTemplate: 'acoes', calculateCellValue: () => '',\n${ind}  allowSorting: false, allowFiltering: false, allowSearch: false, allowHeaderFiltering: false, allowGrouping: false }`,
    );
  }
  return `[\n${linhas.map((l) => ind + l + ',').join('\n')}\n${ind.slice(2)}]`;
}

/** Declarações (colunas, totais, regras…) em JS/TS, para React, Vue e HTML. */
function declaracoes(o: Opcoes, ts: boolean, kwBase = 'const'): string[] {
  const kw = kwBase ? kwBase + ' ' : '';
  const t = (tipo: string) => (ts ? `: ${tipo}` : '');
  const out: string[] = [];
  if (o.cellRender) {
    const tv = ts ? '(valor: string)' : '(valor)';
    out.push(`// cellRender: a célula é montada por uma função (texto, HTMLElement ou template do Lit)
${kw}renderForma = ${tv} => {
  const el = document.createElement('span');
  el.className = 'forma ' + valor.toLowerCase();
  el.textContent = valor;
  return el;
};
// O conteúdo do cellRender fica no Shadow DOM: o CSS dele vai em cellStyles
${kw}cssCelulas = \`.forma { padding: 1px 8px; border-radius: 6px; font-size: 12px; }
.forma.pix { background: #e6fcf5; color: #087f5b; }
.forma.boleto { background: #fff4e6; color: #d9480f; }\`;`);
  }
  out.push(`${kw}colunas${t('ColumnDef<Fatura>[]')} = ${colunasCodigo(o, ts)};`);
  if (o.summary) {
    out.push(
      `${kw}totais${t('SummaryItem[]')} = [\n  { column: 'id', summaryType: 'count', displayFormat: '{0} faturas' },\n  { column: 'valor', summaryType: 'sum', displayFormat: 'Total: {0}' },\n  { column: 'desconto', summaryType: 'avg', displayFormat: 'Média: {0}' },\n];`,
    );
  }
  if (o.groupSummary && (o.showGroupPanel || o.agruparPor)) {
    out.push(
      `${kw}totaisGrupo${t('SummaryItem[]')} = [\n  { column: 'id', summaryType: 'count', displayFormat: '{0} faturas' },\n  { column: 'valor', summaryType: 'sum', alignByColumn: true },\n];`,
    );
  }
  if (pagingDiferente(o)) out.push(`${kw}paginacao${t('PagingOptions')} = ${pagingObj(o)};`);
  if (o.rowClass) out.push(`${kw}classeLinha = (f${t('Fatura')}) => (f.status === 'Atrasado' ? 'atrasado' : '');`);
  if (o.rowStyle) {
    out.push(
      `${kw}estiloLinha = (f${t('Fatura')}) =>\n  f.status === 'Cancelado' ? { color: '#868e96', 'text-decoration': 'line-through' } : null;`,
    );
  }
  if (o.stateStoring) out.push(`${kw}estadoSalvo = { storageKey: 'faturas-grid' };`);
  if (o.mensagens) {
    out.push(
      `${kw}textos${t('Partial<DataGridMessages>')} = {
  searchPlaceholder: 'Buscar fatura, cliente, vendedor…',
  clearFilters: 'Limpar tudo',
  noData: 'Nenhuma fatura encontrada',
};`,
    );
  }
  if (o.fonte === 'remoto') out.push(remoteCodigo(ts, kw));
  return out;
}

function remoteCodigo(ts: boolean, kw: string): string {
  const tipo = ts ? '(opcoes: RemoteLoadOptions): Promise<RemoteLoadResult<Fatura>>' : '(opcoes)';
  return `// A grid pede página, ordenação, filtros e busca; o servidor devolve { data, totalCount }
${kw}carregar = async ${tipo} => {
  const resp = await fetch('/api/faturas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opcoes), // skip, take, sorts, filters, headerFilters, searchText
    signal: opcoes.signal,
  });
  return resp.json(); // { data: [...], totalCount: 1234, summary?: [...] }
};

// Valores distintos de uma coluna para o funil do cabeçalho
${kw}valoresFunil = async ${ts ? '(campo: string): Promise<any[]>' : '(campo)'} =>
  (await fetch('/api/faturas/valores?campo=' + campo)).json();`;
}

/** CSS global (fora do Shadow DOM) para as regras e a cor. */
function cssGlobal(o: Opcoes): string {
  const css: string[] = [];
  if (o.corPrimaria) css.push(`bm-data-grid { --bm-color-primary: ${o.corPrimaria}; }`);
  if (o.rowClass) css.push(`bm-data-grid::part(atrasado) { --bm-row-bg: #fff1f0; color: #c92a2a; }`);
  if (o.cssClassCelula) css.push(`bm-data-grid::part(negativo) { color: #c92a2a; font-weight: 600; }`);
  if (o.cellTemplates) {
    css.push(
      `.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 500; }
.badge.pago { background: #e6f6ec; color: #1b7a43; }
.badge.aberto { background: #e8f0fe; color: #1a56c4; }
.badge.atrasado { background: #fdecec; color: #c92a2a; }
.badge.cancelado { background: #f1f3f5; color: #6c757d; }
.barra { height: 6px; border-radius: 3px; background: #edf0f3; overflow: hidden; }
.barra > div { height: 100%; background: var(--bm-color-primary, #2563eb); }`,
    );
  }
  return css.join('\n');
}

const EVENTOS_ANGULAR = `(selection-changed)="onSelecao($event.detail)"
  (row-dblclick)="abrir($event.detail.data)"`;

// ─────────────────────────────── Angular ───────────────────────────────

function angular(o: Opcoes): ArquivoCodigo[] {
  const attrs = atributos(o);
  const props = propriedades(o).map((p) => `[${p.nome}]="${p.variavel}"`);
  const corpo = ['#grid', ...attrs, ...props, ...EVENTOS_ANGULAR.split('\n').map((l) => l.trim()), 'style="height: 560px"'];
  const templates = o.cellTemplates
    ? `
  <ng-template bmCellTemplate="status" let-valor="valor">
    <span class="badge {{ valor.toLowerCase() }}">{{ valor }}</span>
  </ng-template>
  <ng-template bmCellTemplate="progresso" let-valor="valor">
    <div class="barra"><div [style.width.%]="valor"></div></div>
  </ng-template>
  <ng-template bmCellTemplate="acoes" let-linha>
    <button class="btn" (click)="abrir(linha); $event.stopPropagation()">Abrir</button>
  </ng-template>
`
    : '';
  const html = `<bm-data-grid\n${corpo.map((l) => '  ' + l).join('\n')}\n>${templates}</bm-data-grid>`;

  const tipos = ['BmDataGrid', 'ColumnDef', 'SummaryItem'];
  if (pagingDiferente(o)) tipos.push('PagingOptions');
  if (o.fonte === 'remoto') tipos.push('RemoteLoadOptions', 'RemoteLoadResult');
  if (o.mensagens) tipos.push('DataGridMessages');
  const imports = [
    `import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';`,
    `import '@brunomouradev/data-grid'; // registra <bm-data-grid>`,
    `import type { ${tipos.join(', ')} } from '@brunomouradev/data-grid';`,
  ];
  if (o.cellTemplates) imports.push(`import { BmCellTemplateDirective, BmDataGridTemplatesDirective } from './bm-cell-template.directive';`);
  imports.push(`import { Fatura } from './fatura';`);

  const membros = declaracoes(o, true, '').map((d) => d.split('\n').map((l) => '  ' + l).join('\n'));
  const campos: string[] = [`  @ViewChild('grid') grid!: ElementRef<BmDataGrid<Fatura>>;`, ''];
  if (o.fonte !== 'remoto') campos.push(`  faturas: Fatura[] = []; // atribua um array novo para atualizar a grid`, '');
  const ts = `${imports.join('\n')}

@Component({
  selector: 'app-faturas',
  templateUrl: './faturas.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],${o.cellTemplates ? '\n  imports: [BmCellTemplateDirective, BmDataGridTemplatesDirective],' : ''}
})
export class FaturasComponent {
${campos.join('\n')}
${membros.join('\n\n')}

  onSelecao(e: { selectedRowKeys: number[]; selectedRowsData: Fatura[] }) {
    console.log('selecionadas', e.selectedRowKeys);
  }

  abrir(f: Fatura) {
    console.log('abrir', f);
  }

  exportar() {
    this.grid.nativeElement.exportToExcel('${o.exportFileName || 'faturas'}');
  }
}`;

  const main = `// main.ts — configuração global (vale para todas as grids)
import { configure } from '@brunomouradev/data-grid';
configure({ theme: '${o.theme}', appearance: '${o.appearance}', density: '${o.density}', locale: '${o.locale}' });`;

  const arquivos: ArquivoCodigo[] = [
    { nome: 'faturas.component.html', codigo: html },
    { nome: 'faturas.component.ts', codigo: ts },
  ];
  const css = cssGlobal(o);
  if (css) arquivos.push({ nome: 'styles.scss', codigo: css });
  arquivos.push({ nome: 'main.ts (opcional)', codigo: main });
  if (o.cellTemplates) {
    arquivos.push({
      nome: 'bm-cell-template.directive.ts',
      codigo: '// Copie o arquivo src/app/bm-cell-template.directive.ts deste protótipo\n// (também está na DOCUMENTACAO.md da lib, seção "Templates de célula").',
    });
  }
  return arquivos;
}

// ─────────────────────────────── React ───────────────────────────────

function rendererDom(): string {
  return `// Células com cellTemplate: a grid entrega um elemento fora do Shadow DOM
const renderCelula = ({ name, element, value, row }) => {
  if (name === 'status') element.innerHTML = \`<span class="badge \${value.toLowerCase()}">\${value}</span>\`;
  if (name === 'progresso') element.innerHTML = \`<div class="barra"><div style="width:\${value}%"></div></div>\`;
  if (name === 'acoes') {
    element.innerHTML = '<button class="btn">Abrir</button>';
    element.querySelector('button').onclick = (e) => { e.stopPropagation(); abrir(row); };
  }
};`;
}

function react(o: Opcoes): ArquivoCodigo[] {
  const props = propriedades(o);
  const tipos = ['BmDataGrid', 'ColumnDef', 'SummaryItem'];
  if (pagingDiferente(o)) tipos.push('PagingOptions');
  if (o.fonte === 'remoto') tipos.push('RemoteLoadOptions', 'RemoteLoadResult');
  if (o.mensagens) tipos.push('DataGridMessages');
  const atribs = atributos(o).map((a) => (a.includes('=') ? a : `${a}=""`));
  const sets = props
    .filter((p) => p.nome !== 'dataSource')
    .map((p) => `    grid.${p.nome} = ${p.variavel};`);
  if (o.cellTemplates) sets.push('    grid.cellTemplateRenderer = renderCelula;');
  const usaDados = o.fonte !== 'remoto';
  const codigo = `import { useEffect, useRef } from 'react';
import '@brunomouradev/data-grid';
import type { ${tipos.join(', ')} } from '@brunomouradev/data-grid';
import type { Fatura } from './fatura';

// Deixa o JSX aceitar a tag (uma vez no projeto, ex.: em global.d.ts)
declare global {
  namespace JSX { interface IntrinsicElements { 'bm-data-grid': any } }
}

${declaracoes(o, true).join('\n\n')}
${o.cellTemplates ? '\n' + rendererDom().replace('({ name, element, value, row })', '({ name, element, value, row }: any)').replace('(e) =>', '(e: Event) =>').replace("element.querySelector('button').", "element.querySelector('button')!.") + '\n' : ''}
function abrir(f: Fatura) {
  console.log('abrir', f);
}

export function Faturas(${usaDados ? '{ faturas }: { faturas: Fatura[] }' : ''}) {
  const ref = useRef<BmDataGrid<Fatura>>(null);

  // Objetos, listas e funções vão por propriedade (uma vez)
  useEffect(() => {
    const grid = ref.current!;
${sets.join('\n')}

    const onSelecao = (e: Event) => console.log((e as CustomEvent).detail.selectedRowKeys);
    const onDblClick = (e: Event) => abrir((e as CustomEvent).detail.data);
    grid.addEventListener('selection-changed', onSelecao);
    grid.addEventListener('row-dblclick', onDblClick);
    return () => {
      grid.removeEventListener('selection-changed', onSelecao);
      grid.removeEventListener('row-dblclick', onDblClick);
    };
  }, []);
${
  usaDados
    ? `
  // Dados: um array novo atualiza a grid
  useEffect(() => {
    ref.current!.dataSource = faturas;
  }, [faturas]);
`
    : ''
}
  return (
    <bm-data-grid
      ref={ref}
${atribs.map((a) => '      ' + a).join('\n')}
      style={{ height: 560 }}
    />
  );
}`;
  const arquivos: ArquivoCodigo[] = [{ nome: 'Faturas.tsx', codigo }];
  const css = cssGlobal(o);
  if (css) arquivos.push({ nome: 'index.css', codigo: css });
  return arquivos;
}

// ─────────────────────────────── Vue ───────────────────────────────

function vue(o: Opcoes): ArquivoCodigo[] {
  const props = propriedades(o).map((p) => `:${p.nome}.prop="${p.variavel}"`);
  if (o.cellTemplates) props.push(':cellTemplateRenderer.prop="renderCelula"');
  const corpo = [...atributos(o), ...props, '@selection-changed="onSelecao"', '@row-dblclick="(e) => abrir(e.detail.data)"', 'style="height: 560px"'];
  const tipos = ['ColumnDef', 'SummaryItem'];
  if (pagingDiferente(o)) tipos.push('PagingOptions');
  if (o.fonte === 'remoto') tipos.push('RemoteLoadOptions', 'RemoteLoadResult');
  if (o.mensagens) tipos.push('DataGridMessages');
  const codigo = `<template>
  <bm-data-grid
${corpo.map((l) => '    ' + l).join('\n')}
  />
</template>

<script setup lang="ts">
${o.fonte !== 'remoto' ? "import { ref } from 'vue';\n" : ''}import '@brunomouradev/data-grid';
import type { ${tipos.join(', ')} } from '@brunomouradev/data-grid';
import type { Fatura } from './fatura';
${o.fonte !== 'remoto' ? '\nconst faturas = ref<Fatura[]>([]); // atribua um array novo para atualizar\n' : ''}
${declaracoes(o, true).join('\n\n')}
${o.cellTemplates ? '\n' + rendererDom().replace('({ name, element, value, row })', '({ name, element, value, row }: any)').replace('(e) =>', '(e: Event) =>').replace("element.querySelector('button').", "element.querySelector('button')!.") + '\n' : ''}
function onSelecao(e: CustomEvent) {
  console.log('selecionadas', e.detail.selectedRowKeys);
}

function abrir(f: Fatura) {
  console.log('abrir', f);
}
</script>`;
  const vite = `// vite.config.ts — diga ao Vue que bm-* é Web Component
import vue from '@vitejs/plugin-vue';

export default {
  plugins: [
    vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('bm-') } } }),
  ],
};`;
  const arquivos: ArquivoCodigo[] = [{ nome: 'Faturas.vue', codigo }, { nome: 'vite.config.ts', codigo: vite }];
  const css = cssGlobal(o);
  if (css) arquivos.push({ nome: 'style.css', codigo: css });
  return arquivos;
}

// ─────────────────────────────── HTML puro ───────────────────────────────

function html(o: Opcoes): ArquivoCodigo[] {
  const attrs = atributos(o);
  const sets = propriedades(o).map((p) => `  grid.${p.nome} = ${p.variavel};`);
  if (o.cellTemplates) sets.push('  grid.cellTemplateRenderer = renderCelula;');
  const css = cssGlobal(o);
  const dados =
    o.fonte === 'remoto'
      ? ''
      : `  // Seus dados (ex.: vindos de fetch). Atribuir um array novo atualiza a grid.
  const faturas = await fetch('/api/faturas').then((r) => r.json());

`;
  const codigo = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Faturas</title>${css ? `\n  <style>\n${css.split('\n').map((l) => '    ' + l).join('\n')}\n  </style>` : ''}
</head>
<body>
  <bm-data-grid
    id="grid"
${attrs.map((a) => '    ' + a).join('\n')}
    style="height: 560px"
  ></bm-data-grid>

  <script type="module">
  // Sem build: o pacote já traz o Lit embutido. Com npm: import '@brunomouradev/data-grid';
  import 'https://cdn.jsdelivr.net/npm/@brunomouradev/data-grid@${VERSAO}/dist/index.js';

${declaracoes(o, false)
  .map((d) => d.split('\n').map((l) => '  ' + l).join('\n'))
  .join('\n\n')}
${o.cellTemplates ? '\n' + rendererDom().split('\n').map((l) => '  ' + l).join('\n') + '\n' : ''}
  function abrir(f) {
    console.log('abrir', f);
  }

${dados}  const grid = document.getElementById('grid');
${sets.join('\n')}

  grid.addEventListener('selection-changed', (e) => console.log(e.detail.selectedRowKeys));
  grid.addEventListener('row-dblclick', (e) => abrir(e.detail.data));
  </script>
</body>
</html>`;
  return [{ nome: 'index.html', codigo }];
}

export function gerarCodigo(lang: Linguagem, o: Opcoes): ArquivoCodigo[] {
  switch (lang) {
    case 'angular':
      return angular(o);
    case 'react':
      return react(o);
    case 'vue':
      return vue(o);
    case 'html':
      return html(o);
  }
}
