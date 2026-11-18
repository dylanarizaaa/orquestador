type ParamValue = string | number | boolean | null | undefined;

/**
 * Construye un `URLSearchParams` a partir de un objeto, omitiendo los valores
 * nulos, indefinidos o cadenas vacías.
 */
export function buildSearchParams(params: Record<string, ParamValue>): URLSearchParams {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }

  return search;
}
