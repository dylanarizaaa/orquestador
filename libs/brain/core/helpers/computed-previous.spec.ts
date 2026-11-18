import { signal } from '@angular/core';
import { computedPrevious } from './computed-previous';

describe('computedPrevious', () => {
    it('el valor previo inicial coincide con el valor actual', () => {
        const value = signal(0);
        const previous = computedPrevious(value);
        expect(previous()).toBe(0);
    });

    it('emite el valor anterior tras cada cambio de la fuente', () => {
        const value = signal(0);
        const previous = computedPrevious(value);

        expect(previous()).toBe(0);

        value.set(1);
        expect(previous()).toBe(0);

        value.set(2);
        expect(previous()).toBe(1);
    });
});
