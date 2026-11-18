import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnPopover, BrnPopoverImports } from '@brain/popover';
import { BrnOverlayTrigger } from './brn-overlay-trigger';

@Component({
    template: `
        <button brnOverlayTrigger [brnOverlayTriggerFor]="pop">abrir</button>
        <brn-popover #pop="brnPopover">
            <ng-template brnPopoverContent><div>contenido overlay</div></ng-template>
        </brn-popover>
    `,
    imports: [BrnOverlayTrigger, BrnPopoverImports],
})
class HostComponent {}

describe('BrnOverlayTrigger (base)', () => {
    let fixture: ComponentFixture<HostComponent>;
    let popover: BrnPopover;
    const button = () => fixture.debugElement.query(By.css('button[brnOverlayTrigger]')).nativeElement as HTMLButtonElement;
    const trigger = () => fixture.debugElement.query(By.directive(BrnOverlayTrigger)).injector.get(BrnOverlayTrigger);

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        popover = fixture.debugElement.query(By.directive(BrnPopover)).injector.get(BrnPopover);
    });

    afterEach(() => popover.close());

    it('refleja el estado en aria-expanded y data-state', () => {
        expect(button().getAttribute('aria-expanded')).toBe('false');
        expect(button().getAttribute('data-state')).toBe('closed');
        expect(trigger().overlayId()).toBeTruthy();
    });

    it('toggle (click) abre el overlay asociado', () => {
        button().click();
        fixture.detectChanges();
        expect(document.body.textContent).toContain('contenido overlay');
        expect(button().getAttribute('aria-expanded')).toBe('true');
        expect(popover.stateComputed()).toBe('open');
    });

    it('open() abre directamente', () => {
        trigger().open();
        fixture.detectChanges();
        expect(document.body.textContent).toContain('contenido overlay');
    });
});

@Component({
    template: `<button brnOverlayTrigger>solo</button>`,
    imports: [BrnOverlayTrigger],
})
class StandaloneHostComponent {}

describe('BrnOverlayTrigger (sin overlay asociado)', () => {
    let fixture: ComponentFixture<StandaloneHostComponent>;
    const trigger = () => fixture.debugElement.query(By.directive(BrnOverlayTrigger)).injector.get(BrnOverlayTrigger);
    const button = () => fixture.debugElement.query(By.css('button[brnOverlayTrigger]')).nativeElement as HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [StandaloneHostComponent] });
        fixture = TestBed.createComponent(StandaloneHostComponent);
        fixture.detectChanges();
    });

    it('cae en los valores por defecto cuando no hay overlay ni referencia', () => {
        expect(trigger().state()).toBe('closed');
        expect(trigger().overlayId()).toBeNull();
        expect(button().getAttribute('aria-expanded')).toBe('false');
    });

    it('open() y toggle() no fallan sin overlay asociado', () => {
        expect(() => {
            trigger().open();
            trigger().toggle();
        }).not.toThrow();
        expect(trigger().state()).toBe('closed');
    });
});
