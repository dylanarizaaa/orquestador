import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmDatePickerMulti } from './hlm-date-picker-multi';

describe('HlmDatePickerMulti', () => {
    let fixture: ComponentFixture<HlmDatePickerMulti<Date>>;
    let picker: HlmDatePickerMulti<Date>;

    const state = () => (picker as unknown as { _popoverState(): string | null })._popoverState();
    const handle = (v: Date[] | undefined) => (picker as unknown as { _handleChange(v: Date[] | undefined): void })._handleChange(v);

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HlmDatePickerMulti] });
        fixture = TestBed.createComponent(HlmDatePickerMulti<Date>);
        fixture.detectChanges();
        picker = fixture.componentInstance;
    });

    it('_handleChange fija las fechas, notifica y emite', () => {
        const onChange = jest.fn();
        picker.registerOnChange(onChange);
        handle([new Date(2026, 5, 15)]);
        expect(picker.hasDate()).toBe(true);
        expect(picker.formattedDate()).toBeDefined();
        expect(onChange).toHaveBeenCalled();
    });

    it('_handleChange(undefined) no hace nada', () => {
        handle(undefined);
        expect(picker.hasDate()).toBe(false);
    });

    it('writeValue y reset', () => {
        picker.writeValue([new Date(2026, 5, 15)]);
        expect(picker.hasDate()).toBe(true);
        picker.writeValue(null);
        expect(picker.hasDate()).toBe(false);

        const onChange = jest.fn();
        picker.registerOnChange(onChange);
        picker.reset();
        expect(onChange).toHaveBeenLastCalledWith([]);
    });

    it('open/close y setDisabledState bloquea _handleChange', () => {
        picker.open();
        expect(state()).toBe('open');
        picker.close();
        expect(state()).toBe('closed');

        picker.setDisabledState(true);
        handle([new Date(2026, 5, 15)]);
        expect(picker.hasDate()).toBe(false);
    });

    it('autoCloseOnMaxSelection cierra al alcanzar el máximo', () => {
        fixture.componentRef.setInput('autoCloseOnMaxSelection', true);
        fixture.componentRef.setInput('maxSelection', 1);
        fixture.detectChanges();
        handle([new Date(2026, 5, 15)]);
        expect(state()).toBe('closed');
    });

    it('labelableId es undefined sin disparador', () => {
        expect(picker.labelableId()).toBeUndefined();
    });
});
