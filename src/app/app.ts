import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { VERSAO } from './shared/codigo';

/** Casca do site: topo com o menu dos componentes e a página da rota. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topo">
      <div class="marca">
        <span class="logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 4h18v4H3zm0 6h5v4H3zm7 0h11v4H10zm-7 6h5v4H3zm7 0h11v4H10z" /></svg>
        </span>
        <div>
          <h1>brunomouradev-ui</h1>
          <p>Componentes {{ versao }} · demonstração em Angular 20</p>
        </div>
      </div>

      <nav class="menu">
        <a routerLink="/datagrid" routerLinkActive="on">DataGrid</a>
        <!-- /pivot redireciona para /pivot/vendas; o link fica ativo em qualquer base -->
        <a routerLink="/pivot" routerLinkActive="on">PivotGrid</a>
      </nav>

      <a class="gh" href="https://github.com/antoniobrunomourateixeira/brunomouradev-ui" target="_blank" rel="noopener">GitHub</a>
    </header>

    <router-outlet />
  `,
  styleUrl: './app.scss',
})
export class App {
  readonly versao = VERSAO;
}
