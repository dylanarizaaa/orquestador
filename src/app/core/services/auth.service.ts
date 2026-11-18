import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserAuthResponse } from '../models/auth.model';
import { RoleMenu } from '../models/menu.model';
import { buildSearchParams } from '../utils/build-search-params';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private static readonly TOKEN_KEY = 'pf.token';
  private static readonly USER_NAME_KEY = 'pf.userName';

  private readonly _user = signal<UserAuthResponse | null>(null);
  // Se hidratan desde localStorage para sobrevivir recargas de página.
  private readonly _token = signal<string>(this.readStored(AuthService.TOKEN_KEY));
  private readonly _userName = signal<string>(this.readStored(AuthService.USER_NAME_KEY));
  private readonly _roleMenu = signal<RoleMenu[]>([]);

  /** Usuario autenticado en la sesión actual (null si no se ha validado). */
  readonly user = this._user.asReadonly();
  /** Token persistido de la sesión actual (cadena vacía si no hay sesión). */
  readonly token = this._token.asReadonly();
  /** Nombre de usuario persistido de la sesión actual. */
  readonly userName = this._userName.asReadonly();
  /** Menú/permisos del rol actual. */
  readonly roleMenu = this._roleMenu.asReadonly();
  /** Conjunto de rutas (normalizadas) a las que el rol tiene acceso. */
  readonly allowedRoutes = computed(
    () => new Set(this._roleMenu().map((m) => this.normalizePath(m.MENUrl)).filter((p) => p.length > 0))
  );
  readonly isAuthenticated = computed(() => this._user() !== null);

  userAuth(token: string): Observable<UserAuthResponse> {
    return this.http.post<UserAuthResponse>(`${environment.secureUrl}/seguridad/usuario/autenticacionusuarioaplicacion`, null, {
      headers: {
        'x-api-login-token': token
      },
      withCredentials: true
    })
  }

  /** Obtiene el menú lateral según el rol asociado al token. */
  menuByRole(idToken: string): Observable<RoleMenu[]> {
    const params = buildSearchParams({ idToken }).toString();
    const url = `${environment.authUrl}/Applications/getMenuPorRol?${params}`;
    return this.http.get<RoleMenu[]>(url);
  }

  /** Carga el menú del rol y lo guarda en estado (fuente del sidebar y de los permisos). */
  loadMenu(): Observable<RoleMenu[]> {
    return this.menuByRole(this._token()).pipe(
      tap((menu) => this._roleMenu.set(menu ?? []))
    );
  }

  /** Indica si el rol actual puede acceder a la ruta indicada. La raíz siempre es accesible. */
  canAccess(path: string): boolean {
    const normalized = this.normalizePath(path);
    if (!normalized) return true;
    return this.allowedRoutes().has(normalized);
  }

  private normalizePath(url: string): string {
    return (url ?? '').trim().replace(/^\/+|\/+$/g, '');
  }

  /** Guarda el usuario, el token y el nombre de usuario tras una validación exitosa. */
  setSession(user: UserAuthResponse, token: string, userName: string): void {
    this._user.set(user);
    this._token.set(token);
    this._userName.set(userName);
    this.writeStored(AuthService.TOKEN_KEY, token);
    this.writeStored(AuthService.USER_NAME_KEY, userName);
  }

  /** Limpia la sesión en memoria y en localStorage. */
  clearSession(): void {
    this._user.set(null);
    this._token.set('');
    this._userName.set('');
    this._roleMenu.set([]);
    this.removeStored(AuthService.TOKEN_KEY);
    this.removeStored(AuthService.USER_NAME_KEY);
  }

  /** Redirige al sitio de login externo cuando el token es inválido o falta. */
  redirectToLogin(): void {
    this.clearSession();
    window.location.href = environment.sitioLoginUrl;
  }

  private readStored(key: string): string {
    try {
      return localStorage.getItem(key) ?? '';
    } catch {
      return '';
    }
  }

  private writeStored(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage no disponible (modo privado / SSR): se ignora.
    }
  }

  private removeStored(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage no disponible: se ignora.
    }
  }
}
