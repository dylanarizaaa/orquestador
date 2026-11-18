import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmDialogService } from './hlm-dialog.service';

@Component({ template: `<p>contenido dinámico</p>` })
class DynamicComponent {}

@Component({ template: `` })
class HostComponent {}

describe('HlmDialogService', () => {
    let service: HlmDialogService;
    let fixture: ComponentFixture<HostComponent>;
    const refs: Array<{ close: () => void }> = [];

    const open = (options?: Record<string, unknown>) => {
        const ref = service.open(DynamicComponent, options) as unknown as { close: () => void };
        refs.push(ref);
        fixture.detectChanges();
        return ref;
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent, DynamicComponent] });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        service = TestBed.inject(HlmDialogService);
    });

    afterEach(() => {
        refs.forEach((r) => r.close());
        refs.length = 0;
    });

    it('abre un componente dinámico con botón de cierre', () => {
        open({ showCloseButton: true, contentClass: 'extra', context: { foo: 1 } });
        expect(document.body.textContent).toContain('contenido dinámico');
        expect(document.querySelector('[hlmDialogClose]')).toBeTruthy();
    });

    it('abre sin opciones usando el contexto vacío por defecto', () => {
        open();
        expect(document.body.textContent).toContain('contenido dinámico');
    });

    it('ignora un contexto que no es objeto', () => {
        open({ context: 'no-es-objeto', showCloseButton: false });
        expect(document.body.textContent).toContain('contenido dinámico');
        expect(document.querySelector('[hlmDialogClose]')).toBeFalsy();
    });
});
