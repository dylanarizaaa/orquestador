import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, map, shareReplay, switchMap, throwError } from 'rxjs';

import { UserAuthResponse } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

/** Ruta del endpoint de autenticación: nunca se reintenta a sí mismo. */
const AUTH_ENDPOINT = '/seguridad/usuario/autenticacionusuarioaplicacion';

/**
 * Marca una petición como "ya reintentada tras re-autenticar". Vive en el
 * `HttpContext` (no viaja en la red), así que no dispara preflight de CORS.
 */
export const REAUTH_RETRIED = new HttpContextToken<boolean>(() => false);

/**
 * Coordina la re-autenticación: si varias peticiones fallan con 401 a la vez,
 * todas comparten una única llamada a `AuthService.userAuth`.
 */
@Injectable({ providedIn: 'root' })
export class SessionRefreshService {
  private readonly auth = inject(AuthService);

  /** Re-autenticación en curso (null cuando no hay ninguna). */
  private inFlight: Observable<UserAuthResponse> | null = null;

  /**
   * Re-autentica con el token persistido en storage. Falla si no hay token o
   * si el servicio responde sin usuario válido.
   */
  refresh(): Observable<UserAuthResponse> {
    if (this.inFlight) {
      return this.inFlight;
    }

    const token = this.auth.token();
    if (!token) {
      return throwError(() => new Error('No hay token almacenado para re-autenticar la sesión.'));
    }

    const refresh$ = this.auth.userAuth(token).pipe(
      map((user) => {
        if (!user?.Usuario) {
          throw new Error('La re-autenticación devolvió un usuario inválido.');
        }
        // Renueva la cookie de sesión y refresca el usuario en memoria.
        this.auth.setSession(user, token, this.auth.userName());
        return user;
      }),
      finalize(() => {
        this.inFlight = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.inFlight = refresh$;
    return refresh$;
  }
}

/**
 * Ante un 401 (cookie de sesión expirada) vuelve a autenticarse con el token
 * guardado en storage y relanza la petición original. Si la re-autenticación
 * falla —o el reintento vuelve a dar 401— redirige al sitio de login.
 */
export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const refresher = inject(SessionRefreshService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!isUnauthorized(error) || !isRetryable(req)) {
        return throwError(() => error);
      }

      return refresher.refresh().pipe(
        catchError((refreshError: unknown) => {
          auth.redirectToLogin();
          return throwError(() => refreshError);
        }),
        switchMap(() => retry(req, next, auth))
      );
    })
  );
};

/** Relanza la petición original marcándola para no volver a reintentarla. */
function retry(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService
): Observable<HttpEvent<unknown>> {
  const retried = req.clone({ context: req.context.set(REAUTH_RETRIED, true) });

  return next(retried).pipe(
    catchError((retryError: unknown) => {
      // La sesión sigue sin ser válida: no hay nada más que intentar.
      if (isUnauthorized(retryError)) {
        auth.redirectToLogin();
      }
      return throwError(() => retryError);
    })
  );
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 401;
}

/** Evita bucles: ni el propio endpoint de autenticación ni un reintento previo. */
function isRetryable(req: HttpRequest<unknown>): boolean {
  return !req.url.includes(AUTH_ENDPOINT) && !req.context.get(REAUTH_RETRIED);
}
