import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnPopover, BrnPopoverImports, BrnPopoverTrigger } from './index';

@Component({
    template: `
        <button brnPopoverTrigger [brnPopoverTriggerFor]="pop">Abrir</button>
        <brn-popover #pop="brnPopover" align="center" sideOffset="8" offsetX="2">
            <ng-template brnPopoverContent>
                <div>Contenido del popover</div>
            </ng-template>
        </brn-popover>
    `,
    imports: [BrnPopoverImports],
})
class HostComponent {}

describe('BrnPopover', () => {
    let fixture: ComponentFixture<HostComponent>;
    let trigger: BrnPopoverTrigger;
    let popover: BrnPopover;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        trigger = fixture.debugElement.query(By.directive(BrnPopoverTrigger)).injector.get(BrnPopoverTrigger);
        popover = fixture.debugElement.query(By.directive(BrnPopover)).injector.get(BrnPopover);
    });

    afterEach(() => {
        popover.close();
    });

    it('el trigger abre el popover y renderiza el contenido', () => {
        trigger.open();
        fixture.detectChanges();
        expect(document.body.textContent).toContain('Contenido del popover');
        expect(popover.stateComputed()).toBe('open');
    });

    it('toggle alterna abrir y cerrar', () => {
        trigger.toggle();
        fixture.detectChanges();
        expect(popover.stateComputed()).toBe('open');

        trigger.toggle();
        fixture.detectChanges();
        expect(popover.stateComputed()).not.toBe('open');
    });

    it('el trigger refleja el estado en aria-expanded', () => {
        const button = fixture.debugElement.query(By.css('button[brnPopoverTrigger]')).nativeElement as HTMLButtonElement;
        expect(button.getAttribute('aria-expanded')).toBe('false');
        trigger.open();
        fixture.detectChanges();
        expect(button.getAttribute('aria-expanded')).toBe('true');
    });
});
