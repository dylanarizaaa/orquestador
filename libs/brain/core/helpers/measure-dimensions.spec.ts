import { measureDimensions } from './measure-dimensions';

describe('measureDimensions', () => {
    it('devuelve un ancho y alto numéricos', () => {
        const el = document.createElement('div');
        const result = measureDimensions(el, 'flex');
        expect(result).toEqual({ width: expect.any(Number), height: expect.any(Number) });
    });

    it('restaura display, height y hidden previos cuando el elemento estaba oculto', () => {
        const el = document.createElement('div');
        el.style.display = 'none';
        el.style.height = '10px';
        el.hidden = true;

        measureDimensions(el, 'flex');

        expect(el.style.display).toBe('none');
        expect(el.style.height).toBe('10px');
        expect(el.hidden).toBe(true);
    });

    it('conserva el display previo cuando el elemento ya es visible', () => {
        const el = document.createElement('div');
        el.style.display = 'block';

        measureDimensions(el, 'grid');

        expect(el.style.display).toBe('block');
    });

    it('usa el display de medición cuando el elemento no tiene display definido', () => {
        const el = document.createElement('div');

        measureDimensions(el, 'grid');

        // tras medir, el display vuelve a su valor original (cadena vacía)
        expect(el.style.display).toBe('');
    });
});
