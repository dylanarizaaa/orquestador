import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { debouncedSignal } from './debounced-signal';

describe('debouncedSignal', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it('devuelve una señal inicializada con el valor actual de la fuente', () => {
        TestBed.runInInjectionContext(() => {
            const source = signal('inicial');
            const debounced = debouncedSignal(source, 100);
            expect(debounced()).toBe('inicial');
        });
    });

    it('expone una señal de solo lectura derivada de la fuente', () => {
        TestBed.runInInjectionContext(() => {
            const source = signal(1);
            const debounced = debouncedSignal(source, 50);
            expect(typeof debounced).toBe('function');
            expect(debounced()).toBe(1);
        });
    });
});
