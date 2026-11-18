import type { AbstractControl } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { ErrorStateMatcher, provideErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from './error-options';

function ngForm(submitted: boolean): NgForm {
    const form = Object.create(NgForm.prototype) as NgForm;
    // `submitted` es un getter en el prototipo: definimos una propiedad propia que lo sombrea.
    Object.defineProperty(form, 'submitted', { value: submitted, configurable: true });
    return form;
}

const control = (state: Partial<AbstractControl>) => state as AbstractControl;

describe('ErrorStateMatcher (por defecto: inválido + touched)', () => {
    const matcher = new ErrorStateMatcher();

    it('false si no hay control', () => {
        expect(matcher.isInvalid(null, null)).toBe(false);
    });

    it('false si el control es válido', () => {
        expect(matcher.isInvalid(control({ invalid: false }), null)).toBe(false);
    });

    it('true si es inválido y touched', () => {
        expect(matcher.isInvalid(control({ invalid: true, touched: true }), null)).toBe(true);
    });

    it('true si es inválido, no touched, pero el NgForm fue enviado', () => {
        expect(matcher.isInvalid(control({ invalid: true, touched: false }), ngForm(true))).toBe(true);
    });

    it('false si es inválido, no touched y el NgForm no fue enviado', () => {
        expect(matcher.isInvalid(control({ invalid: true, touched: false }), ngForm(false))).toBe(false);
    });

    it('false si es inválido, no touched y el form no es un NgForm', () => {
        expect(matcher.isInvalid(control({ invalid: true, touched: false }), {} as never)).toBe(false);
    });
});

describe('ShowOnDirtyErrorStateMatcher (inválido + dirty)', () => {
    const matcher = new ShowOnDirtyErrorStateMatcher();

    it('true si es inválido y dirty', () => {
        expect(matcher.isInvalid(control({ invalid: true, dirty: true }), null)).toBe(true);
    });

    it('true si es inválido, no dirty, pero el NgForm fue enviado', () => {
        expect(matcher.isInvalid(control({ invalid: true, dirty: false }), ngForm(true))).toBe(true);
    });

    it('false si es inválido, no dirty y el NgForm no fue enviado', () => {
        expect(matcher.isInvalid(control({ invalid: true, dirty: false }), ngForm(false))).toBe(false);
    });

    it('false si no hay control', () => {
        expect(matcher.isInvalid(null, null)).toBe(false);
    });
});

describe('provideErrorStateMatcher', () => {
    it('crea un proveedor useClass con el token ErrorStateMatcher', () => {
        expect(provideErrorStateMatcher(ShowOnDirtyErrorStateMatcher)).toEqual({
            provide: ErrorStateMatcher,
            useClass: ShowOnDirtyErrorStateMatcher,
        });
    });
});
