import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then(c => c.Dashboard),
    children: [
      {
        path: 'facturas-pendientes',
        canActivate: [roleGuard],
        loadComponent: () => loadRemoteModule('factura-pendiente', './FacturaPendienteComponent').then(m => m.FacturaPendienteComponent),
      },
      {
        path: 'notas',
        canActivate: [roleGuard],
        loadComponent: () => loadRemoteModule('notas', './NotasComponent').then(c => c.NotasComponent),
      },
      {
        path: 'anulaciones',
        canActivate: [roleGuard],
        loadChildren: () => loadRemoteModule('anulaciones', './Routes').then((m) => m.dashboardAnulaciones)
      },
      {
        path: 'ventas-descuento',
        canActivate: [roleGuard],
        loadChildren: () => loadRemoteModule('conciliacion-interpay', './DiscountSales').then((m) => m.routes)
      },
      {
        path: 'movilizados-cliente',
        canActivate: [roleGuard],
        loadChildren: () => loadRemoteModule('conciliacion-interpay', './ClientMobilized').then((m) => m.routes)
      },
      {
        path: 'conciliacion-interpay',
        canActivate: [roleGuard],
        loadChildren: () => loadRemoteModule('conciliacion-interpay', './InterpayConciliation').then((m) => m.routes)
      },
    ]
  },
];

