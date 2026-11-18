import { inject } from '@angular/core';
import { RemoteLoaderService } from '../services/remote-loader.service';

/**
 * Carga la hoja de estilos de un micro front al entrar a su ruta.
 *
 * - Se llama desde `loadChildren` (contexto de inyección): `inject` se usa antes de cualquier `await`.
 * - La promesa se resuelve cuando la hoja terminó de cargar, así la pantalla no aparece sin estilos.
 * - Si la hoja falla, se registra el error y la pantalla carga igual (sin bloquear la navegación);
 *   al volver a entrar a la ruta se intenta de nuevo.
 * - Cada micro front encapsula su CSS en su propio ámbito (p. ej. `.mf-reportes`), así cargarla
 *   no cambia los estilos del portal.
 */
export function loadRemoteStyles(remoteName: string, href: string | undefined): Promise<void> {
  if (!href) {
    return Promise.resolve();
  }
  const loader = inject(RemoteLoaderService);
  return loader
    .loadResource({
      id: `mf-styles-${remoteName}`,
      tag: 'link',
      attributes: { rel: 'stylesheet', href },
    })
    .catch((error: unknown) => {
      console.error(`[RemoteStyles] No se cargaron los estilos de "${remoteName}".`, error);
    });
}
