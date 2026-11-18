import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnDialog, BrnDialogImports } from './index';

@Component({
    template: `
        <button brnDialogTrigger [brnDialogTriggerFor]="dialog">Abrir</button>
        <brn-dialog #dialog="brnDialog" [closeOnBackdropClick]="true">
            <ng-template brnDialogContent>
                <div>
                    <h2 brnDialogTitle>Título</h2>
                    <p brnDialogDescription>Descripción</p>
                    <button brnDialogClose>Cerrar</button>
                </div>
            </ng-template>
        </brn-dialog>
    `,
    imports: [BrnDialogImports],
})
class HostComponent {}

describe('BrnDialog (directiva)', () => {
    let fixture: ComponentFixture<HostComponent>;
    let dialog: BrnDialog;

    const trigger = () => fixture.debugElement.query(By.css('button[brnDialogTrigger]')).nativeElement as HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        dialog = fixture.debugElement.query(By.directive(BrnDialog)).injector.get(BrnDialog) as BrnDialog;
    });

    afterEach(() => {
        dialog.close();
    });

    it('arranca cerrado y el trigger refleja el estado', () => {
        expect(dialog.stateComputed()).toBe('closed');
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('el trigger abre el diálogo y renderiza el contenido', () => {
        trigger().click();
        fixture.detectChanges();
        expect(dialog.stateComputed()).toBe('open');
        expect(document.body.textContent).toContain('Título');
        expect(document.body.textContent).toContain('Descripción');
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('el botón brnDialogClose cierra el diálogo', () => {
        trigger().click();
        fixture.detectChanges();
        const closeButton = document.querySelector('[brnDialogClose]') as HTMLButtonElement;
        expect(closeButton).toBeTruthy();
        closeButton.click();
        fixture.detectChanges();
        expect(dialog.stateComputed()).not.toBe('open');
    });

    it('setPanelClass y setOverlayClass actualizan el diálogo abierto', () => {
        trigger().click();
        fixture.detectChanges();
        expect(() => {
            dialog.setPanelClass('mi-panel');
            dialog.setOverlayClass('mi-overlay');
            dialog.updatePosition();
        }).not.toThrow();
    });

    it('un segundo open() reusa la referencia existente (reopen)', () => {
        trigger().click();
        fixture.detectChanges();
        expect(dialog.stateComputed()).toBe('open');

        expect(() => dialog.open()).not.toThrow();
        expect(dialog.stateComputed()).toBe('open');
    });

    it('registerOverlayClass y setOrigin no fallan antes de abrir', () => {
        dialog.registerOverlayClass(signal('clase-overlay'));
        dialog.setOrigin(undefined);
        trigger().click();
        fixture.detectChanges();
        expect(dialog.stateComputed()).toBe('open');
    });
});

@Component({
    template: `
        <button brnDialogTrigger [brnDialogTriggerFor]="dialog">Abrir</button>
        <brn-dialog #dialog="brnDialog" [scrollStrategy]="scrollStrategy()" [state]="state()">
            <ng-template brnDialogContent><p>contenido configurable</p></ng-template>
        </brn-dialog>
    `,
    imports: [BrnDialogImports],
})
class ConfigurableHostComponent {
    readonly scrollStrategy = signal<'close' | 'reposition' | null | undefined>(undefined);
    readonly state = signal<'open' | 'closed' | null>(null);
}

describe('BrnDialog (estrategias y estado por input)', () => {
    let fixture: ComponentFixture<ConfigurableHostComponent>;
    let host: ConfigurableHostComponent;
    let dialog: BrnDialog;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ConfigurableHostComponent] });
        fixture = TestBed.createComponent(ConfigurableHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        dialog = fixture.debugElement.query(By.directive(BrnDialog)).injector.get(BrnDialog) as BrnDialog;
    });

    afterEach(() => dialog.close());

    it('getScrollStrategy soporta "close", "reposition" y el valor por defecto', () => {
        host.scrollStrategy.set('close');
        fixture.detectChanges();
        dialog.open();
        fixture.detectChanges();
        expect(dialog.stateComputed()).toBe('open');
        dialog.close();
        fixture.detectChanges();

        host.scrollStrategy.set('reposition');
        fixture.detectChanges();
        dialog.open();
        fixture.detectChanges();
        expect(dialog.stateComputed()).toBe('open');
    });

    it('el input state="open"/"closed" controla la apertura', () => {
        host.state.set('open');
        fixture.detectChanges();
        expect(dialog.stateComputed()).toBe('open');

        host.state.set('closed');
        fixture.detectChanges();
        expect(dialog.stateComputed()).toBe('closed');
    });
});
