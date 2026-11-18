import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnDialogTrigger } from './brn-dialog-trigger';

@Component({
    template: `<button brnDialogTrigger>solo</button>`,
    imports: [BrnDialogTrigger],
})
class StandaloneHostComponent {}

describe('BrnDialogTrigger (sin diálogo asociado)', () => {
    let fixture: ComponentFixture<StandaloneHostComponent>;
    const trigger = () => fixture.debugElement.query(By.directive(BrnDialogTrigger)).injector.get(BrnDialogTrigger);
    const button = () => fixture.debugElement.query(By.css('button[brnDialogTrigger]')).nativeElement as HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [StandaloneHostComponent] });
        fixture = TestBed.createComponent(StandaloneHostComponent);
        fixture.detectChanges();
    });

    it('cae en los valores por defecto cuando no hay diálogo ni referencia', () => {
        expect(trigger().state()).toBe('closed');
        expect(trigger().dialogId()).toBeNull();
        expect(button().getAttribute('aria-expanded')).toBe('false');
        expect(button().getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('open() no falla sin diálogo asociado', () => {
        expect(() => trigger().open()).not.toThrow();
        expect(trigger().state()).toBe('closed');
    });
});
