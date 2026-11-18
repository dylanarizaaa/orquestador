import { TestBed } from '@angular/core/testing';
import {
    BrnDateAdapterToken,
    injectDateAdapter,
    provideDateAdapter,
    provideNativeDateAdapter,
    provideUtcDateAdapter,
} from './date-adapter';
import { BrnNativeDateAdapter } from './native-date-adapter';
import { BrnUtcDateAdapter } from './utc-date-adapter';

describe('date-adapter (proveedores e inyección)', () => {
    it('provideDateAdapter() crea un ClassProvider con el token y la clase indicada', () => {
        const provider = provideDateAdapter(BrnUtcDateAdapter);
        expect(provider.provide).toBe(BrnDateAdapterToken);
        expect(provider.useClass).toBe(BrnUtcDateAdapter);
    });

    it('provideNativeDateAdapter() registra BrnNativeDateAdapter', () => {
        const provider = provideNativeDateAdapter();
        expect(provider.provide).toBe(BrnDateAdapterToken);
        expect(provider.useClass).toBe(BrnNativeDateAdapter);
    });

    it('provideUtcDateAdapter() registra BrnUtcDateAdapter', () => {
        const provider = provideUtcDateAdapter();
        expect(provider.useClass).toBe(BrnUtcDateAdapter);
    });

    it('injectDateAdapter() devuelve el adaptador nativo por defecto cuando no hay proveedor', () => {
        TestBed.configureTestingModule({});
        const adapter = TestBed.runInInjectionContext(() => injectDateAdapter());
        expect(adapter).toBeInstanceOf(BrnNativeDateAdapter);
    });

    it('injectDateAdapter() devuelve el adaptador registrado en el contexto', () => {
        TestBed.configureTestingModule({ providers: [provideUtcDateAdapter()] });
        const adapter = TestBed.runInInjectionContext(() => injectDateAdapter());
        expect(adapter).toBeInstanceOf(BrnUtcDateAdapter);
    });
});
