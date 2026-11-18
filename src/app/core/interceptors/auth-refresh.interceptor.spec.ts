import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { UserAuthResponse } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { authRefreshInterceptor } from './auth-refresh.interceptor';

const AUTH_URL = `${environment.secureUrl}/seguridad/usuario/autenticacionusuarioaplicacion`;
const DATA_URL = `${environment.secureUrl}/facturas/pendientes`;

const USER: UserAuthResponse = {
  NombreUsuario: 'andres',
  Usuario: 'andres',
  NombreRol: 'Admin',
  NombreAplicacion: 'PortalFinanciero',
};

function unauthorized() {
  return { status: 401, statusText: 'Unauthorized' };
}

describe('authRefreshInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;
  let redirectSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authRefreshInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    redirectSpy = jest.spyOn(auth, 'redirectToLogin').mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    redirectSpy.mockRestore();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('deja pasar las respuestas exitosas sin re-autenticar', () => {
    auth.setSession(USER, 'tok', 'andres');
    let result: unknown;

    http.get(DATA_URL).subscribe((res) => (result = res));
    httpMock.expectOne(DATA_URL).flush({ ok: true });

    expect(result).toEqual({ ok: true });
    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it('re-autentica con el token guardado y relanza la petición original ante un 401', () => {
    auth.setSession(USER, 'tok-abc', 'andres');
    let result: unknown;

    http.get(DATA_URL).subscribe((res) => (result = res));
    httpMock.expectOne(DATA_URL).flush(null, unauthorized());

    const authReq = httpMock.expectOne(AUTH_URL);
    expect(authReq.request.method).toBe('POST');
    expect(authReq.request.headers.get('x-api-login-token')).toBe('tok-abc');
    expect(authReq.request.withCredentials).toBe(true);
    authReq.flush(USER);

    httpMock.expectOne(DATA_URL).flush({ ok: true });

    expect(result).toEqual({ ok: true });
    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it('conserva método, cuerpo y cabeceras al relanzar la petición', () => {
    auth.setSession(USER, 'tok', 'andres');

    http.post(DATA_URL, { id: 7 }, { headers: { 'X-Origen': 'portal' } }).subscribe();
    httpMock.expectOne(DATA_URL).flush(null, unauthorized());
    httpMock.expectOne(AUTH_URL).flush(USER);

    const retried = httpMock.expectOne(DATA_URL);
    expect(retried.request.method).toBe('POST');
    expect(retried.request.body).toEqual({ id: 7 });
    expect(retried.request.headers.get('X-Origen')).toBe('portal');
    retried.flush({});
  });

  it('propaga los errores distintos de 401 sin re-autenticar', () => {
    auth.setSession(USER, 'tok', 'andres');
    let status: number | undefined;

    http.get(DATA_URL).subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });
    httpMock.expectOne(DATA_URL).flush(null, { status: 500, statusText: 'Server Error' });

    expect(status).toBe(500);
    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it('no reintenta cuando el 401 proviene del propio endpoint de autenticación', () => {
    auth.setSession(USER, 'tok', 'andres');
    let status: number | undefined;

    auth.userAuth('tok').subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });
    httpMock.expectOne(AUTH_URL).flush(null, unauthorized());

    expect(status).toBe(401);
    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it('redirige al login cuando no hay token almacenado para re-autenticar', () => {
    let error: unknown;

    http.get(DATA_URL).subscribe({ error: (e: unknown) => (error = e) });
    httpMock.expectOne(DATA_URL).flush(null, unauthorized());

    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(Error);
  });

  it('redirige al login cuando la re-autenticación falla', () => {
    auth.setSession(USER, 'tok', 'andres');
    let status: number | undefined;

    http.get(DATA_URL).subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });
    httpMock.expectOne(DATA_URL).flush(null, unauthorized());
    httpMock.expectOne(AUTH_URL).flush(null, unauthorized());

    expect(status).toBe(401);
    expect(redirectSpy).toHaveBeenCalledTimes(1);
  });

  it('redirige al login cuando la re-autenticación responde sin usuario válido', () => {
    auth.setSession(USER, 'tok', 'andres');
    let error: unknown;

    http.get(DATA_URL).subscribe({ error: (e: unknown) => (error = e) });
    httpMock.expectOne(DATA_URL).flush(null, unauthorized());
    httpMock.expectOne(AUTH_URL).flush({ Usuario: '' });

    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(Error);
  });

  it('redirige al login si el reintento vuelve a responder 401, sin volver a reintentar', () => {
    auth.setSession(USER, 'tok', 'andres');
    let status: number | undefined;

    http.get(DATA_URL).subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });
    httpMock.expectOne(DATA_URL).flush(null, unauthorized());
    httpMock.expectOne(AUTH_URL).flush(USER);
    httpMock.expectOne(DATA_URL).flush(null, unauthorized());

    expect(status).toBe(401);
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    // El contexto marca la petición como reintentada: no hay tercera llamada.
    httpMock.verify();
  });

  it('no redirige si el reintento falla por un error distinto de 401', () => {
    auth.setSession(USER, 'tok', 'andres');
    let status: number | undefined;

    http.get(DATA_URL).subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });
    httpMock.expectOne(DATA_URL).flush(null, unauthorized());
    httpMock.expectOne(AUTH_URL).flush(USER);
    httpMock.expectOne(DATA_URL).flush(null, { status: 500, statusText: 'Server Error' });

    expect(status).toBe(500);
    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it('comparte una sola re-autenticación entre varios 401 simultáneos', () => {
    auth.setSession(USER, 'tok', 'andres');
    const results: unknown[] = [];

    http.get(`${DATA_URL}/a`).subscribe((res) => results.push(res));
    http.get(`${DATA_URL}/b`).subscribe((res) => results.push(res));

    httpMock.expectOne(`${DATA_URL}/a`).flush(null, unauthorized());
    httpMock.expectOne(`${DATA_URL}/b`).flush(null, unauthorized());

    const authReqs = httpMock.match(AUTH_URL);
    expect(authReqs.length).toBe(1);
    authReqs[0].flush(USER);

    httpMock.expectOne(`${DATA_URL}/a`).flush({ id: 'a' });
    httpMock.expectOne(`${DATA_URL}/b`).flush({ id: 'b' });

    expect(results).toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('vuelve a re-autenticar en un 401 posterior a una re-autenticación ya completada', () => {
    auth.setSession(USER, 'tok', 'andres');

    http.get(DATA_URL).subscribe();
    httpMock.expectOne(DATA_URL).flush(null, unauthorized());
    httpMock.expectOne(AUTH_URL).flush(USER);
    httpMock.expectOne(DATA_URL).flush({});

    http.get(DATA_URL).subscribe();
    httpMock.expectOne(DATA_URL).flush(null, unauthorized());
    httpMock.expectOne(AUTH_URL).flush(USER);
    httpMock.expectOne(DATA_URL).flush({});

    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it('actualiza el usuario en sesión tras una re-autenticación exitosa', () => {
    auth.setSession(USER, 'tok', 'andres');
    const renovado: UserAuthResponse = { ...USER, NombreRol: 'Auditor' };

    http.get(DATA_URL).subscribe();
    httpMock.expectOne(DATA_URL).flush(null, unauthorized());
    httpMock.expectOne(AUTH_URL).flush(renovado);
    httpMock.expectOne(DATA_URL).flush({});

    expect(auth.user()).toEqual(renovado);
    expect(auth.token()).toBe('tok');
    expect(auth.userName()).toBe('andres');
  });
});
