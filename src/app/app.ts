import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Signal, computed, signal, untracked, viewChild } from '@angular/core';
import '@brunomouradev/data-grid';
import type {
  BmDataGrid,
  ColumnDef,
  PagingOptions,
  RemoteLoadOptions,
  RemoteLoadResult,
  RowStyle,
  StateStoringOptions,
  SummaryItem,
} from '@brunomouradev/data-grid';
import { applyFilters, applySearch, applySort, resolveColumns } from '@brunomouradev/data-grid/engine';
import { BmCellTemplateDirective, BmDataGridTemplatesDirective } from './bm-cell-template.directive';
import { Fatura, gerarFaturas } from './data';
import { ArquivoCodigo, INSTALACAO, Linguagem, gerarCodigo } from './gerador-codigo';
import { OPCOES_PADRAO, Opcoes } from './opcoes';

type ChaveBool = { [K in keyof Opcoes]: Opcoes[K] extends boolean ? K : never }[keyof Opcoes];

interface Toggle {
  k: ChaveBool;
  rotulo: string;
  api: string;
}

interface Evento {
  hora: string;
  nome: string;
  detalhe: string;
}

const TOTAIS: SummaryItem[] = [
  { column: 'id', summaryType: 'count', displayFormat: '{0} faturas' },
  { column: 'valor', summaryType: 'sum', displayFormat: 'Total: {0}' },
  { column: 'desconto', summaryType: 'avg', displayFormat: 'Média: {0}' },
];

const TOTAIS_GRUPO: SummaryItem[] = [
  { column: 'id', summaryType: 'count', displayFormat: '{0} faturas' },
  { column: 'valor', summaryType: 'sum', alignByColumn: true },
];

@Component({
  selector: 'app-root',
  imports: [BmCellTemplateDirective, BmDataGridTemplatesDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App {
  readonly o = signal<Opcoes>({ ...OPCOES_PADRAO });

  /**
   * Valor derivado que só é recalculado quando as opções listadas mudam.
   * Sem isso, trocar o tema criaria um array de colunas novo e a grid perderia
   * o agrupamento/ordem que o usuário fez.
   */
  private derivar<T>(chaves: (keyof Opcoes)[], fn: (o: Opcoes) => T): Signal<T> {
    const projecao = computed(() => chaves.map((k) => this.o()[k]).join('|'));
    return computed(() => {
      projecao();
      return untracked(() => fn(this.o()));
    });
  }
  readonly grid = viewChild<ElementRef<BmDataGrid<Fatura>>>('grid');

  // ───────── Dados ─────────
  private readonly local = gerarFaturas(500);
  private grande?: Fatura[];

  readonly dados = computed<Fatura[]>(() => {
    const f = this.o().fonte;
    if (f === 'grande') return (this.grande ??= gerarFaturas(100_000, 7));
    if (f === 'remoto') return [];
    return this.local;
  });

  /** Simula um servidor usando o motor de dados da própria lib. */
  readonly carregarRemoto = async (op: RemoteLoadOptions): Promise<RemoteLoadResult<Fatura>> => {
    await new Promise((r) => setTimeout(r, 350));
    const locale = this.o().locale;
    const cols = resolveColumns(this.colunas(), this.local);
    let linhas = applyFilters(this.local, op.filters, cols);
    linhas = applySearch(linhas, op.searchText, cols, locale);
    linhas = applySort(linhas, op.sorts, cols, locale);
    const soma = linhas.reduce((s, l) => s + l.valor, 0);
    const media = linhas.length ? linhas.reduce((s, l) => s + l.desconto, 0) / linhas.length : null;
    return {
      data: op.take ? linhas.slice(op.skip, op.skip + op.take) : linhas,
      totalCount: linhas.length,
      summary: this.o().summary ? [linhas.length, soma, media] : undefined,
    };
  };

  // ───────── Configuração da grid derivada das opções ─────────
  readonly colunas = this.derivar(['fixarId', 'colunaOpcional', 'cellTemplates', 'cssClassCelula', 'agruparPor'], (o): ColumnDef<Fatura>[] => {
    const g = (campo: string) => (o.agruparPor === campo ? { groupIndex: 0 } : {});
    const cols: ColumnDef<Fatura>[] = [
      { dataField: 'id', caption: 'Nº', width: 80, format: 'integer', allowHiding: false, fixed: o.fixarId || undefined },
      { dataField: 'cliente.nome', caption: 'Cliente', minWidth: 180 },
      { dataField: 'cliente.uf', caption: 'UF', width: 70, alignment: 'center', ...g('cliente.uf') },
      { dataField: 'vendedor', caption: 'Vendedor', ...g('vendedor') },
      { dataField: 'status', caption: 'Status', cellTemplate: o.cellTemplates ? 'status' : undefined, ...g('status') },
      { dataField: 'forma', caption: 'Forma de pgto' },
      { dataField: 'emissao', caption: 'Emissão', format: 'date', visible: o.colunaOpcional ? false : undefined },
      { dataField: 'vencimento', caption: 'Vencimento', format: 'date', sortOrder: 'asc' },
      {
        dataField: 'valor',
        caption: 'Valor',
        format: 'currency',
        cssClass: o.cssClassCelula ? (v: number) => (v < 0 ? 'negativo' : '') : undefined,
      },
      { dataField: 'desconto', caption: 'Desconto', format: 'percent' },
      o.cellTemplates
        ? { dataField: 'recebido', caption: 'Recebido', cellTemplate: 'progresso', dataType: 'number' }
        : { dataField: 'recebido', caption: 'Recebido', format: 'percent' },
      { dataField: 'ativo', caption: 'Ativo', dataType: 'boolean' },
    ];
    if (o.cellTemplates) {
      cols.push({
        dataField: '__acoes',
        caption: 'Ações',
        width: 90,
        cellTemplate: 'acoes',
        calculateCellValue: () => '',
        allowSorting: false,
        allowFiltering: false,
        allowSearch: false,
        allowHeaderFiltering: false,
        allowGrouping: false,
      });
    }
    return cols;
  });

  readonly paging = this.derivar(['pagingEnabled', 'pageSize', 'showPageSizeSelector', 'showInfo'], (o): PagingOptions => {
    return {
      enabled: o.pagingEnabled,
      pageSize: o.pageSize,
      showPageSizeSelector: o.showPageSizeSelector,
      allowedPageSizes: [10, 20, 50, 100],
      showInfo: o.showInfo,
    };
  });

  readonly totais = this.derivar(['summary'], (o) => (o.summary ? TOTAIS : []));
  readonly totaisGrupo = this.derivar(['groupSummary'], (o) => (o.groupSummary ? TOTAIS_GRUPO : []));
  readonly exportFormats = this.derivar(['exportXlsx', 'exportCsv'], (o) => {
    const f: ('xlsx' | 'csv')[] = [];
    if (o.exportXlsx) f.push('xlsx');
    if (o.exportCsv) f.push('csv');
    return f.length ? f : (['xlsx'] as ('xlsx' | 'csv')[]);
  });

  readonly classeLinha = this.derivar(['rowClass'], (o) =>
    o.rowClass ? (f: Fatura) => (f.status === 'Atrasado' ? 'atrasado' : '') : undefined,
  );
  readonly estiloLinha = this.derivar(['rowStyle'], (o) =>
    o.rowStyle
      ? (f: Fatura): RowStyle | null =>
          f.status === 'Cancelado' ? { color: '#868e96', 'text-decoration': 'line-through' } : null
      : undefined,
  );
  readonly estadoSalvo = this.derivar(['stateStoring'], (o): StateStoringOptions | undefined =>
    o.stateStoring ? { storageKey: 'prototipo-faturas-grid' } : undefined,
  );

  /** Algumas opções só valem na criação da grid: mudar a chave recria o elemento. */
  readonly chaveGrid = computed(() => {
    const o = this.o();
    return `${o.fonte}|${o.stateStoring}|${o.virtualScrolling}|${o.agruparPor}`;
  });

  // ───────── Painel de opções ─────────
  readonly temas = ['default', 'bootstrap4', 'bootstrap5', 'tailwind', 'material'] as const;

  readonly grupos: { titulo: string; itens: Toggle[] }[] = [
    {
      titulo: 'Filtro e busca',
      itens: [
        { k: 'showFilterRow', rotulo: 'Linha de filtro', api: 'show-filter-row' },
        { k: 'showHeaderFilter', rotulo: 'Filtro no cabeçalho (funil)', api: 'show-header-filter' },
        { k: 'showSearchPanel', rotulo: 'Busca global', api: 'show-search-panel' },
        { k: 'showFilterPanel', rotulo: 'Barra de filtros ativos', api: 'show-filter-panel' },
      ],
    },
    {
      titulo: 'Colunas',
      itens: [
        { k: 'columnChooserEnabled', rotulo: 'Seletor de colunas', api: 'column-chooser-enabled' },
        { k: 'allowColumnReordering', rotulo: 'Arrastar para reordenar', api: 'allow-column-reordering' },
        { k: 'allowColumnResizing', rotulo: 'Redimensionar', api: 'allow-column-resizing' },
        { k: 'columnAutoWidth', rotulo: 'Largura pelo conteúdo', api: 'column-auto-width' },
        { k: 'fixarId', rotulo: 'Fixar coluna Nº à esquerda', api: 'fixed: true' },
        { k: 'colunaOpcional', rotulo: '"Emissão" começa oculta', api: 'visible: false' },
      ],
    },
    {
      titulo: 'Linhas',
      itens: [
        { k: 'showRowLines', rotulo: 'Linhas horizontais', api: 'showRowLines' },
        { k: 'showColumnLines', rotulo: 'Linhas verticais', api: 'show-column-lines' },
        { k: 'rowAlternationEnabled', rotulo: 'Linhas alternadas (zebra)', api: 'row-alternation-enabled' },
        { k: 'hoverStateDisabled', rotulo: 'Sem destaque no hover', api: 'hover-state-disabled' },
      ],
    },
    {
      titulo: 'Totais, regras e templates',
      itens: [
        { k: 'summary', rotulo: 'Totais no rodapé', api: 'summary' },
        { k: 'rowClass', rotulo: 'Atrasadas em vermelho', api: 'rowClass' },
        { k: 'rowStyle', rotulo: 'Canceladas riscadas', api: 'rowStyle' },
        { k: 'cssClassCelula', rotulo: 'Valor negativo em destaque', api: 'cssClass' },
        { k: 'cellTemplates', rotulo: 'Templates de célula', api: 'cellTemplate' },
      ],
    },
  ];

  set<K extends keyof Opcoes>(k: K, v: Opcoes[K]) {
    this.o.update((o) => {
      const novo = { ...o, [k]: v };
      // 100 mil linhas ficam melhores com rolagem virtual
      if (k === 'fonte' && v === 'grande') novo.virtualScrolling = true;
      return novo;
    });
  }

  alternar(k: ChaveBool) {
    this.set(k, !this.o()[k]);
  }

  valor(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  restaurar() {
    try {
      localStorage.removeItem('prototipo-faturas-grid');
    } catch {}
    this.o.set({ ...OPCOES_PADRAO });
    this.eventos.set([]);
  }

  // ───────── Métodos da grid ─────────
  private get g(): BmDataGrid<Fatura> | undefined {
    return this.grid()?.nativeElement;
  }

  executar(metodo: string) {
    const g = this.g;
    if (!g) return;
    switch (metodo) {
      case 'selectAll': g.selectAll(); break;
      case 'clearSelection': g.clearSelection(); break;
      case 'selectRows': g.selectRows([1000, 1001, 1002]); break;
      case 'clearFilter': g.clearFilter(); g.clearHeaderFilter(); g.searchByText(''); break;
      case 'clearSorting': g.clearSorting(); break;
      case 'sortBy': g.sortBy([{ field: 'valor', order: 'desc' }]); break;
      case 'groupBy': g.groupBy('cliente.uf'); break;
      case 'clearGrouping': g.clearGrouping(); break;
      case 'expandAll': g.expandAll(); break;
      case 'collapseAll': g.collapseAll(); break;
      case 'showColumnChooser': g.showColumnChooser(); break;
      case 'resetColumnLayout': g.resetColumnLayout(); break;
      case 'navigateToRow': g.navigateToRow(this.o().fonte === 'grande' ? 90_000 : 1450); break;
      case 'exportToExcel': g.exportToExcel(); break;
      case 'exportToCsv': g.exportToCsv(); break;
      case 'refresh': g.refresh(); break;
    }
    this.registrar('método', `${metodo}()`);
  }

  readonly metodos: { m: string; rotulo: string }[] = [
    { m: 'selectAll', rotulo: 'Selecionar tudo' },
    { m: 'selectRows', rotulo: 'Selecionar 1000–1002' },
    { m: 'clearSelection', rotulo: 'Limpar seleção' },
    { m: 'sortBy', rotulo: 'Ordenar por valor ↓' },
    { m: 'clearSorting', rotulo: 'Limpar ordenação' },
    { m: 'clearFilter', rotulo: 'Limpar filtros' },
    { m: 'groupBy', rotulo: 'Agrupar por UF' },
    { m: 'clearGrouping', rotulo: 'Desagrupar' },
    { m: 'expandAll', rotulo: 'Expandir grupos' },
    { m: 'collapseAll', rotulo: 'Recolher grupos' },
    { m: 'navigateToRow', rotulo: 'Ir para linha' },
    { m: 'showColumnChooser', rotulo: 'Abrir seletor de colunas' },
    { m: 'resetColumnLayout', rotulo: 'Resetar colunas' },
    { m: 'exportToExcel', rotulo: 'Exportar Excel' },
    { m: 'exportToCsv', rotulo: 'Exportar CSV' },
    { m: 'refresh', rotulo: 'refresh()' },
  ];

  // ───────── Eventos ─────────
  readonly eventos = signal<Evento[]>([]);
  readonly selecionadas = signal(0);
  readonly total = signal(0);
  readonly toast = signal<string | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  registrar(nome: string, detalhe: string) {
    const hora = new Date().toLocaleTimeString('pt-BR');
    this.eventos.update((l) => [{ hora, nome, detalhe }, ...l].slice(0, 60));
  }

  ev(nome: string, e: Event) {
    const d: any = (e as CustomEvent).detail ?? {};
    let detalhe = '';
    switch (nome) {
      case 'row-click':
      case 'row-dblclick':
      case 'row-enter':
        detalhe = `linha ${d.key}`;
        break;
      case 'selection-changed':
        this.selecionadas.set(d.selectedRowKeys.length);
        detalhe = `${d.selectedRowKeys.length} selecionada(s)`;
        break;
      case 'content-ready':
        this.total.set(d.totalCount);
        detalhe = `${d.totalCount} itens · página ${d.pageIndex + 1}/${Math.max(d.pageCount, 1)}`;
        break;
      case 'state-changed':
        detalhe = [
          d.sorts?.length ? `ordem: ${d.sorts.map((s: any) => s.field + ' ' + s.order).join(', ')}` : '',
          d.filters?.length ? `${d.filters.length} filtro(s)` : '',
          d.headerFilters?.length ? `${d.headerFilters.length} funil(is)` : '',
          d.searchText ? `busca "${d.searchText}"` : '',
          `pág. ${d.pageIndex + 1}`,
        ]
          .filter(Boolean)
          .join(' · ');
        break;
      case 'column-layout-changed':
        detalhe = d.layout.filter((c: any) => c.visible).map((c: any) => c.dataField).join(', ');
        break;
      case 'grouping-changed':
        detalhe = d.groups.length ? d.groups.map((g: any) => g.field).join(' › ') : 'sem grupos';
        break;
      case 'exporting':
        detalhe = `${d.fileName}.${d.format}${d.selectedOnly ? ' (selecionadas)' : ''}`;
        break;
      case 'copy-rows':
        detalhe = `${d.rowCount} linha(s) copiadas`;
        break;
      case 'load-error':
        detalhe = String(d.error);
        break;
    }
    this.registrar(nome, detalhe);
  }

  abrir(f: Fatura) {
    this.toast.set(`Fatura #${f.id} · ${f.cliente.nome}`);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2500);
  }

  // ───────── Código ─────────
  readonly linguagens: { id: Linguagem; rotulo: string }[] = [
    { id: 'angular', rotulo: 'Angular' },
    { id: 'react', rotulo: 'React' },
    { id: 'vue', rotulo: 'Vue' },
    { id: 'html', rotulo: 'HTML puro' },
  ];
  readonly lang = signal<Linguagem>('angular');
  readonly arquivoIdx = signal(0);
  readonly arquivos = computed<ArquivoCodigo[]>(() => gerarCodigo(this.lang(), this.o()));
  readonly arquivo = computed(() => this.arquivos()[Math.min(this.arquivoIdx(), this.arquivos().length - 1)]);
  readonly instalacao = computed(() => INSTALACAO[this.lang()]);
  readonly codigoHtml = computed(() => destacar(this.arquivo().codigo));
  readonly copiado = signal(false);

  trocarLang(l: Linguagem) {
    this.lang.set(l);
    this.arquivoIdx.set(0);
  }

  async copiar() {
    try {
      await navigator.clipboard.writeText(this.arquivo().codigo);
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 1500);
    } catch {}
  }
}

/** Realce de sintaxe mínimo (comentários, strings, palavras-chave, tags). */
function destacar(codigo: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const re =
    /(\/\/[^\n]*|<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(import|from|export|const|let|function|return|async|await|class|new|type|interface|if|else|switch|case|declare|global|namespace|true|false|null|undefined)\b|(<\/?[a-zA-Z][\w.-]*|\/?>)|(@[A-Z]\w*)/g;
  let out = '';
  let ultimo = 0;
  for (let m: RegExpExecArray | null; (m = re.exec(codigo)); ) {
    out += esc(codigo.slice(ultimo, m.index));
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 't' : 'd';
    out += `<span class="${cls}">${esc(m[0])}</span>`;
    ultimo = m.index + m[0].length;
  }
  return out + esc(codigo.slice(ultimo));
}
