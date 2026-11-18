import { Component, ElementRef, inject, type TemplateRef, ViewContainerRef, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { BrnOverlayRef } from './brn-overlay-ref';
import { BrnOverlayService } from './brn-overlay.service';

@Component({
    template: `<ng-template #tpl let-ctx><button (click)="ctx.close()">btn {{ ctx?.value }}</button></ng-template>`,
})
class HostComponent {
    readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
    readonly vcr = inject(ViewContainerRef);
}

@Component({
    selector: 'brn-overlay-portal-content',
    template: `<p>contenido de componente</p>`,
})
class PortalContentComponent {}

describe('BrnOverlayService', () => {
    let service: BrnOverlayService;
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    const openRefs: BrnOverlayRef[] = [];

    const open = (options: Record<string, unknown> = {}) => {
        const ref = service.open(host.tpl(), host.vcr, { value: 'X' }, options);
        openRefs.push(ref);
        fixture.detectChanges();
        return ref;
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        service = TestBed.inject(BrnOverlayService);
    });

    afterEach(() => {
        openRefs.forEach((ref) => ref.forceClose());
        openRefs.length = 0;
    });

    it('abre el overlay y renderiza el contenido', () => {
        const ref = open({ id: 'ov-1' });
        expect(ref.open).toBe(true);
        expect(ref.state()).toBe('open');
        expect(document.body.textContent).toContain('btn X');
    });

    it('lanza si el id ya existe', () => {
        open({ id: 'dup' });
        expect(() => service.open(host.tpl(), host.vcr, {}, { id: 'dup' })).toThrow(/already exists/);
    });

    it('lanza si se abre un TemplateRef sin ViewContainerRef', () => {
        expect(() => service.open(host.tpl(), undefined, {}, { id: 'no-vcr' })).toThrow(/ViewContainerRef is required/);
    });

    it('forceClose dispone el overlay', () => {
        const ref = open({ id: 'fc' });
        ref.forceClose();
        expect(ref.open).toBe(false);
        expect(ref.state()).toBe('closed');
    });

    it('dismiss("backdrop") cierra cuando está permitido', () => {
        const ref = open({ id: 'dm1', closeOnBackdropClick: true, disableClose: false, hasBackdrop: true });
        expect(ref.dismiss('backdrop')).toBe(true);
        expect(ref.open).toBe(false);
    });

    it('dismiss devuelve false con disableClose', () => {
        const ref = open({ id: 'dm2', disableClose: true });
        expect(ref.dismiss('escape')).toBe(false);
    });

    it('dismiss("outside") devuelve false si no está permitido', () => {
        const ref = open({ id: 'dm3', disableClose: false, closeOnOutsidePointerEvents: false });
        expect(ref.dismiss('outside')).toBe(false);
    });

    it('setPanelClass, setBackdropClass y updatePosition no fallan', () => {
        const ref = open({ id: 'cls', hasBackdrop: true, panelClass: 'a', backdropClass: 'b' });
        ref.setPanelClass('c d');
        ref.setBackdropClass('e f');
        ref.updatePosition();
        expect(ref.open).toBe(true);
    });

    it('aplica role y configura el elemento del overlay', () => {
        open({ id: 'role-test', role: 'dialog' });
        expect(document.getElementById('role-test')?.getAttribute('role')).toBe('dialog');
    });

    it('usa estrategia conectada con attachTo', () => {
        const anchor = new ElementRef(document.createElement('div'));
        const ref = open({
            id: 'attach',
            attachTo: anchor,
            attachPositions: [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }],
        });
        expect(ref.open).toBe(true);
    });

    it('soporta scroll close/reposition y autoFocus', () => {
        expect(open({ id: 'sc', scrollStrategy: 'close' }).open).toBe(true);
        expect(open({ id: 'sr', scrollStrategy: 'reposition' }).open).toBe(true);
        expect(open({ id: 'af', autoFocus: true }).open).toBe(true);
    });

    it('inyecta proveedores adicionales (arreglo y función)', () => {
        expect(open({ id: 'pa', providers: [] }).open).toBe(true);
        expect(open({ id: 'pf', providers: () => [] }).open).toBe(true);
    });

    it('el click en el backdrop descarta el overlay cuando está permitido', () => {
        const ref = open({ id: 'bd', closeOnBackdropClick: true, disableClose: false, hasBackdrop: true });
        const backdrop = document.querySelector('.cdk-overlay-backdrop') as HTMLElement | null;
        backdrop?.click();
        fixture.detectChanges();
        expect(ref.open).toBe(false);
    });

    it('abre un ComponentPortal cuando el contenido es un componente', () => {
        const ref = service.open(PortalContentComponent, host.vcr, {}, { id: 'cmp-portal' });
        openRefs.push(ref);
        fixture.detectChanges();
        expect(ref.open).toBe(true);
        expect(document.body.textContent).toContain('contenido de componente');
    });

    it('el contexto expone close() sin argumento para cerrar el overlay', () => {
        const ref = open({ id: 'ctx-close', disableClose: false });
        const btn = document.querySelector('button') as HTMLButtonElement;
        btn.click();
        fixture.detectChanges();
        expect(ref.open).toBe(false);
    });

    it('cierra con la tecla Escape cuando es el overlay superior', () => {
        const ref = open({ id: 'esc', disableClose: false });
        const pane = document.getElementById('esc') as HTMLElement | null;
        pane?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        fixture.detectChanges();
        expect(ref.open).toBe(false);
    });
});
