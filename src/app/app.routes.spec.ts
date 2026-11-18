import { loadRemoteModule } from '@angular-architects/native-federation';

import { routes } from './app.routes';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// Cada propiedad simula el símbolo que expone el remoto correspondiente,
// de modo que los `.then(m => m.X)` de cada ruta resuelvan a un valor distinto.
const remoteModule = {
  FacturaPendienteComponent: 'FacturaPendienteComponent',
  NotasComponent: 'NotasComponent',
  dashboardAnulaciones: [{ path: 'anulaciones-remote' }],
  routes: [{ path: 'remote' }],
};

jest.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: jest.fn().mockResolvedValue({
    FacturaPendienteComponent: 'FacturaPendienteComponent',
    NotasComponent: 'NotasComponent',
    dashboardAnulaciones: [{ path: 'anulaciones-remote' }],
    routes: [{ path: 'remote' }],
  }),
}));

describe('routes', () => {
  const loadRemoteModuleMock = loadRemoteModule as jest.MockedFunction<typeof loadRemoteModule>;

  beforeEach(() => {
    loadRemoteModuleMock.mockClear();
  });

  it('protects the root with authGuard and lazy-loads the Dashboard', async () => {
    const root = routes[0];

    expect(root.path).toBe('');
    expect(root.canActivate).toEqual([authGuard]);

    const loaded = await root.loadComponent!();
    expect(loaded).toBe(Dashboard);
  });

  it('declares the expected child routes in order', () => {
    const children = routes[0].children ?? [];

    expect(children.map((c) => c.path)).toEqual([
      'facturas-pendientes',
      'notas',
      'anulaciones',
      'ventas-descuento',
      'movilizados-cliente',
      'conciliacion-interpay',
    ]);
  });

  it('guards every child with roleGuard', () => {
    const children = routes[0].children ?? [];
    const byPath = (path: string) => children.find((c) => c.path === path)!;

    expect(byPath('facturas-pendientes').canActivate).toEqual([roleGuard]);
    expect(byPath('notas').canActivate).toEqual([roleGuard]);
    expect(byPath('anulaciones').canActivate).toEqual([roleGuard]);
    expect(byPath('ventas-descuento').canActivate).toEqual([roleGuard]);
    expect(byPath('movilizados-cliente').canActivate).toEqual([roleGuard]);
    expect(byPath('conciliacion-interpay').canActivate).toEqual([roleGuard]);
  });

  it('lazy-loads "facturas-pendientes" as a component from its remote', async () => {
    const child = routes[0].children!.find((c) => c.path === 'facturas-pendientes')!;

    const loaded = await child.loadComponent!();

    expect(loaded).toBe(remoteModule.FacturaPendienteComponent);
    expect(loadRemoteModuleMock).toHaveBeenCalledWith(
      'factura-pendiente',
      './FacturaPendienteComponent'
    );
  });

  it('lazy-loads "notas" as a component from its remote', async () => {
    const child = routes[0].children!.find((c) => c.path === 'notas')!;

    const loaded = await child.loadComponent!();

    expect(loaded).toBe(remoteModule.NotasComponent);
    expect(loadRemoteModuleMock).toHaveBeenCalledWith('notas', './NotasComponent');
  });

  it('lazy-loads "anulaciones" child routes from its remote', async () => {
    const child = routes[0].children!.find((c) => c.path === 'anulaciones')!;

    const loaded = await child.loadChildren!();

    expect(loaded).toEqual(remoteModule.dashboardAnulaciones);
    expect(loadRemoteModuleMock).toHaveBeenCalledWith('anulaciones', './Routes');
  });

  it('lazy-loads "ventas-descuento" child routes from the conciliacion remote', async () => {
    const child = routes[0].children!.find((c) => c.path === 'ventas-descuento')!;

    const loaded = await child.loadChildren!();

    expect(loaded).toEqual(remoteModule.routes);
    expect(loadRemoteModuleMock).toHaveBeenCalledWith('conciliacion-interpay', './DiscountSales');
  });

  it('lazy-loads "movilizados-cliente" child routes from the conciliacion remote', async () => {
    const child = routes[0].children!.find((c) => c.path === 'movilizados-cliente')!;

    const loaded = await child.loadChildren!();

    expect(loaded).toEqual(remoteModule.routes);
    expect(loadRemoteModuleMock).toHaveBeenCalledWith('conciliacion-interpay', './ClientMobilized');
  });

  it('lazy-loads "conciliacion-interpay" child routes from the conciliacion remote', async () => {
    const child = routes[0].children!.find((c) => c.path === 'conciliacion-interpay')!;

    const loaded = await child.loadChildren!();

    expect(loaded).toEqual(remoteModule.routes);
    expect(loadRemoteModuleMock).toHaveBeenCalledWith(
      'conciliacion-interpay',
      './InterpayConciliation'
    );
  });
});
