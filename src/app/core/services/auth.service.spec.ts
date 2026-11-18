import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { UserAuthResponse } from '../models/auth.model';
import { RoleMenu } from '../models/menu.model';
import { AuthService } from './auth.service';

const TOKEN_KEY = 'pf.token';
const USER_NAME_KEY = 'pf.userName';

function makeMenu(partial: Partial<RoleMenu>): RoleMenu {
  return {
    ROLNombre: 'Admin',
    MENIdMenu: 1,
    MENNombre: 'Item',
    MENIdMenuPadre: 0,
    ACCNombre: 'Ver',
    MENUrl: '/ruta',
    MENIcono: '',
    ...partial,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('is created with empty default state', () => {
    expect(service).toBeTruthy();
    expect(service.user()).toBeNull();
    expect(service.token()).toBe('');
    expect(service.userName()).toBe('');
    expect(service.roleMenu()).toEqual([]);
    expect(service.isAuthenticated()).toBe(false);
  });

  describe('userAuth', () => {
    it('POSTs the user authentication request to the secure endpoint', () => {
      const response: UserAuthResponse = { NombreUsuario: 'andres', Usuario: 'andres', NombreRol: 'Admin', NombreAplicacion: 'App' };

      service.userAuth('the-token').subscribe((res) => {
        expect(res).toEqual(response);
      });

      const req = httpMock.expectOne(`${environment.secureUrl}/seguridad/usuario/autenticacionusuarioaplicacion`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('x-api-login-token')).toBe('the-token');
      req.flush(response);
    });
  });

  describe('menuByRole', () => {
    it('GETs the menu using the token as query param', () => {
      const menu = [makeMenu({})];

      service.menuByRole('tok-123').subscribe((res) => {
        expect(res).toEqual(menu);
      });

      const req = httpMock.expectOne(
        `${environment.authUrl}/Applications/getMenuPorRol?idToken=tok-123`
      );
      expect(req.request.method).toBe('GET');
      req.flush(menu);
    });
  });

  describe('loadMenu', () => {
    it('stores the fetched menu into state', () => {
      const user: UserAuthResponse = { NombreUsuario: 'andres', Usuario: 'andres', NombreRol: 'Admin', NombreAplicacion: 'App' };
      service.setSession(user, 'session-token', 'andres');
      const menu = [makeMenu({ MENUrl: '/facturas-pendientes' })];

      service.loadMenu().subscribe();

      const req = httpMock.expectOne(
        `${environment.authUrl}/Applications/getMenuPorRol?idToken=session-token`
      );
      req.flush(menu);

      expect(service.roleMenu()).toEqual(menu);
    });

    it('falls back to an empty array when the response is null', () => {
      // No session token yet, so buildSearchParams omits the empty idToken.
      service.loadMenu().subscribe();

      const req = httpMock.expectOne(
        `${environment.authUrl}/Applications/getMenuPorRol?`
      );
      req.flush(null);

      expect(service.roleMenu()).toEqual([]);
    });
  });

  describe('allowedRoutes & canAccess', () => {
    it('normalizes menu urls and exposes them as a set', () => {
      const user: UserAuthResponse = { NombreUsuario: 'andres', Usuario: 'andres', NombreRol: 'Admin', NombreAplicacion: 'App' };
      service.setSession(user, 'tok', 'a');
      service.loadMenu().subscribe();
      httpMock
        .expectOne(`${environment.authUrl}/Applications/getMenuPorRol?idToken=tok`)
        .flush([
          makeMenu({ MENUrl: '/facturas-pendientes/' }),
          makeMenu({ MENUrl: 'notas' }),
          makeMenu({ MENUrl: '   ' }),
          makeMenu({ MENUrl: null as unknown as string }),
        ]);

      expect(service.allowedRoutes()).toEqual(new Set(['facturas-pendientes', 'notas']));
    });

    it('always allows the empty/root path', () => {
      expect(service.canAccess('')).toBe(true);
      expect(service.canAccess('/')).toBe(true);
    });

    it('allows a path present in the menu (ignoring slashes)', () => {
      const user: UserAuthResponse = { NombreUsuario: 'andres', Usuario: 'andres', NombreRol: 'Admin', NombreAplicacion: 'App' };
      service.setSession(user, 'tok', 'a');
      service.loadMenu().subscribe();
      httpMock
        .expectOne(`${environment.authUrl}/Applications/getMenuPorRol?idToken=tok`)
        .flush([makeMenu({ MENUrl: '/facturas-pendientes' })]);

      expect(service.canAccess('facturas-pendientes')).toBe(true);
      expect(service.canAccess('/facturas-pendientes/')).toBe(true);
    });

    it('denies a path not present in the menu', () => {
      expect(service.canAccess('ventas-descuento')).toBe(false);
    });
  });

  describe('setSession', () => {
    it('updates state and persists token and userName', () => {
      const user: UserAuthResponse = { NombreUsuario: 'andres', Usuario: 'andres', NombreRol: 'Admin', NombreAplicacion: 'App' };
      service.setSession(user, 'tok-xyz', 'andres');

      expect(service.user()).toEqual(user);
      expect(service.token()).toBe('tok-xyz');
      expect(service.userName()).toBe('andres');
      expect(service.isAuthenticated()).toBe(true);
      expect(localStorage.getItem(TOKEN_KEY)).toBe('tok-xyz');
      expect(localStorage.getItem(USER_NAME_KEY)).toBe('andres');
    });
  });

  describe('clearSession', () => {
    it('resets state and removes persisted values', () => {
      const user: UserAuthResponse = { NombreUsuario: 'andres', Usuario: 'andres', NombreRol: 'Admin', NombreAplicacion: 'App' };
      service.setSession(user, 'tok', 'andres');
      service.loadMenu().subscribe();
      httpMock
        .expectOne(`${environment.authUrl}/Applications/getMenuPorRol?idToken=tok`)
        .flush([makeMenu({})]);

      service.clearSession();

      expect(service.user()).toBeNull();
      expect(service.token()).toBe('');
      expect(service.userName()).toBe('');
      expect(service.roleMenu()).toEqual([]);
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(USER_NAME_KEY)).toBeNull();
    });
  });

  describe('redirectToLogin', () => {
    it('clears the session and triggers a navigation to the external login site', () => {
      // jsdom marks window.location (and href) non-configurable, so the real
      // setter runs and only logs a "navigation not implemented" notice — which
      // we swallow. We assert the session is cleared and the call does not throw.
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const user: UserAuthResponse = { NombreUsuario: 'andres', Usuario: 'andres', NombreRol: 'Admin', NombreAplicacion: 'App' };
      service.setSession(user, 'tok', 'andres');

      expect(() => service.redirectToLogin()).not.toThrow();

      expect(service.user()).toBeNull();
      expect(service.token()).toBe('');
      expect(service.userName()).toBe('');
      errorSpy.mockRestore();
    });
  });

  describe('localStorage hydration & resilience', () => {
    it('hydrates token and userName from localStorage on construction', () => {
      localStorage.setItem(TOKEN_KEY, 'persisted-token');
      localStorage.setItem(USER_NAME_KEY, 'persisted-user');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });
      const fresh = TestBed.inject(AuthService);

      expect(fresh.token()).toBe('persisted-token');
      expect(fresh.userName()).toBe('persisted-user');
    });

    it('survives a throwing localStorage (private mode / SSR)', () => {
      const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      const removeItem = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('blocked');
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });
      const fresh = TestBed.inject(AuthService);

      expect(fresh.token()).toBe('');
      const user: UserAuthResponse = { NombreUsuario: 'andres', Usuario: 'andres', NombreRol: 'Admin', NombreAplicacion: 'App' };
      expect(() => fresh.setSession(user, 'tok', 'andres')).not.toThrow();
      expect(() => fresh.clearSession()).not.toThrow();

      getItem.mockRestore();
      setItem.mockRestore();
      removeItem.mockRestore();
    });
  });
});
