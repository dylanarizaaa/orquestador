import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnDialog, BrnDialogImports } from '@brain/dialog';
import { HlmDialogDescription, HlmDialogTitle } from './index';

@Component({
    template: `
        <button brnDialogTrigger [brnDialogTriggerFor]="dialog">Abrir</button>
        <brn-dialog #dialog="brnDialog">
            <ng-template brnDialogContent>
                <h2 hlmDialogTitle>Título helm</h2>
                <p hlmDialogDescription>Descripción helm</p>
            </ng-template>
        </brn-dialog>
    `,
    imports: [BrnDialogImports, HlmDialogTitle, HlmDialogDescription],
})
class HostComponent {}

describe('HlmDialogDescription y HlmDialogTitle', () => {
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        const dialog = fixture.debugElement.query(By.directive(BrnDialog)).injector.get(BrnDialog);
        dialog.close();
    });

    it('renderiza título y descripción dentro del diálogo', () => {
        (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
        fixture.detectChanges();
        expect(document.body.textContent).toContain('Título helm');
        expect(document.body.textContent).toContain('Descripción helm');
    });
});
