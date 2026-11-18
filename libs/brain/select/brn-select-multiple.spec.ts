import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnSelectMultiple } from './brn-select-multiple';

@Component({
    template: `<div brnSelectMultiple [(value)]="value" [disabled]="disabled()"></div>`,
    imports: [BrnSelectMultiple],
})
class HostComponent {
    value = signal<string[] | null>(null);
    disabled = signal(false);
}

describe('BrnSelectMultiple', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let select: BrnSelectMultiple<string>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        select = fixture.debugElement
            .query(By.directive(BrnSelectMultiple))
            .injector.get(BrnSelectMultiple) as BrnSelectMultiple<string>;
    });

    it('hasValue refleja si hay elementos seleccionados', () => {
        expect(select.hasValue()).toBe(false);
        select.select('a');
        expect(select.hasValue()).toBe(true);
    });

    it('select agrega y quita valores (toggle)', () => {
        select.select('a');
        select.select('b');
        expect(select.value()).toEqual(['a', 'b']);
        select.select('a'); // quita
        expect(select.value()).toEqual(['b']);
    });

    it('isSelected reconoce los valores presentes', () => {
        select.select('a');
        expect(select.isSelected('a')).toBe(true);
        expect(select.isSelected('z')).toBe(false);
    });

    it('select notifica al onChange registrado', () => {
        const onChange = jest.fn();
        select.registerOnChange(onChange);
        select.select('a');
        expect(onChange).toHaveBeenCalledWith(['a']);
    });

    it('writeValue actualiza el valor', () => {
        select.writeValue(['x', 'y']);
        expect(select.value()).toEqual(['x', 'y']);
        expect(select.hasValue()).toBe(true);
    });

    it('setDisabledState y open/close sin popover no fallan', () => {
        select.setDisabledState(true);
        expect(select.disabledState()).toBe(true);
        expect(() => select.open()).not.toThrow();
        expect(select.isExpanded()).toBe(false);

        select.setDisabledState(false);
        expect(() => select.close()).not.toThrow();
        expect(() => select.toggle()).not.toThrow();
        expect(() => select.selectActiveItem()).not.toThrow();
    });

    it('registerOnTouched, updateTriggerWidth y registerSelectTrigger funcionan', () => {
        const onTouched = jest.fn();
        select.registerOnTouched(onTouched);
        select.updateTriggerWidth(120);
        expect(select.triggerWidth()).toBe(120);
        expect(select.labelableId()).toBeUndefined();
    });
});
