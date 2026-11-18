import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { roleGuard } from './role.guard';

function buildRoute(path: string | undefined): ActivatedRouteSnapshot {
  return { routeConfig: path === undefined ? null : { path } } as ActivatedRouteSnapshot;
}

describe('roleGuard', () => {
  let canAccess: jest.Mock<boolean>;
  let parseUrl: jest.Mock;

  beforeEach(() => {
    canAccess = jest.fn();
    parseUrl = jest.fn((url: string) => ({ url }) as unknown as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { canAccess } },
        { provide: Router, useValue: { parseUrl } },
      ],
    });
  });

  function run(route: ActivatedRouteSnapshot) {
    return TestBed.runInInjectionContext(() => roleGuard(route, {} as never));
  }

  it('allows access when the role can access the route path', () => {
    canAccess.mockReturnValue(true);

    const result = run(buildRoute('facturas-pendientes'));

    expect(canAccess).toHaveBeenCalledWith('facturas-pendientes');
    expect(result).toBe(true);
    expect(parseUrl).not.toHaveBeenCalled();
  });

  it('redirects to the dashboard root when access is denied', () => {
    canAccess.mockReturnValue(false);

    const result = run(buildRoute('ventas-descuento'));

    expect(result).toEqual({ url: '/' });
    expect(parseUrl).toHaveBeenCalledWith('/');
  });

  it('defaults to an empty path when routeConfig is missing', () => {
    canAccess.mockReturnValue(true);

    run(buildRoute(undefined));

    expect(canAccess).toHaveBeenCalledWith('');
  });
});
