import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Valida el `IdToken` que llega por query string al cargar el portal.
 * Si es válido permite entrar (y limpia el token de la URL); si no, redirige al login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Acceso inmediato si ya está autenticado en la sesión actual
  if (auth.isAuthenticated()) {
    return true;
  }

  // 2. Extraer parámetros priorizando la URL, con fallback al estado persistido
  const urlToken = route.queryParamMap.get('IdToken');
  const urlUserName = route.queryParamMap.get('nombreusuario');

  const token = urlToken ?? auth.token();
  const userName = urlUserName ?? auth.userName();

  // 3. Early Exit: Si no existe token por ninguna vía, bloquear acceso.
  if (!token) {
    auth.redirectToLogin();
    return false;
  }

  // 4. Validar el token y armar la sesión (una sola vez)
  return auth.userAuth(token).pipe(
    switchMap((user) => {
      if (!user?.Usuario) {
        auth.redirectToLogin();
        return of(false);
      }

      auth.setSession(user, token, userName);

      return auth.loadMenu().pipe(
        map(() => handleSuccess(urlToken, router, state)),
        catchError(() => of(handleSuccess(urlToken, router, state)))
      );
    }),
    catchError(() => {
      auth.redirectToLogin();
      return of(false);
    })
  );
};

/**
 * Helper: Determina qué debe devolver el Guard si la autenticación es exitosa.
 * Retorna un `UrlTree` para limpiar la URL solo si había un token en los Query Params,
 * de lo contrario retorna `true` para continuar la navegación normalmente sin recargar.
 */
function handleSuccess(urlToken: string | null, router: Router, state: RouterStateSnapshot): boolean | UrlTree {
  if (urlToken) {
    return router.parseUrl(state.url.split('?')[0]);
  }

  return true;
}