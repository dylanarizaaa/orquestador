import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createInjectionToken } from './create-injection-token';

describe('createInjectionToken', () => {
    it('devuelve la tupla [injectFn, provideFn, provideExistingFn, token]', () => {
        const [injectFn, provideFn, provideExistingFn, token] = createInjectionToken<number>('TEST');
        expect(typeof injectFn).toBe('function');
        expect(typeof provideFn).toBe('function');
        expect(typeof provideExistingFn).toBe('function');
        expect(token).toBeInstanceOf(InjectionToken);
    });

    it('provideFn crea un proveedor useValue', () => {
        const [, provideFn, , token] = createInjectionToken<number>('TEST');
        expect(provideFn(42)).toEqual({ provide: token, useValue: 42 });
    });

    it('provideExistingFn crea un proveedor useExisting con forwardRef', () => {
        const [, , provideExistingFn, token] = createInjectionToken<string>('TEST');
        const provider = provideExistingFn(() => 'x' as unknown as never) as {
            provide: unknown;
            useExisting: unknown;
        };
        expect(provider.provide).toBe(token);
        expect(typeof provider.useExisting).toBe('function'); // forwardRef devuelve una función
    });

    it('injectFn resuelve el valor provisto en el contexto de inyección', () => {
        const [injectFn, provideFn] = createInjectionToken<number>('TEST');
        TestBed.configureTestingModule({ providers: [provideFn(99)] });
        const value = TestBed.runInInjectionContext(() => injectFn());
        expect(value).toBe(99);
    });

    it('injectFn con optional devuelve null cuando no hay proveedor', () => {
        const [injectFn] = createInjectionToken<number>('UNPROVIDED');
        TestBed.configureTestingModule({});
        const value = TestBed.runInInjectionContext(() => injectFn({ optional: true }));
        expect(value).toBeNull();
    });
});
