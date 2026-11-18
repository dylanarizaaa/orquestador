import { OverlayPositionBuilder } from '@angular/cdk/overlay';
import { Component, ElementRef, inject, type TemplateRef, ViewContainerRef, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { BrnDialogRef } from './brn-dialog-ref';
import { BrnDialogService } from './brn-dialog.service';

/** Dispara la secuencia de eventos que el dispatcher de CDK interpreta como click externo. */
function dispatchOutsidePointer(target: EventTarget = document.body): void {
    target.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

@Component({
    template: `<ng-template #tpl let-ctx>contenido del diálogo {{ ctx?.value }}</ng-template>`,
})
class HostComponent {
    readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
    readonly vcr = inject(ViewContainerRef);
}

describe('BrnDialogService', () => {
    let service: BrnDialogService;
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    const openRefs: BrnDialogRef[] = [];

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
        service = TestBed.inject(BrnDialogService);
    });

    afterEach(() => {
        openRefs.forEach((ref) => ref.forceClose());
        openRefs.length = 0;
    });

    it('abre el diálogo y renderiza el contenido del template', () => {
        const ref = open();
        expect(ref.open).toBe(true);
        expect(ref.state()).toBe('open');
        expect(document.body.textContent).toContain('contenido del diálogo X');
    });

    it('lanza un error si el id ya existe', () => {
        open({ id: 'dup-dialog' });
        expect(() => service.open(host.tpl(), host.vcr, {}, { id: 'dup-dialog' })).toThrow(/already exists/);
    });

    it('forceClose cierra el diálogo de inmediato', () => {
        const ref = open();
        ref.forceClose();
        expect(ref.open).toBe(false);
        expect(ref.state()).toBe('closed');
    });

    it('dismiss("backdrop") cierra cuando closeOnBackdropClick está activo', () => {
        const ref = open({ closeOnBackdropClick: true, disableClose: false, hasBackdrop: true });
        expect(ref.dismiss('backdrop')).toBe(true);
        expect(ref.open).toBe(false);
    });

    it('dismiss devuelve false cuando disableClose está activo', () => {
        const ref = open({ disableClose: true });
        expect(ref.dismiss('escape')).toBe(false);
        expect(ref.open).toBe(true);
    });

    it('dismiss("backdrop") devuelve false si closeOnBackdropClick está desactivado', () => {
        const ref = open({ disableClose: false, closeOnBackdropClick: false });
        expect(ref.dismiss('backdrop')).toBe(false);
    });

    it('setPanelClass, setOverlayClass y updatePosition no fallan', () => {
        const ref = open({ hasBackdrop: true, panelClass: 'a', backdropClass: 'b' });
        ref.setPanelClass('c d');
        ref.setOverlayClass('e f');
        ref.updatePosition();
        expect(ref.open).toBe(true);
    });

    it('usa una estrategia de posición conectada cuando se provee attachTo', () => {
        const anchor = new ElementRef(document.createElement('div'));
        const ref = open({
            attachTo: anchor,
            attachPositions: [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }],
        });
        expect(ref.open).toBe(true);
    });

    it('soporta estrategias de scroll close y reposition', () => {
        expect(open({ scrollStrategy: 'close', id: 'scroll-close' }).open).toBe(true);
        expect(open({ scrollStrategy: 'reposition', id: 'scroll-reposition' }).open).toBe(true);
    });

    it('inyecta proveedores adicionales pasados como arreglo o función', () => {
        expect(open({ id: 'prov-array', providers: [] }).open).toBe(true);
        expect(open({ id: 'prov-fn', providers: () => [] }).open).toBe(true);
    });

    it('el click en el backdrop descarta el diálogo cuando está permitido', () => {
        const ref = open({ id: 'bd', closeOnBackdropClick: true, disableClose: false, hasBackdrop: true });
        const backdrop = document.querySelector('.cdk-overlay-backdrop') as HTMLElement | null;
        backdrop?.click();
        fixture.detectChanges();
        expect(ref.open).toBe(false);
    });

    it('cierra con Escape cuando disableClose está desactivado', () => {
        const ref = open({ id: 'escape-key', disableClose: false });
        const pane = document.querySelector('.cdk-overlay-pane') as HTMLElement | null;
        pane?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        fixture.detectChanges();
        expect(ref.open).toBe(false);
    });

    it('no cierra con Escape cuando disableClose está activo', () => {
        const ref = open({ id: 'escape-blocked', disableClose: true });
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        fixture.detectChanges();
        expect(ref.open).toBe(true);
    });

    it('expone el id configurado a través de la referencia', () => {
        const ref = open({ id: 'ref-id' });
        expect(ref.id).toBe('ref-id');
    });

    it('reopen vuelve a abrir un diálogo que está en fase de cierre', () => {
        const ref = open({ id: 'reopen-1', disableClose: false });
        ref.close();
        expect(ref.phase()).toBe('closing');

        ref.reopen();
        expect(ref.open).toBe(true);
        expect(ref.state()).toBe('open');
    });

    it('reopen no hace nada si el diálogo no está cerrándose', () => {
        const ref = open({ id: 'reopen-2' });
        ref.reopen();
        expect(ref.open).toBe(true);
    });

    it('forceClose es idempotente si el diálogo ya está cerrado', () => {
        const ref = open({ id: 'force-twice' });
        ref.forceClose();
        expect(ref.open).toBe(false);
        expect(() => ref.forceClose()).not.toThrow();
        expect(ref.open).toBe(false);
    });

    it('descarta con click externo cuando es el único diálogo (topmost)', () => {
        const ref = open({ id: 'outside-single', disableClose: false, closeOnOutsidePointerEvents: true });
        dispatchOutsidePointer();
        fixture.detectChanges();
        expect(ref.open).toBe(false);
    });

    it('con diálogos apilados (origen global) un click externo descarta los no anidados', () => {
        const bottom = open({ id: 'stack-bottom', disableClose: false, closeOnOutsidePointerEvents: true });
        const top = open({ id: 'stack-top', disableClose: false, closeOnOutsidePointerEvents: true });

        dispatchOutsidePointer();
        fixture.detectChanges();

        // Origen global => el superior no está anidado en el inferior => ambos se descartan.
        expect(top.open).toBe(false);
        expect(bottom.open).toBe(false);
    });

    it('con un diálogo superior anclado por punto evalúa las coordenadas de anidamiento', () => {
        const positionBuilder = TestBed.inject(OverlayPositionBuilder);
        const pointStrategy = positionBuilder
            .flexibleConnectedTo({ x: 10, y: 10 })
            .withPositions([{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' }]);

        const bottom = open({ id: 'point-bottom', disableClose: false, closeOnOutsidePointerEvents: true });
        const top = open({
            id: 'point-top',
            disableClose: false,
            closeOnOutsidePointerEvents: true,
            positionStrategy: pointStrategy,
        });

        dispatchOutsidePointer();
        fixture.detectChanges();

        expect(top.open).toBe(false);
        expect(bottom.open).toBe(false);
    });

    it('con un diálogo superior anclado a un elemento evalúa contains()', () => {
        const anchor = new ElementRef(document.createElement('div'));
        document.body.appendChild(anchor.nativeElement);

        const bottom = open({ id: 'el-bottom', disableClose: false, closeOnOutsidePointerEvents: true });
        const top = open({
            id: 'el-top',
            disableClose: false,
            closeOnOutsidePointerEvents: true,
            attachTo: anchor,
            attachPositions: [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }],
        });

        dispatchOutsidePointer();
        fixture.detectChanges();

        expect(top.open).toBe(false);
        // El ancla no está dentro del host del inferior => no anidado => el inferior también se descarta.
        expect(bottom.open).toBe(false);
        anchor.nativeElement.remove();
    });

    it('el contexto del template expone close() para cerrar el diálogo', () => {
        @Component({
            template: `<ng-template #tpl let-ctx><button type="button" (click)="ctx.close('ok')">cerrar ctx</button></ng-template>`,
        })
        class CtxHostComponent {
            readonly tpl = viewChild.required<TemplateRef<{ close: (result?: unknown) => void }>>('tpl');
            readonly vcr = inject(ViewContainerRef);
        }

        const ctxFixture = TestBed.createComponent(CtxHostComponent);
        const ctxHost = ctxFixture.componentInstance;
        ctxFixture.detectChanges();

        const ref = service.open(ctxHost.tpl(), ctxHost.vcr, { value: 'ctx' }, { id: 'ctx-close' });
        openRefs.push(ref);
        ctxFixture.detectChanges();

        const btn = document.querySelector('button') as HTMLButtonElement;
        btn.click();
        ctxFixture.detectChanges();
        expect(ref.open).toBe(false);
    });
});
