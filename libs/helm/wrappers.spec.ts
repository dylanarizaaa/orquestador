import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnButton } from '@brain/button';
import { HlmDialogFooter, HlmDialogHeader } from '@helm/dialog';
import {
    HlmFieldContent,
    HlmFieldGroup,
    HlmFieldLegend,
    HlmFieldSeparator,
    HlmFieldSet,
    HlmFieldTitle,
} from '@helm/field';
import { HlmInputGroupText, HlmInputGroupTextarea } from '@helm/input-group';
import { HlmPopoverDescription, HlmPopoverHeader, HlmPopoverTitle } from '@helm/popover';
import { HlmTextarea } from '@helm/textarea';

@Component({
    template: `
        <a brnButton [disabled]="anchorDisabled()" href="#">enlace</a>
        <button brnButton [disabled]="false">botón</button>
        <textarea hlmTextarea [forceInvalid]="true"></textarea>
        <div hlmDialogFooter></div>
        <div hlmDialogHeader></div>
        <div hlmFieldContent></div>
        <div hlmFieldGroup></div>
        <fieldset hlmFieldSet>
            <legend hlmFieldLegend></legend>
        </fieldset>
        <div hlmFieldTitle></div>
        <hlm-field-separator></hlm-field-separator>
        <div hlmPopoverHeader></div>
        <div hlmPopoverTitle></div>
        <div hlmPopoverDescription></div>
        <div hlmInputGroupText></div>
        <textarea hlmInputGroupTextarea></textarea>
    `,
    imports: [
        BrnButton,
        HlmTextarea,
        HlmDialogFooter,
        HlmDialogHeader,
        HlmFieldContent,
        HlmFieldGroup,
        HlmFieldSet,
        HlmFieldTitle,
        HlmFieldLegend,
        HlmFieldSeparator,
        HlmPopoverHeader,
        HlmPopoverTitle,
        HlmPopoverDescription,
        HlmInputGroupText,
        HlmInputGroupTextarea,
    ],
})
class HostComponent {
    anchorDisabled = signal(false);
}

describe('Wrappers helm/brain (host classes)', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('renderiza todos los wrappers aplicando sus clases de host', () => {
        expect(fixture.debugElement.query(By.directive(HlmDialogFooter))).toBeTruthy();
        expect(fixture.debugElement.query(By.directive(HlmFieldContent))).toBeTruthy();
        expect(fixture.debugElement.query(By.directive(HlmPopoverTitle))).toBeTruthy();
        const textarea = fixture.debugElement.query(By.directive(HlmTextarea)).nativeElement as HTMLElement;
        expect(textarea.getAttribute('data-slot')).toBe('textarea');
    });

    it('brnButton en un enlace previene el click cuando está deshabilitado', () => {
        host.anchorDisabled.set(true);
        fixture.detectChanges();
        const anchor = fixture.debugElement.query(By.css('a[brnButton]')).nativeElement as HTMLAnchorElement;
        const event = new MouseEvent('click', { cancelable: true, bubbles: true });
        anchor.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
        expect(anchor.getAttribute('data-disabled')).toBe('true');
    });

    it('brnButton habilitado no marca data-disabled', () => {
        const button = fixture.debugElement.query(By.css('button[brnButton]')).nativeElement as HTMLButtonElement;
        expect(button.getAttribute('data-disabled')).toBeNull();
    });
});
