import { Component, ElementRef, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectElementSize } from './inject-element-size';

@Component({ template: `<div #box style="width:100px;height:50px"></div>` })
class HostComponent {
    readonly box = signal<ElementRef<HTMLElement> | undefined>(undefined);
    readonly size = injectElementSize({ elementRef: new ElementRef(document.createElement('div')) });
}

describe('injectElementSize', () => {
    it('en navegador mide el elemento tras el render', async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(typeof fixture.componentInstance.size).toBe('function');
        fixture.destroy();
    });

    it('en plataforma servidor devuelve una señal sin medición (undefined)', () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: PLATFORM_ID, useValue: 'server' },
                { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
            ],
        });

        const size = TestBed.runInInjectionContext(() => injectElementSize());
        expect(size()).toBeUndefined();
    });

    it('acepta un elementRef explícito en las opciones', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
        });

        const ref = new ElementRef(document.createElement('span'));
        const size = TestBed.runInInjectionContext(() => injectElementSize({ elementRef: ref }));
        expect(size()).toBeUndefined();
    });

    it('observa cambios de tamaño con ResizeObserver en el navegador', async () => {
        const element = document.createElement('div');
        Object.defineProperty(element, 'offsetWidth', { value: 100, configurable: true });
        Object.defineProperty(element, 'offsetHeight', { value: 50, configurable: true });
        element.getBoundingClientRect = () => ({ width: 100, height: 50 } as DOMRect);

        const callbacks: ResizeObserverCallback[] = [];
        const OriginalResizeObserver = globalThis.ResizeObserver;
        globalThis.ResizeObserver = class {
            constructor(cb: ResizeObserverCallback) {
                callbacks.push(cb);
            }
            observe(): void {}
            unobserve(): void {}
            disconnect(): void {}
        } as unknown as typeof ResizeObserver;

        TestBed.configureTestingModule({ imports: [HostComponent] });
        const fixture = TestBed.createComponent(HostComponent);
        const ref = new ElementRef(element);
        const size = TestBed.runInInjectionContext(() => injectElementSize({ elementRef: ref }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(size()).toEqual({ width: 100, height: 50 });

        const entry = {
            target: element,
            borderBoxSize: [{ inlineSize: 200, blockSize: 80 }],
        } as unknown as ResizeObserverEntry;
        callbacks.at(-1)?.([entry], {} as ResizeObserver);

        expect(size()).toEqual({ width: 200, height: 80 });

        const entryLegacy = { target: element } as ResizeObserverEntry;
        Object.defineProperty(element, 'offsetWidth', { value: 150, configurable: true });
        Object.defineProperty(element, 'offsetHeight', { value: 60, configurable: true });
        callbacks.at(-1)?.([entryLegacy], {} as ResizeObserver);
        expect(size()).toEqual({ width: 150, height: 60 });

        fixture.destroy();
        globalThis.ResizeObserver = OriginalResizeObserver;
    });
});
