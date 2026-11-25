import { Component, input, output } from '@angular/core';
import { Evento } from './codigo';

/** Cartão com o log de eventos do componente. */
@Component({
  selector: 'app-painel-eventos',
  template: `
    <section class="cartao eventos">
      <div class="codigo-topo">
        <h3>Eventos</h3>
        <button class="btn-ghost pequeno" (click)="limpar.emit()">Limpar</button>
      </div>
      <ol>
        @for (e of eventos(); track $index) {
          <li>
            <span class="hora">{{ e.hora }}</span>
            <span class="nome">{{ e.nome }}</span>
            <span class="det">{{ e.detalhe }}</span>
          </li>
        } @empty {
          <li class="vazio">{{ vazio() }}</li>
        }
      </ol>
    </section>
  `,
  host: { style: 'display: contents' },
})
export class PainelEventos {
  readonly eventos = input.required<Evento[]>();
  readonly vazio = input('Interaja com o componente para ver os eventos aqui.');
  readonly limpar = output<void>();
}
