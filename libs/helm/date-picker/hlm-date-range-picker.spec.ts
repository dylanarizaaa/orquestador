import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmDateRangePicker } from './hlm-date-range-picker';

describe('HlmDateRangePicker', () => {
    let fixture: ComponentFixture<HlmDateRangePicker<Date>>;
    let picker: HlmDateRangePicker<Date>;

    const p = () =>
        picker as unknown as {
            _popoverState(): string | null;
            _handleStartDayChange(v: Date | undefined): void;
            _handleEndDateChange(v: Date | undefined): void;
            _onClose(): void;
            _apply(): void;
            _clear(): void;
            _start(): Date | undefined;
            _end(): Date | undefined;
        };

    const a = new Date(2026, 5, 10);
    const b = new Date(2026, 5, 20);

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HlmDateRangePicker] });
        fixture = TestBed.createComponent(HlmDateRangePicker<Date>);
        fixture.detectChanges();
        picker = fixture.componentInstance;
    });

    it('_handleStartDayChange emite la fecha de inicio', () => {
        const starts: Array<Date | undefined> = [];
        picker.startDateChange.subscribe((d) => starts.push(d));
        p()._handleStartDayChange(a);
        expect(p()._start()).toBe(a);
        expect(starts).toEqual([a]);
    });

    it('al elegir fin con inicio presente completa el rango y emite dateChange', () => {
        const onChange = jest.fn();
        picker.registerOnChange(onChange);
        const ranges: Array<[Date, Date] | null> = [];
        picker.dateChange.subscribe((r) => ranges.push(r));

        p()._handleStartDayChange(a);
        p()._handleEndDateChange(b);

        expect(picker.hasDate()).toBe(true);
        expect(picker.formattedDate()).toBeDefined();
        expect(onChange).toHaveBeenCalled();
        expect(ranges.length).toBe(1);
    });

    it('autoCloseOnEndSelection cierra al completar el rango', () => {
        fixture.componentRef.setInput('autoCloseOnEndSelection', true);
        fixture.detectChanges();
        p()._handleStartDayChange(a);
        p()._handleEndDateChange(b);
        expect(p()._popoverState()).toBe('closed');
    });

    it('deshabilitado no completa el rango', () => {
        picker.setDisabledState(true);
        p()._handleStartDayChange(a);
        p()._handleEndDateChange(b);
        expect(picker.hasDate()).toBe(true); // start sí se fija, pero no completa
    });

    it('writeValue y reset', () => {
        picker.writeValue([a, b]);
        expect(picker.hasDate()).toBe(true);
        picker.writeValue(null);
        expect(picker.hasDate()).toBe(false);

        const onChange = jest.fn();
        picker.registerOnChange(onChange);
        picker.writeValue([a, b]);
        picker.reset();
        expect(picker.hasDate()).toBe(false);
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('open/close cambian el estado del popover', () => {
        picker.open();
        expect(p()._popoverState()).toBe('open');
        picker.close();
        expect(p()._popoverState()).toBe('closed');
    });

    it('_onClose restaura el rango si quedó a medias', () => {
        picker.writeValue([a, b]);
        p()._handleEndDateChange(undefined); // deja end vacío pero mantiene mutableDate
        p()._onClose();
        expect(p()._end()).toBeDefined();
    });

    it('labelableId es undefined sin disparador', () => {
        expect(picker.labelableId()).toBeUndefined();
    });

    it('manualApply difiere el commit hasta pulsar Aplicar', () => {
        fixture.componentRef.setInput('manualApply', true);
        fixture.detectChanges();

        const onChange = jest.fn();
        picker.registerOnChange(onChange);
        const ranges: Array<[Date, Date] | null> = [];
        picker.dateChange.subscribe((r) => ranges.push(r));

        p()._handleStartDayChange(a);
        p()._handleEndDateChange(b);

        // El rango queda como borrador: se ve en el calendario pero no se confirma el valor.
        expect(picker.hasDate()).toBe(true);
        expect(onChange).not.toHaveBeenCalled();
        expect(ranges.length).toBe(0);

        p()._apply();

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(ranges).toEqual([[a, b]]);
        expect(p()._popoverState()).toBe('closed');
    });

    it('manualApply: Aplicar no confirma si el rango está incompleto', () => {
        fixture.componentRef.setInput('manualApply', true);
        fixture.detectChanges();

        const onChange = jest.fn();
        picker.registerOnChange(onChange);

        p()._handleStartDayChange(a); // solo inicio, sin fin
        p()._apply();

        expect(onChange).not.toHaveBeenCalled();
    });

    it('_clear limpia la selección y confirma el valor vacío', () => {
        fixture.componentRef.setInput('manualApply', true);
        fixture.detectChanges();
        picker.writeValue([a, b]);
        expect(picker.hasDate()).toBe(true);

        const onChange = jest.fn();
        picker.registerOnChange(onChange);
        p()._clear();

        expect(picker.hasDate()).toBe(false);
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('manualApply: cerrar sin aplicar descarta el borrador', () => {
        fixture.componentRef.setInput('manualApply', true);
        fixture.detectChanges();
        picker.writeValue([a, b]);

        // Borrador nuevo sin confirmar.
        const c = new Date(2026, 6, 1);
        const d = new Date(2026, 6, 5);
        p()._handleStartDayChange(c);
        p()._handleEndDateChange(d);
        p()._onClose();

        // Se restaura el último valor aplicado, no el borrador.
        expect(p()._start()).toEqual(a);
        expect(p()._end()).toEqual(b);
    });
});
