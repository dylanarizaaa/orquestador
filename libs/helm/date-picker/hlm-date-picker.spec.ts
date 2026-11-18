import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmDatePicker } from './hlm-date-picker';

describe('HlmDatePicker', () => {
    let fixture: ComponentFixture<HlmDatePicker<Date>>;
    let picker: HlmDatePicker<Date>;

    const state = () => (picker as unknown as { _popoverState(): string | null })._popoverState();

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HlmDatePicker] });
        fixture = TestBed.createComponent(HlmDatePicker<Date>);
        fixture.detectChanges();
        picker = fixture.componentInstance;
    });

    it('updateDate fija la fecha, notifica onChange y emite dateChange', () => {
        const onChange = jest.fn();
        picker.registerOnChange(onChange);
        const emitted: Array<Date | undefined> = [];
        picker.dateChange.subscribe((d) => emitted.push(d));

        picker.updateDate(new Date(2026, 5, 15));
        expect(picker.hasDate()).toBe(true);
        expect(picker.formattedDate()).toBeDefined();
        expect(onChange).toHaveBeenCalled();
        expect(emitted.length).toBe(1);
    });

    it('updateDate(undefined) limpia la fecha', () => {
        picker.updateDate(new Date(2026, 5, 15));
        picker.updateDate(undefined);
        expect(picker.hasDate()).toBe(false);
        expect(picker.formattedDate()).toBeUndefined();
    });

    it('writeValue transforma o limpia la fecha', () => {
        picker.writeValue(new Date(2026, 5, 15));
        expect(picker.hasDate()).toBe(true);
        picker.writeValue(null);
        expect(picker.hasDate()).toBe(false);
    });

    it('reset limpia la fecha y notifica', () => {
        const onChange = jest.fn();
        picker.registerOnChange(onChange);
        picker.updateDate(new Date(2026, 5, 15));
        picker.reset();
        expect(picker.hasDate()).toBe(false);
        expect(onChange).toHaveBeenLastCalledWith(undefined);
    });

    it('open y close cambian el estado del popover', () => {
        picker.open();
        expect(state()).toBe('open');
        picker.close();
        expect(state()).toBe('closed');
    });

    it('setDisabledState bloquea updateDate', () => {
        picker.setDisabledState(true);
        expect(picker.disabledState()).toBe(true);
        picker.updateDate(new Date(2026, 5, 15));
        expect(picker.hasDate()).toBe(false);
    });

    it('_handleChange cierra el popover cuando autoCloseOnSelect está activo', () => {
        fixture.componentRef.setInput('autoCloseOnSelect', true);
        fixture.detectChanges();
        (picker as unknown as { _handleChange(v: Date): void })._handleChange(new Date(2026, 5, 15));
        expect(picker.hasDate()).toBe(true);
        expect(state()).toBe('closed');
    });

    it('touched delega en onTouched', () => {
        const onTouched = jest.fn();
        picker.registerOnTouched(onTouched);
        picker.touched();
        expect(onTouched).toHaveBeenCalled();
    });

    it('labelableId es undefined sin disparador', () => {
        expect(picker.labelableId()).toBeUndefined();
    });
});
