import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HlmDatePicker } from './hlm-date-picker';
import { HlmDatePickerInput } from './hlm-date-picker-input';

@Component({
    template: `<hlm-date-picker>
        <hlm-date-picker-input [showClear]="showClear()" [openOnClick]="openOnClick()" [parseDate]="parseDate()" />
    </hlm-date-picker>`,
    imports: [HlmDatePicker, HlmDatePickerInput],
})
class HostComponent {
    showClear = signal(true);
    openOnClick = signal(false);
    parseDate = signal<(v: string) => Date | undefined>((v) => (v === 'valid' ? new Date(2026, 5, 15) : undefined));
}

interface ProtectedInput {
    _inputValue(): string;
    _showClearButton(): boolean;
    _handleInputChange(event: { target: { value: string } }): void;
    _commitDate(): void;
    _clear(): void;
    _handleEnter(event: Event): void;
    _open(): void;
    _handleClick(): void;
}

describe('HlmDatePickerInput', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let input: HlmDatePickerInput<Date>;
    let picker: HlmDatePicker<Date>;

    const prot = () => input as unknown as ProtectedInput;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        input = fixture.debugElement.query(By.directive(HlmDatePickerInput)).componentInstance as HlmDatePickerInput<Date>;
        picker = fixture.debugElement.query(By.directive(HlmDatePicker)).componentInstance as HlmDatePicker<Date>;
    });

    it('al escribir actualiza el valor y muestra el botón de limpiar', () => {
        prot()._handleInputChange({ target: { value: 'valid' } });
        fixture.detectChanges();
        expect(prot()._inputValue()).toBe('valid');
        expect(prot()._showClearButton()).toBe(true);
    });

    it('_commitDate con texto válido fija la fecha en el picker', () => {
        prot()._handleInputChange({ target: { value: 'valid' } });
        prot()._commitDate();
        expect(picker.hasDate()).toBe(true);
    });

    it('_commitDate con texto inválido limpia la fecha pero conserva el texto', () => {
        prot()._handleInputChange({ target: { value: 'bad' } });
        prot()._commitDate();
        expect(picker.hasDate()).toBe(false);
        expect(prot()._inputValue()).toBe('bad');
    });

    it('_commitDate con texto vacío limpia la fecha', () => {
        prot()._handleInputChange({ target: { value: '' } });
        prot()._commitDate();
        expect(picker.hasDate()).toBe(false);
    });

    it('_clear vacía el input y limpia el picker', () => {
        prot()._handleInputChange({ target: { value: 'valid' } });
        prot()._commitDate();
        prot()._clear();
        expect(prot()._inputValue()).toBe('');
        expect(picker.hasDate()).toBe(false);
    });

    it('_handleEnter confirma y cierra el popover', () => {
        prot()._handleInputChange({ target: { value: 'valid' } });
        expect(() => prot()._handleEnter(new KeyboardEvent('keydown', { key: 'Enter' }))).not.toThrow();
        expect(picker.hasDate()).toBe(true);
    });

    it('_handleClick abre el popover solo cuando openOnClick está activo', () => {
        expect(() => prot()._handleClick()).not.toThrow();
        host.openOnClick.set(true);
        fixture.detectChanges();
        expect(() => prot()._handleClick()).not.toThrow();
        expect(() => prot()._open()).not.toThrow();
    });
});
