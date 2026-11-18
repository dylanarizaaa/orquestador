import { registerLocaleData } from '@angular/common';

import { localeEs, registerSpanishLocale } from './locale.config';

jest.mock('@angular/common', () => ({
  registerLocaleData: jest.fn(),
}));

describe('locale.config', () => {
  describe('registerSpanishLocale', () => {
    it('registers the Spanish locale data with Angular', () => {
      registerSpanishLocale();

      expect(registerLocaleData).toHaveBeenCalledWith(localeEs);
    });

    it('describes the "es" locale', () => {
      expect(localeEs[0]).toBe('es');
      expect(localeEs).toContain('EUR');
    });
  });

  describe('plural rule', () => {
    // La regla plural es el último elemento del arreglo de datos del locale.
    const plural = localeEs[localeEs.length - 1] as (val: number) => number;

    it('returns category 1 ("one") for the value 1', () => {
      expect(plural(1)).toBe(1);
    });

    it('returns category 4 ("many") for large round millions', () => {
      expect(plural(1000000)).toBe(4);
    });

    it('returns category 4 ("many") for values with a large exponent', () => {
      expect(plural(1e21)).toBe(4);
    });

    it('returns category 5 ("other") for ordinary values', () => {
      expect(plural(0)).toBe(5);
      expect(plural(2)).toBe(5);
      expect(plural(1000000.5)).toBe(5);
    });
  });
});
