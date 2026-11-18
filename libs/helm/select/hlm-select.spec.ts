import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnSelect } from '@brain/select';
import { HlmSelectImports } from './index';

@Component({
    template: `
        <hlm-select [(value)]="value">
            <hlm-select-trigger>
                <hlm-select-value />
                <hlm-select-placeholder>Seleccione</hlm-select-placeholder>
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
                <hlm-select-scroll-up />
                <hlm-select-group>
                    <hlm-select-label>Frutas</hlm-select-label>
                    <hlm-select-item value="apple">Apple</hlm-select-item>
                    <hlm-select-item value="banana">Banana</hlm-select-item>
                    <hlm-select-separator />
                    <hlm-select-item value="cherry" disabled>Cherry</hlm-select-item>
                </hlm-select-group>
                <hlm-select-scroll-down />
            </hlm-select-content>
        </hlm-select>
    `,
    imports: [HlmSelectImports],
})
class HostComponent {
    value = signal<string | null>(null);
}

describe('HlmSelect', () => {
    let fixture: ComponentFixture<HostComponent>;
    let select: BrnSelect<string>;

    const brnSelect = () =>
        fixture.debugElement.query(By.directive(BrnSelect)).injector.get(BrnSelect) as BrnSelect<string>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        select = brnSelect();
    });

    afterEach(() => {
        select.close();
    });

    it('se renderiza con su disparador', () => {
        expect(fixture.debugElement.query(By.css('hlm-select-trigger'))).toBeTruthy();
        expect(select.isExpanded()).toBe(false);
    });

    it('open() despliega el contenido en el overlay', () => {
        select.open();
        fixture.detectChanges();
        expect(select.isExpanded()).toBe(true);
        expect(document.body.textContent).toContain('Apple');
        expect(document.body.textContent).toContain('Banana');
    });

    it('select() fija el valor y cierra', () => {
        select.open();
        fixture.detectChanges();
        select.select('banana');
        fixture.detectChanges();
        expect(select.value()).toBe('banana');
        expect(select.isExpanded()).toBe(false);
    });

    it('toggle() alterna el estado', () => {
        select.toggle();
        fixture.detectChanges();
        expect(select.isExpanded()).toBe(true);
        select.toggle();
        fixture.detectChanges();
        expect(select.isExpanded()).toBe(false);
    });

    it('isSelected/hasValue reflejan el valor', () => {
        expect(select.hasValue()).toBe(false);
        select.writeValue('apple');
        fixture.detectChanges();
        expect(select.hasValue()).toBe(true);
        expect(select.isSelected('apple')).toBe(true);
        expect(select.isSelected('banana')).toBe(false);
    });

    it('respeta el estado deshabilitado', () => {
        select.setDisabledState(true);
        fixture.detectChanges();
        expect(select.disabledState()).toBe(true);
        select.open();
        fixture.detectChanges();
        expect(select.isExpanded()).toBe(false);
    });

    it('integra el ControlValueAccessor', () => {
        const onChange = jest.fn();
        const onTouched = jest.fn();
        select.registerOnChange(onChange);
        select.registerOnTouched(onTouched);

        select.open();
        fixture.detectChanges();
        select.select('apple');
        fixture.detectChanges();

        expect(onChange).toHaveBeenCalledWith('apple');
    });

    it('selectActiveItem cierra el desplegable', () => {
        select.open();
        fixture.detectChanges();
        select.selectActiveItem();
        fixture.detectChanges();
        expect(select.isExpanded()).toBe(false);
    });

    it('ArrowDown en el trigger abre y Enter selecciona el item activo', () => {
        const trigger = fixture.debugElement.query(By.css('[brnSelectTrigger]')).nativeElement as HTMLElement;
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        fixture.detectChanges();
        expect(select.isExpanded()).toBe(true);

        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        fixture.detectChanges();
        expect(select.isExpanded()).toBe(false);
    });

    it('Enter abre el trigger colapsado y Tab confirma cuando está abierto', () => {
        const trigger = fixture.debugElement.query(By.css('[brnSelectTrigger]')).nativeElement as HTMLElement;
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        fixture.detectChanges();
        expect(select.isExpanded()).toBe(true);

        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        fixture.detectChanges();
        expect(select.isExpanded()).toBe(false);
    });

    it('al hacer click en un item del overlay lo selecciona', () => {
        select.open();
        fixture.detectChanges();
        const options = Array.from(document.querySelectorAll('[role="option"]')) as HTMLElement[];
        options.find((o) => o.textContent?.includes('Apple'))!.click();
        fixture.detectChanges();
        expect(select.value()).toBe('apple');
    });

    it('el hover activa el item y el item deshabilitado no se selecciona', () => {
        select.open();
        fixture.detectChanges();
        const options = Array.from(document.querySelectorAll('[role="option"]')) as HTMLElement[];
        const banana = options.find((o) => o.textContent?.includes('Banana'))!;
        banana.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        fixture.detectChanges();

        const cherry = options.find((o) => o.textContent?.includes('Cherry'))!; // deshabilitado
        cherry.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        cherry.click();
        fixture.detectChanges();
        expect(select.value()).not.toBe('cherry');
    });
});
