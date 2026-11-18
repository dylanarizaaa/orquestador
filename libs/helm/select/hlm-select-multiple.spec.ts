import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnSelectMultiple } from '@brain/select';
import { HlmSelectImports } from './index';

@Component({
    template: `
        <hlm-select-multiple [(value)]="value">
            <hlm-select-trigger>
                <hlm-select-value />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
                <hlm-select-item value="a">A</hlm-select-item>
                <hlm-select-item value="b">B</hlm-select-item>
            </hlm-select-content>
        </hlm-select-multiple>
    `,
    imports: [HlmSelectImports],
})
class HostComponent {
    value = signal<string[] | null>(null);
}

describe('HlmSelectMultiple', () => {
    let fixture: ComponentFixture<HostComponent>;
    let select: BrnSelectMultiple<string>;

    const optionFor = (text: string) =>
        Array.from(document.querySelectorAll('[role="option"]')).find((o) =>
            o.textContent?.includes(text),
        ) as HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        select = fixture.debugElement
            .query(By.directive(BrnSelectMultiple))
            .injector.get(BrnSelectMultiple) as BrnSelectMultiple<string>;
    });

    afterEach(() => select.close());

    it('abre el desplegable y activa el primer item sin valor previo', () => {
        select.open();
        fixture.detectChanges();
        expect(select.isExpanded()).toBe(true);
        expect(document.body.textContent).toContain('A');
    });

    it('selecciona múltiples items acumulándolos', () => {
        select.open();
        fixture.detectChanges();
        optionFor('A').click();
        fixture.detectChanges();
        expect(select.value()).toEqual(['a']);

        optionFor('B').click();
        fixture.detectChanges();
        expect(select.value()).toEqual(['a', 'b']);
    });

    it('al reabrir con valor activa el item correspondiente', () => {
        select.open();
        fixture.detectChanges();
        optionFor('B').click();
        fixture.detectChanges();

        select.close();
        fixture.detectChanges();
        select.open();
        fixture.detectChanges();
        expect(select.isExpanded()).toBe(true);
    });
});
