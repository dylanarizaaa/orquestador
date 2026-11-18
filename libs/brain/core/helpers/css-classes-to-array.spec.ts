import { cssClassesToArray } from './css-classes-to-array';

describe('cssClassesToArray', () => {
    it('divide una cadena con espacios en un arreglo de clases', () => {
        expect(cssClassesToArray('a b  c')).toEqual(['a', 'b', 'c']);
    });

    it('aplana un arreglo de cadenas', () => {
        expect(cssClassesToArray(['a b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('descarta cadenas vacías y espacios redundantes', () => {
        expect(cssClassesToArray('   ')).toEqual([]);
        expect(cssClassesToArray('')).toEqual([]);
    });

    it('usa la clase por defecto cuando el valor es null o undefined', () => {
        expect(cssClassesToArray(null, 'fallback')).toEqual(['fallback']);
        expect(cssClassesToArray(undefined, 'a b')).toEqual(['a', 'b']);
    });

    it('sin clase por defecto, null/undefined producen un arreglo vacío', () => {
        expect(cssClassesToArray(null)).toEqual([]);
        expect(cssClassesToArray(undefined)).toEqual([]);
    });
});
