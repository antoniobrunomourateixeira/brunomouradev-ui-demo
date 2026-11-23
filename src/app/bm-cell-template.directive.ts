import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import type { CellTemplateContext } from '@brunomouradev/data-grid';

/**
 * Templates de célula do Angular dentro do <bm-data-grid> (copiado da DOCUMENTACAO.md da lib).
 * Uso: <ng-template bmCellTemplate="status" let-linha let-valor="valor">...</ng-template>
 */
@Directive({ selector: 'ng-template[bmCellTemplate]' })
export class BmCellTemplateDirective {
  @Input('bmCellTemplate') nome!: string;
  constructor(public template: TemplateRef<any>) {}
}

@Directive({ selector: 'bm-data-grid' })
export class BmDataGridTemplatesDirective implements AfterContentInit, OnDestroy {
  @ContentChildren(BmCellTemplateDirective) templates!: QueryList<BmCellTemplateDirective>;
  private sub?: Subscription;

  constructor(private el: ElementRef<any>, private vcr: ViewContainerRef) {}

  ngAfterContentInit() {
    this.ligar();
    this.sub = this.templates.changes.subscribe(() => this.ligar());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private ligar() {
    const mapa = new Map(this.templates.map((t) => [t.nome, t.template] as const));
    this.el.nativeElement.cellTemplateRenderer = !mapa.size
      ? undefined
      : (ctx: CellTemplateContext) => {
          const template = mapa.get(ctx.name);
          if (!template) return;
          const view = this.vcr.createEmbeddedView(template, {
            $implicit: ctx.row,
            linha: ctx.row,
            valor: ctx.value,
            coluna: ctx.column,
          });
          view.rootNodes.forEach((n) => ctx.element.appendChild(n));
          view.detectChanges();
          return () => view.destroy();
        };
  }
}
