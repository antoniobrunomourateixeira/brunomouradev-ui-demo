import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'datagrid' },
  {
    path: 'datagrid',
    title: 'DataGrid · brunomouradev-ui',
    loadComponent: () => import('./datagrid/datagrid-page').then((m) => m.DataGridPage),
  },
  { path: 'pivot', pathMatch: 'full', redirectTo: 'pivot/vendas' },
  {
    // :base = vendas | cobranca (um endereço por base de dados)
    path: 'pivot/:base',
    title: 'PivotGrid · brunomouradev-ui',
    loadComponent: () => import('./pivot/pivot-page').then((m) => m.PivotPage),
  },
  { path: '**', redirectTo: 'datagrid' },
];
