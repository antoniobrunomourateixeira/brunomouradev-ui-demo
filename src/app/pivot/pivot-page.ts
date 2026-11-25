import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Signal, computed, signal, untracked, viewChild } from '@angular/core';
import '@brunomouradev/pivot-grid';
import '@brunomouradev/data-grid';
import type { BmPivotGrid, PivotCellEventDetail, PivotGridMessages } from '@brunomouradev/pivot-grid';
import type { ColumnDef } from '@brunomouradev/data-grid';
import { Evento, Linguagem, instalacao } from '../shared/codigo';
import { Fatura, gerarFaturas } from '../shared/data';
import { PainelCodigo } from '../shared/painel-codigo';
import { PainelEventos } from '../shared/painel-eventos';
import { montarCampos } from './campos';
import { gerarCodigoPivot } from './gerador-codigo-pivot';
import { MODOS_EXIBICAO, OpcoesPivot, PIVOT_PADRAO } from './opcoes-pivot';

type ChaveBool = { [K in keyof OpcoesPivot]: OpcoesPivot[K] extends boolean ? K : never }[keyof OpcoesPivot];

interface Toggle {
  k: ChaveBool;
  rotulo: string;
  api: string;
}

const MENSAGENS: Partial<PivotGridMessages> = {
  grandTotal: 'Total geral',
  noData: 'Nenhum faturamento no período',
  availableFields: 'Campos disponíveis',
};

/** Colunas da DataGrid do drill down. */
const COLUNAS_DETALHE: ColumnDef<Fatura>[] = [
  { dataField: 'id', caption: 'Nº', width: 70, format: 'integer' },
  { dataField: 'cliente.nome', caption: 'Cliente' },
  { dataField: 'cliente.uf', caption: 'UF', width: 60, alignment: 'center' },
  { dataField: 'vendedor', caption: 'Vendedor' },
  { dataField: 'status', caption: 'Status' },
  { dataField: 'vencimento', caption: 'Vencimento', format: 'date' },
  { dataField: 'valor', caption: 'Valor', format: 'currency' },
];

@Component({
  selector: 'app-pivot-page',
  imports: [PainelCodigo, PainelEventos],
  templateUrl: './pivot-page.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PivotPage {
  readonly o = signal<OpcoesPivot>({ ...PIVOT_PADRAO });
  readonly pivot = viewChild<ElementRef<BmPivotGrid<Fatura>>>('pivot');

  /** Valor derivado que só muda quando as opções listadas mudam (não perde o que o usuário arrastou). */
  private derivar<T>(chaves: (keyof OpcoesPivot)[], fn: (o: OpcoesPivot) => T): Signal<T> {
    const projecao = computed(() => chaves.map((k) => this.o()[k]).join('|'));
    return computed(() => {
      projecao();
      return untracked(() => fn(this.o()));
    });
  }

  // ───────── Dados ─────────
  private readonly local = gerarFaturas(500);
  private grande?: Fatura[];
  readonly dados = computed(() => (this.o().fonte === 'grande' ? (this.grande ??= gerarFaturas(20_000, 11)) : this.local));

  // ───────── Configuração derivada ─────────
  readonly campos = this.derivar(
    ['linhas', 'colunas', 'expandido', 'summaryType', 'quantidade', 'summaryDisplayMode', 'conditionalFormat', 'ordenarPorTotal', 'topN', 'topNMenores', 'filtroInicial'],
    (o) => montarCampos(o),
  );
  readonly exportFormats = this.derivar(['exportXlsx', 'exportCsv'], (o) => {
    const f: ('xlsx' | 'csv')[] = [];
    if (o.exportXlsx) f.push('xlsx');
    if (o.exportCsv) f.push('csv');
    return f.length ? f : (['xlsx'] as ('xlsx' | 'csv')[]);
  });
  readonly mensagens = this.derivar(['mensagens'], (o): Partial<PivotGridMessages> => (o.mensagens ? MENSAGENS : {}));

  // ───────── Painel de opções ─────────
  readonly temas = ['default', 'bootstrap4', 'bootstrap5', 'tailwind', 'material'] as const;
  readonly modos = MODOS_EXIBICAO;

  readonly grupos: { titulo: string; itens: Toggle[] }[] = [
    {
      titulo: 'Totais',
      itens: [
        { k: 'showRowGrandTotals', rotulo: 'Total geral das linhas', api: 'showRowGrandTotals' },
        { k: 'showColumnGrandTotals', rotulo: 'Total geral das colunas', api: 'showColumnGrandTotals' },
        { k: 'showColumnTotals', rotulo: 'Subtotal dos grupos de colunas', api: 'showColumnTotals' },
      ],
    },
    {
      titulo: 'Interação',
      itens: [
        { k: 'showFieldPanel', rotulo: 'Painel de campos (arrastar)', api: 'show-field-panel' },
        { k: 'showExpandButtons', rotulo: 'Expandir / recolher tudo', api: 'show-expand-buttons' },
        { k: 'allowFieldDragging', rotulo: 'Arrastar campos', api: 'allowFieldDragging' },
        { k: 'allowSorting', rotulo: 'Ordenar pelo cabeçalho', api: 'allowSorting' },
        { k: 'allowFiltering', rotulo: 'Filtrar valores (funil)', api: 'allowFiltering' },
      ],
    },
  ];

  set<K extends keyof OpcoesPivot>(k: K, v: OpcoesPivot[K]) {
    this.o.update((o) => ({ ...o, [k]: v }));
  }

  alternar(k: ChaveBool) {
    this.set(k, !this.o()[k]);
  }

  valor(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  restaurar() {
    this.o.set({ ...PIVOT_PADRAO });
    this.eventos.set([]);
    this.detalhe.set(null);
  }

  // ───────── Métodos ─────────
  readonly metodos: { m: string; rotulo: string }[] = [
    { m: 'expandAll', rotulo: 'Expandir tudo' },
    { m: 'collapseAll', rotulo: 'Recolher tudo' },
    { m: 'sortBySummary', rotulo: 'Ordenar linhas pelo total ↓' },
    { m: 'percent', rotulo: 'Mostrar % do total geral' },
    { m: 'moveField', rotulo: 'Mover "Forma" para colunas' },
    { m: 'drillDown', rotulo: 'drillDown() do total geral' },
    { m: 'getFields', rotulo: 'getFields()' },
    { m: 'exportToExcel', rotulo: 'Exportar Excel' },
    { m: 'exportToCsv', rotulo: 'Exportar CSV' },
    { m: 'refresh', rotulo: 'refresh()' },
  ];

  executar(m: string) {
    const p = this.pivot()?.nativeElement;
    if (!p) return;
    let detalhe = `${m}()`;
    switch (m) {
      case 'expandAll': p.expandAll('both'); detalhe = "expandAll('both')"; break;
      case 'collapseAll': p.collapseAll('both'); detalhe = "collapseAll('both')"; break;
      case 'sortBySummary': p.sortBySummary('valor', [], 'desc'); detalhe = "sortBySummary('valor', [], 'desc')"; break;
      case 'percent':
        p.updateField('valor', { summaryDisplayMode: 'percentOfGrandTotal' });
        detalhe = "updateField('valor', { summaryDisplayMode: 'percentOfGrandTotal' })";
        break;
      case 'moveField': p.moveField('forma', 'column'); detalhe = "moveField('forma', 'column')"; break;
      case 'drillDown': {
        const registros = p.drillDown([], []);
        this.detalhe.set({ titulo: 'Total geral', registros });
        detalhe = `drillDown([], []) → ${registros.length} registros`;
        break;
      }
      case 'getFields': {
        const f = p.getFields();
        detalhe = `getFields() → ${f.filter((x) => x.area).map((x) => `${x.name ?? x.dataField}:${x.area}`).join(', ')}`;
        break;
      }
      case 'exportToExcel': p.exportToExcel(); break;
      case 'exportToCsv': p.exportToCsv(); break;
      case 'refresh': p.refresh(); break;
    }
    this.registrar('método', detalhe);
  }

  // ───────── Eventos e drill down ─────────
  readonly eventos = signal<Evento[]>([]);
  readonly detalhe = signal<{ titulo: string; registros: Fatura[] } | null>(null);
  readonly colunasDetalhe = COLUNAS_DETALHE;

  registrar(nome: string, detalhe: string) {
    const hora = new Date().toLocaleTimeString('pt-BR');
    this.eventos.update((l) => [{ hora, nome, detalhe }, ...l].slice(0, 60));
  }

  /** Texto de um valor do caminho: trimestre vira "T1", mês vira "mar". */
  private texto(campo: string, v: any): string {
    if (campo === 'trimestre') return `T${v}`;
    if (campo === 'mes' && typeof v === 'number') {
      return new Date(2000, v - 1, 1).toLocaleDateString(this.o().locale, { month: 'short' }).replace('.', '');
    }
    return String(v);
  }

  private caminho(d: PivotCellEventDetail<Fatura>): string {
    const partes = (path: any[], campos: string[]) => path.map((v, i) => this.texto(campos[i], v)).join(' › ');
    const linha = d.rowType === 'grand' ? 'Total geral' : partes(d.rowPath, d.rowFields);
    const coluna = d.columnType === 'grand' ? 'Total geral' : partes(d.columnPath, d.columnFields);
    return `${linha || '—'} × ${coluna || '—'}`;
  }

  ev(nome: string, e: Event) {
    const d: any = (e as CustomEvent).detail ?? {};
    let detalhe = '';
    if (nome === 'cell-click' || nome === 'cell-dblclick') {
      detalhe = `${this.caminho(d)} = ${d.value == null ? '—' : d.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
      if (nome === 'cell-dblclick' && d.records) {
        this.detalhe.set({ titulo: this.caminho(d), registros: d.records });
        detalhe += ` · ${d.records.length} registros`;
      }
    } else if (nome === 'fields-changed') {
      detalhe = d.fields.filter((f: any) => f.area).map((f: any) => `${f.caption ?? f.name}:${f.area}`).join(', ');
    }
    this.registrar(nome, detalhe);
  }

  // ───────── Código ─────────
  readonly instalar = instalacao('pivot-grid');
  readonly gerar = computed(() => {
    const o = this.o();
    return (l: Linguagem) => gerarCodigoPivot(l, o);
  });
}
