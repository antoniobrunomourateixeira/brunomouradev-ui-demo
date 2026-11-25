import { Component, computed, input, signal } from '@angular/core';
import { ArquivoCodigo, LINGUAGENS, Linguagem, destacar } from './codigo';

/** Cartão com o código gerado em Angular, React, Vue e HTML puro. */
@Component({
  selector: 'app-painel-codigo',
  template: `
    <section class="cartao codigo">
      <div class="codigo-topo">
        <div class="abas">
          @for (l of linguagens; track l.id) {
            <button [class.on]="lang() === l.id" (click)="trocar(l.id)">{{ l.rotulo }}</button>
          }
        </div>
        <button class="btn-ghost pequeno" (click)="copiar()">{{ copiado() ? 'Copiado ✓' : 'Copiar' }}</button>
      </div>
      <div class="instalar"><span>Instalar</span><code>{{ instalar()[lang()] }}</code></div>
      <div class="arquivos">
        @for (a of arquivos(); track a.nome; let i = $index) {
          <button [class.on]="arquivo().nome === a.nome" (click)="idx.set(i)">{{ a.nome }}</button>
        }
      </div>
      <pre><code [innerHTML]="html()"></code></pre>
      <ng-content />
      <p class="dica">O código acompanha as opções marcadas: só entra o que é diferente do padrão.</p>
    </section>
  `,
  host: { style: 'display: contents' },
})
export class PainelCodigo {
  /** Gera os arquivos de exemplo para uma linguagem (recriada quando as opções mudam). */
  readonly gerar = input.required<(l: Linguagem) => ArquivoCodigo[]>();
  readonly instalar = input.required<Record<Linguagem, string>>();

  readonly linguagens = LINGUAGENS;
  readonly lang = signal<Linguagem>('angular');
  readonly idx = signal(0);
  readonly copiado = signal(false);

  readonly arquivos = computed(() => this.gerar()(this.lang()));
  readonly arquivo = computed(() => this.arquivos()[Math.min(this.idx(), this.arquivos().length - 1)]);
  readonly html = computed(() => destacar(this.arquivo().codigo));

  trocar(l: Linguagem) {
    this.lang.set(l);
    this.idx.set(0);
  }

  async copiar() {
    try {
      await navigator.clipboard.writeText(this.arquivo().codigo);
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 1500);
    } catch {}
  }
}
