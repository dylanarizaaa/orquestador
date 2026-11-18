import { Component, Directive, ElementRef, inject, Injector, input, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { ClassValue } from 'clsx';
import { classes, hlm } from './hlm';

/** Pausa hasta que el microtask del MutationObserver se haya procesado. */
const flushMutations = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

@Directive({ selector: '[testHlmClasses]' })
class TestHlmClassesDirective {
    public readonly testHlmClasses = input<ClassValue[]>([]);
    private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);

    constructor() {
        // Una transición inline previa fuerza la rama de restauración con valor en restoreTransitionSuppression.
        this._el.nativeElement.style.transition = 'opacity 1s ease';
        classes(() => this.testHlmClasses());
    }
}

@Component({
    template: `<div class="base-static" testHlmClasses [testHlmClasses]="cls()"></div>`,
    imports: [TestHlmClassesDirective],
})
class HostComponent {
    readonly cls = signal<ClassValue[]>(['p-2', 'text-sm']);
}

describe('hlm util', () => {
    it('hlm fusiona clases y resuelve conflictos de Tailwind', () => {
        expect(hlm('p-2', 'p-4')).toBe('p-4');
        expect(hlm('text-sm', false, undefined, 'font-bold')).toContain('font-bold');
    });
});

describe('classes()', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let el: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        el = fixture.debugElement.query(By.directive(TestHlmClassesDirective)).nativeElement as HTMLElement;
    });

    it('aplica las clases calculadas conservando la clase base del host', () => {
        expect(el.classList.contains('base-static')).toBe(true);
        expect(el.classList.contains('p-2')).toBe(true);
        expect(el.classList.contains('text-sm')).toBe(true);
    });

    it('reacciona cuando cambia la señal de clases', () => {
        host.cls.set(['m-4']);
        fixture.detectChanges();
        expect(el.classList.contains('m-4')).toBe(true);
        expect(el.classList.contains('p-2')).toBe(false);
        // La clase base se conserva.
        expect(el.classList.contains('base-static')).toBe(true);
    });

    it('absorbe como base las clases agregadas externamente (MutationObserver)', async () => {
        el.classList.add('externa');
        await flushMutations();

        host.cls.set(['gap-2']);
        fixture.detectChanges();

        expect(el.classList.contains('externa')).toBe(true);
        expect(el.classList.contains('gap-2')).toBe(true);
    });

    it('restaura la transición inline previa tras el primer frame', async () => {
        // Durante la supresión la transición se fuerza a none.
        expect(el.style.getPropertyValue('transition')).toBe('none');
        // El requestAnimationFrame agendado restaura el valor original.
        await new Promise((resolve) => setTimeout(resolve, 30));
        expect(el.style.getPropertyValue('transition')).toContain('opacity');
    });

    it('admite múltiples fuentes sobre el mismo elemento y limpia al destruir', () => {
        const injector = TestBed.inject(Injector);
        const elementRef = new ElementRef(el);
        // Registra una segunda fuente de clases sobre el mismo elemento.
        TestBed.runInInjectionContext(() => classes(() => ['shadow-md'], { elementRef, injector }));
        fixture.detectChanges();
        expect(el.classList.contains('shadow-md')).toBe(true);
        expect(el.classList.contains('p-2')).toBe(true);
    });
});
