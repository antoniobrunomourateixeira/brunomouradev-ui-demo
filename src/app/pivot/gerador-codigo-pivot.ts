import { ArquivoCodigo, Linguagem, VERSAO } from '../shared/codigo';
import { camposCodigo, montarCampos } from './campos';
import { OpcoesPivot } from './opcoes-pivot';

/** Gera o código de exemplo do PivotGrid. Só entra o que é diferente do padrão. */

function atributos(o: OpcoesPivot): string[] {
  const a: string[] = [];
  if (o.theme !== 'default') a.push(`theme="${o.theme}"`);
  if (o.appearance !== 'light') a.push(`appearance="${o.appearance}"`);
  if (o.density !== 'standard') a.push(`density="${o.density}"`);
  if (o.locale !== 'pt-BR') a.push(`locale="${o.locale}"`);
  if (o.showFieldPanel) a.push('show-field-panel');
  if (o.showExpandButtons) a.push('show-expand-buttons');
  if (o.rowLayout !== 'tree') a.push(`row-layout="${o.rowLayout}"`);
  if (o.rowHeaderWidth !== 220) a.push(`row-header-width="${o.rowHeaderWidth}"`);
  if (o.showExportButton) {
    a.push('show-export-button');
    const f = [o.exportXlsx && 'xlsx', o.exportCsv && 'csv'].filter(Boolean).join(',') || 'xlsx';
    if (f !== 'xlsx,csv') a.push(`export-formats="${f}"`);
    if (o.exportFileName && o.exportFileName !== 'pivot') a.push(`export-file-name="${o.exportFileName}"`);
  }
  return a;
}

/** Propriedades booleanas que começam ligadas: só vão por código quando desligadas. */
function desligadas(o: OpcoesPivot): string[] {
  const p: string[] = [];
  if (!o.showRowGrandTotals) p.push('showRowGrandTotals');
  if (!o.showColumnGrandTotals) p.push('showColumnGrandTotals');
  if (!o.showColumnTotals) p.push('showColumnTotals');
  if (o.rowLayout === 'tabular' && !o.showRowTotals) p.push('showRowTotals');
  if (!o.allowFieldDragging) p.push('allowFieldDragging');
  if (!o.allowSorting) p.push('allowSorting');
  if (!o.allowFiltering) p.push('allowFiltering');
  return p;
}

const TEXTOS = `{
  grandTotal: 'Total geral',
  noData: 'Nenhuma venda no período',
  availableFields: 'Campos disponíveis',
}`;

function declaracoes(o: OpcoesPivot, ts: boolean, kw: string): string {
  const campos = camposCodigo(montarCampos(o));
  const tipo = ts ? ': PivotField<Venda>[]' : '';
  let out = `${kw}campos${tipo} = ${campos};`;
  if (o.mensagens) out += `\n\n${kw}textos${ts ? ': Partial<PivotGridMessages>' : ''} = ${TEXTOS};`;
  return out;
}

const indentar = (texto: string, n: number) =>
  texto.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

function css(o: OpcoesPivot): string {
  return o.corPrimaria ? `bm-pivot-grid { --bm-color-primary: ${o.corPrimaria}; }` : '';
}

// ─────────────── Angular ───────────────
function angular(o: OpcoesPivot): ArquivoCodigo[] {
  const props = ['[dataSource]="vendas"', '[fields]="campos"'];
  for (const p of desligadas(o)) props.push(`[${p}]="false"`);
  if (o.mensagens) props.push('[messages]="textos"');
  const corpo = ['#pivot', ...atributos(o), ...props, '(cell-dblclick)="detalhar($event.detail)"', '(fields-changed)="salvarLayout($event.detail.fields)"', 'style="height: 600px"'];
  const html = `<bm-pivot-grid\n${corpo.map((l) => '  ' + l).join('\n')}\n></bm-pivot-grid>`;
  const tipos = ['BmPivotGrid', 'PivotField', 'PivotCellEventDetail'];
  if (o.mensagens) tipos.push('PivotGridMessages');
  const ts = `import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import '@brunomouradev/pivot-grid'; // registra <bm-pivot-grid>
import type { ${tipos.join(', ')} } from '@brunomouradev/pivot-grid';
import { Venda } from './venda';

@Component({
  selector: 'app-vendas',
  templateUrl: './vendas.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VendasComponent {
  @ViewChild('pivot') pivot!: ElementRef<BmPivotGrid<Venda>>;

  vendas: Venda[] = []; // atribua um array novo para atualizar

${indentar(declaracoes(o, true, ''), 2)}

  /** Duplo clique: os registros por trás da célula (drill down). */
  detalhar(e: PivotCellEventDetail<Venda>) {
    console.log(e.rowPath, e.columnPath, e.records);
  }

  /** Layout mudado pelo usuário (arrastar, filtrar, ordenar): salve e devolva em [fields]. */
  salvarLayout(campos: PivotField[]) {
    localStorage.setItem('vendas-pivot', JSON.stringify(campos));
  }

  exportar() {
    this.pivot.nativeElement.exportToExcel('${o.exportFileName || 'pivot'}');
  }
}`;
  const arquivos: ArquivoCodigo[] = [
    { nome: 'vendas.component.html', codigo: html },
    { nome: 'vendas.component.ts', codigo: ts },
  ];
  if (css(o)) arquivos.push({ nome: 'styles.scss', codigo: css(o) });
  arquivos.push({
    nome: 'main.ts (opcional)',
    codigo: `// Configuração global (vale para DataGrid, PivotGrid e TreeList)
import { configure } from '@brunomouradev/pivot-grid';
configure({ theme: '${o.theme}', appearance: '${o.appearance}', density: '${o.density}', locale: '${o.locale}' });`,
  });
  return arquivos;
}

// ─────────────── React ───────────────
function react(o: OpcoesPivot): ArquivoCodigo[] {
  const sets = ['    pivot.fields = campos;'];
  for (const p of desligadas(o)) sets.push(`    pivot.${p} = false;`);
  if (o.mensagens) sets.push('    pivot.messages = textos;');
  const attrs = atributos(o).map((a) => (a.includes('=') ? a : `${a}=""`));
  const tipos = ['BmPivotGrid', 'PivotField'];
  if (o.mensagens) tipos.push('PivotGridMessages');
  const codigo = `import { useEffect, useRef } from 'react';
import '@brunomouradev/pivot-grid';
import type { ${tipos.join(', ')} } from '@brunomouradev/pivot-grid';
import type { Venda } from './venda';

declare global {
  namespace JSX { interface IntrinsicElements { 'bm-pivot-grid': any } }
}

${declaracoes(o, true, 'const ')}

export function Vendas({ vendas }: { vendas: Venda[] }) {
  const ref = useRef<BmPivotGrid<Venda>>(null);

  useEffect(() => {
    const pivot = ref.current!;
${sets.join('\n')}
    const onDetalhe = (e: Event) => console.log((e as CustomEvent).detail.records);
    pivot.addEventListener('cell-dblclick', onDetalhe);
    return () => pivot.removeEventListener('cell-dblclick', onDetalhe);
  }, []);

  useEffect(() => {
    ref.current!.dataSource = vendas;
  }, [vendas]);

  return (
    <bm-pivot-grid
      ref={ref}
${attrs.map((a) => '      ' + a).join('\n')}
      style={{ height: 600 }}
    />
  );
}`;
  const arquivos: ArquivoCodigo[] = [{ nome: 'Vendas.tsx', codigo }];
  if (css(o)) arquivos.push({ nome: 'index.css', codigo: css(o) });
  return arquivos;
}

// ─────────────── Vue ───────────────
function vue(o: OpcoesPivot): ArquivoCodigo[] {
  const props = [':dataSource.prop="vendas"', ':fields.prop="campos"'];
  for (const p of desligadas(o)) props.push(`:${p}.prop="false"`);
  if (o.mensagens) props.push(':messages.prop="textos"');
  const corpo = [...atributos(o), ...props, '@cell-dblclick="(e) => console.log(e.detail.records)"', 'style="height: 600px"'];
  const tipos = ['PivotField'];
  if (o.mensagens) tipos.push('PivotGridMessages');
  const codigo = `<template>
  <bm-pivot-grid
${corpo.map((l) => '    ' + l).join('\n')}
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import '@brunomouradev/pivot-grid';
import type { ${tipos.join(', ')} } from '@brunomouradev/pivot-grid';
import type { Venda } from './venda';

const vendas = ref<Venda[]>([]);

${declaracoes(o, true, 'const ')}
</script>`;
  return [
    { nome: 'Vendas.vue', codigo },
    {
      nome: 'vite.config.ts',
      codigo: `import vue from '@vitejs/plugin-vue';

export default {
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('bm-') } } })],
};`,
    },
  ];
}

// ─────────────── HTML puro ───────────────
function html(o: OpcoesPivot): ArquivoCodigo[] {
  const sets = ['  pivot.fields = campos;'];
  for (const p of desligadas(o)) sets.push(`  pivot.${p} = false;`);
  if (o.mensagens) sets.push('  pivot.messages = textos;');
  const estilo = css(o);
  const codigo = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Vendas</title>${estilo ? `\n  <style>${estilo}</style>` : ''}
</head>
<body>
  <bm-pivot-grid
    id="pivot"
${atributos(o).map((a) => '    ' + a).join('\n')}
    style="height: 600px"
  ></bm-pivot-grid>

  <script type="module">
  import 'https://cdn.jsdelivr.net/npm/@brunomouradev/pivot-grid@${VERSAO}/dist/index.js';

${indentar(declaracoes(o, false, 'const '), 2)}

  const pivot = document.getElementById('pivot');
${sets.join('\n')}
  pivot.dataSource = await fetch('/api/vendas').then((r) => r.json());

  // Duplo clique numa célula: os registros por trás dela (drill down)
  pivot.addEventListener('cell-dblclick', (e) => console.log(e.detail.records));
  </script>
</body>
</html>`;
  return [{ nome: 'index.html', codigo }];
}

export function gerarCodigoPivot(lang: Linguagem, o: OpcoesPivot): ArquivoCodigo[] {
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
