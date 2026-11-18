import { TestBed } from '@angular/core/testing';
import { injectBrnDialogDefaultOptions } from '@brain/dialog';
import { injectBrnOverlayDefaultOptions } from '@brain/overlay';
import { injectBrnPopoverConfig, injectBrnPopoverDefaultOptions } from '@brain/popover';
import { injectBrnSelectConfig } from '@brain/select';
import { injectBrnSeparatorConfig } from '@brain/separator';
import {
    injectHlmDatePickerConfig,
    injectHlmDatePickerMultiConfig,
    injectHlmDateRangePickerConfig,
} from '@helm/date-picker';
import { injectHlmIconConfig } from '@helm/icon';

describe('Tokens: configuración por defecto sin proveedor', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    const run = <T>(fn: () => T): T => TestBed.runInInjectionContext(fn);

    it('todas las funciones inject devuelven una configuración por defecto', () => {
        expect(run(() => injectBrnSelectConfig())).toBeDefined();
        expect(run(() => injectBrnOverlayDefaultOptions())).toBeDefined();
        expect(run(() => injectBrnDialogDefaultOptions())).toBeDefined();
        expect(run(() => injectBrnPopoverConfig())).toBeDefined();
        expect(run(() => injectBrnPopoverDefaultOptions())).toBeDefined();
        expect(run(() => injectBrnSeparatorConfig())).toBeDefined();
        expect(run(() => injectHlmDatePickerConfig())).toBeDefined();
        expect(run(() => injectHlmDatePickerMultiConfig())).toBeDefined();
        expect(run(() => injectHlmDateRangePickerConfig())).toBeDefined();
        expect(run(() => injectHlmIconConfig())).toBeDefined();
    });
});
