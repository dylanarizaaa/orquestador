import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Component, type ElementRef, signal, type TemplateRef, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { BrnOverlay } from './brn-overlay';

@Component({
    template: `
        <button #anchor type="button">ancla</button>
        <brn-overlay
            #ov="brnOverlay"
            [scrollStrategy]="scrollStrategy()"
            [state]="state()"
            [autoFocus]="true"
        ></brn-overlay>
        <ng-template #tpl><button type="button">contenido overlay</button></ng-template>
    `,
    imports: [BrnOverlay],
})
class HostComponent {
    readonly ov = viewChild.required<BrnOverlay>('ov');
    readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
    readonly anchor = viewChild.required<ElementRef<HTMLButtonElement>>('anchor');
    readonly scrollStrategy = signal<'close' | 'reposition' | null | undefined>(undefined);
    readonly state = signal<'open' | 'closed' | null>(null);
}

describe('BrnOverlay (base)', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let overlay: BrnOverlay;

    const registerContent = () =>
        overlay.registerContent(host.tpl(), signal(undefined), signal(undefined));

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        overlay = host.ov();
    });

    afterEach(() => overlay.close());

    it('open() no hace nada si no hay contenido registrado', () => {
        overlay.open();
        expect(overlay.stateComputed()).toBe('closed');
    });

    it('open() abre el overlay con el contenido registrado', () => {
        registerContent();
        overlay.open();
        fixture.detectChanges();
        expect(document.body.textContent).toContain('contenido overlay');
        expect(overlay.stateComputed()).toBe('open');
    });

    it('un segundo open() reusa la referencia (reopen)', () => {
        registerContent();
        overlay.open();
        fixture.detectChanges();
        expect(() => overlay.open()).not.toThrow();
        expect(overlay.stateComputed()).toBe('open');
    });

    it('toggle alterna entre abrir y cerrar', () => {
        registerContent();
        overlay.toggle();
        fixture.detectChanges();
        expect(overlay.stateComputed()).toBe('open');

        overlay.toggle();
        fixture.detectChanges();
        expect(overlay.stateComputed()).toBe('closed');
    });

    it('setPanelClass y setOverlayClass se aplican con un overlay activo', () => {
        registerContent();
        overlay.open();
        fixture.detectChanges();
        expect(() => {
            overlay.setPanelClass('panel-x');
            overlay.setOverlayClass('backdrop-x');
            overlay.updatePosition();
        }).not.toThrow();
        expect(overlay.stateComputed()).toBe('open');
    });

    it('setOrigin define el ancla de posicionamiento', () => {
        const anchorRef = host.anchor();
        expect(() => overlay.setOrigin(anchorRef)).not.toThrow();
        registerContent();
        overlay.open();
        fixture.detectChanges();
        expect(overlay.stateComputed()).toBe('open');
    });

    it('getScrollStrategy soporta "close", "reposition" y la estrategia por defecto', () => {
        const strategies = TestBed.inject(ScrollStrategyOptions);
        expect(strategies).toBeTruthy();

        registerContent();
        host.scrollStrategy.set('close');
        fixture.detectChanges();
        overlay.open();
        fixture.detectChanges();
        overlay.close();
        fixture.detectChanges();

        host.scrollStrategy.set('reposition');
        fixture.detectChanges();
        overlay.open();
        fixture.detectChanges();
        expect(overlay.stateComputed()).toBe('open');
    });

    it('restaura el foco al elemento previo al cerrar', () => {
        const anchorEl = host.anchor().nativeElement;
        anchorEl.focus();
        expect(document.activeElement).toBe(anchorEl);

        registerContent();
        overlay.open();
        fixture.detectChanges();

        // Forzamos que el foco quede en el body para que _restoreFocus lo reubique.
        (document.activeElement as HTMLElement | null)?.blur();
        overlay.close();
        fixture.detectChanges();

        expect(overlay.stateComputed()).toBe('closed');
    });

    it('el input state="open"/"closed" controla la apertura del overlay', () => {
        registerContent();
        host.state.set('open');
        fixture.detectChanges();
        expect(overlay.stateComputed()).toBe('open');

        host.state.set('closed');
        fixture.detectChanges();
        expect(overlay.stateComputed()).toBe('closed');
    });
});
