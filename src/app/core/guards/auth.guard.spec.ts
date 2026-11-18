import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { UserAuthResponse } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

interface AuthMock {
  isAuthenticated: jest.Mock<boolean>;
  token: jest.Mock<string>;
  userName: jest.Mock<string>;
  userAuth: jest.Mock<Observable<UserAuthResponse | null>>;
  loadMenu: jest.Mock<Observable<unknown>>;
  setSession: jest.Mock;
  redirectToLogin: jest.Mock;
}

function buildUser(partial: Partial<UserAuthResponse> = {}): UserAuthResponse {
  return {
    NombreUsuario: 'Andrés',
    Usuario: 'andres',
    NombreRol: 'Admin',
    NombreAplicacion: 'App',
    ...partial,
  };
}

function buildRoute(query: Record<string, string> = {}): ActivatedRouteSnapshot {
  return { queryParamMap: convertToParamMap(query) } as ActivatedRouteSnapshot;
}

function buildState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

describe('authGuard', () => {
  let auth: AuthMock;
  let parseUrl: jest.Mock;

  beforeEach(() => {
    auth = {
      isAuthenticated: jest.fn().mockReturnValue(false),
      token: jest.fn().mockReturnValue(''),
      userName: jest.fn().mockReturnValue(''),
      userAuth: jest.fn(),
      loadMenu: jest.fn().mockReturnValue(of([])),
      setSession: jest.fn(),
      redirectToLogin: jest.fn(),
    };
    parseUrl = jest.fn((url: string) => ({ url }) as unknown as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: { parseUrl } },
      ],
    });
  });

  function run(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return TestBed.runInInjectionContext(() => authGuard(route, state));
  }

  it('allows navigation immediately when already authenticated', () => {
    auth.isAuthenticated.mockReturnValue(true);

    const result = run(buildRoute(), buildState('/'));

    expect(result).toBe(true);
    expect(auth.userAuth).not.toHaveBeenCalled();
  });

  it('redirects to login when no token is available', () => {
    const result = run(buildRoute(), buildState('/'));

    expect(result).toBe(false);
    expect(auth.redirectToLogin).toHaveBeenCalledTimes(1);
    expect(auth.userAuth).not.toHaveBeenCalled();
  });

  it('authenticates a token from the URL, opens the session and cleans the query string', (done) => {
    const user = buildUser();
    auth.userAuth.mockReturnValue(of(user));
    auth.loadMenu.mockReturnValue(of([]));

    const result = run(
      buildRoute({ IdToken: 'url-token', nombreusuario: 'andres' }),
      buildState('/facturas-pendientes?IdToken=url-token&nombreusuario=andres')
    ) as Observable<UrlTree>;

    result.subscribe((tree) => {
      expect(auth.userAuth).toHaveBeenCalledWith('url-token');
      expect(auth.setSession).toHaveBeenCalledWith(user, 'url-token', 'andres');
      expect(auth.loadMenu).toHaveBeenCalledTimes(1);
      expect(parseUrl).toHaveBeenCalledWith('/facturas-pendientes');
      expect(tree).toEqual({ url: '/facturas-pendientes' });
      done();
    });
  });

  it('falls back to the persisted token/userName when absent from the URL', (done) => {
    const user = buildUser();
    auth.token.mockReturnValue('stored-token');
    auth.userName.mockReturnValue('stored-user');
    auth.userAuth.mockReturnValue(of(user));
    auth.loadMenu.mockReturnValue(of([]));

    const result = run(buildRoute(), buildState('/')) as Observable<UrlTree>;

    result.subscribe(() => {
      expect(auth.userAuth).toHaveBeenCalledWith('stored-token');
      expect(auth.setSession).toHaveBeenCalledWith(user, 'stored-token', 'stored-user');
      done();
    });
  });

  it('redirects to login when the authenticated user has no Usuario', (done) => {
    auth.userAuth.mockReturnValue(of(buildUser({ Usuario: '' })));

    const result = run(
      buildRoute({ IdToken: 'tok' }),
      buildState('/facturas-pendientes')
    ) as Observable<boolean>;

    result.subscribe((value) => {
      expect(value).toBe(false);
      expect(auth.redirectToLogin).toHaveBeenCalledTimes(1);
      expect(auth.setSession).not.toHaveBeenCalled();
      expect(auth.loadMenu).not.toHaveBeenCalled();
      done();
    });
  });

  it('still enters the dashboard when loadMenu fails (best-effort menu)', (done) => {
    auth.userAuth.mockReturnValue(of(buildUser()));
    auth.loadMenu.mockReturnValue(throwError(() => new Error('menu down')));

    const result = run(
      buildRoute({ IdToken: 'tok' }),
      buildState('/facturas-pendientes?IdToken=tok')
    ) as Observable<UrlTree>;

    result.subscribe((tree) => {
      expect(tree).toEqual({ url: '/facturas-pendientes' });
      expect(auth.setSession).toHaveBeenCalledTimes(1);
      expect(auth.redirectToLogin).not.toHaveBeenCalled();
      done();
    });
  });

  it('redirects to login when the authentication call throws', (done) => {
    auth.userAuth.mockReturnValue(throwError(() => new Error('invalid')));

    const result = run(
      buildRoute({ IdToken: 'bad' }),
      buildState('/facturas-pendientes')
    ) as Observable<boolean>;

    result.subscribe((value) => {
      expect(value).toBe(false);
      expect(auth.redirectToLogin).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
