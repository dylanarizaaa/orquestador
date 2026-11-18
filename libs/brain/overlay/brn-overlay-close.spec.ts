import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnOverlayRef } from './brn-overlay-ref';
import { BrnOverlayClose } from './brn-overlay-close';

@Component({
    template: `<button brnOverlayClose>cerrar</button>`,
    imports: [BrnOverlayClose],
})
class HostComponent {}

describe('BrnOverlayClose', () => {
    let fixture: ComponentFixture<HostComponent>;
    let closeRef: { close: jest.Mock };

    beforeEach(() => {
        closeRef = { close: jest.fn() };
        TestBed.configureTestingModule({
            imports: [HostComponent],
            providers: [{ provide: BrnOverlayRef, useValue: closeRef }],
        });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
    });

    it('cierra el overlay al hacer click', () => {
        const button = fixture.debugElement.query(By.css('button[brnOverlayClose]')).nativeElement as HTMLButtonElement;
        button.click();
        expect(closeRef.close).toHaveBeenCalled();
    });

    it('expone close() para invocación directa', () => {
        const directive = fixture.debugElement.query(By.directive(BrnOverlayClose)).injector.get(BrnOverlayClose);
        directive.close();
        expect(closeRef.close).toHaveBeenCalled();
    });
});
