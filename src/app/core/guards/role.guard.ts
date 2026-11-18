import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Bloquea las rutas que el rol actual no tiene en su menú (`MENUrl`).
 * Si no tiene permiso, lo devuelve al dashboard. Asume que el menú ya fue
 * cargado por el `authGuard` de la ruta padre.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const path = route.routeConfig?.path ?? '';
  return auth.canAccess(path) ? true : router.parseUrl('/');
};
