import { Component, signal, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HlmDatePicker,
  HlmDatePickerImports,
  HlmDatePickerMulti,
  HlmDateRangePicker,
  HlmMonthYearPicker,
  injectHlmDatePickerConfig,
  injectHlmDatePickerMultiConfig,
  injectHlmDateRangePickerConfig,
  injectHlmMonthYearPickerConfig,
  provideHlmMonthYearPickerConfig,
} from '@spartan-ng/helm/date-picker';
import { dateProviderConfig } from '../../app/core/providers/date.provider';

const ENE_2026 = new Date(2026, 0, 1);

/** Día `n` del mes actual: el rango y las fechas múltiples abren en el mes de hoy. */
const diaActual = (n: number) => {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), n);
};
const ddmmyyyy = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

/** Un selector de cada tipo con disparador (botón) y con campo de texto. */
@Component({
  imports: [HlmDatePickerImports, ReactiveFormsModule],
  template: `
    <hlm-date-picker
      #simple
      [formControl]="simple$"
      [defaultFocusedDate]="foco"
      captionLayout="dropdown"
      autoCloseOnSelect
    >
      <hlm-date-picker-trigger buttonId="simple">Fecha</hlm-date-picker-trigger>
      <p hlmDatePickerHeader>Encabezado</p>
    </hlm-date-picker>

    <hlm-date-picker #simpleInput [date]="fecha()" (dateChange)="cambios.push($event)">
      <hlm-date-picker-input inputId="simple-input" openOnClick placeholder="Fecha" />
    </hlm-date-picker>

    <hlm-date-range-picker
      #rango
      [formControl]="rango$"
      autoCloseOnEndSelection
      captionLayout="dropdown-months"
    >
      <hlm-date-picker-trigger buttonId="rango" [showTrigger]="false" variant="ghost" class="w-60">
        Rango
      </hlm-date-picker-trigger>
    </hlm-date-range-picker>

    <hlm-date-range-picker #rangoInput [date]="rangoInicial">
      <hlm-date-range-input inputId="rango-input" />
    </hlm-date-range-picker>

    <hlm-date-picker-multi
      #multi
      [formControl]="multi$"
      [maxSelection]="2"
      autoCloseOnMaxSelection
      captionLayout="dropdown-years"
    >
      <hlm-date-picker-trigger buttonId="multi" forceInvalid>Varias</hlm-date-picker-trigger>
    </hlm-date-picker-multi>

    <hlm-date-picker-multi #multiInput [date]="variasIniciales">
      <hlm-date-multi-input inputId="multi-input" />
    </hlm-date-picker-multi>

    <hlm-month-year-picker #mes [formControl]="mes$" autoCloseOnSelect>
      <hlm-date-picker-trigger buttonId="mes">Mes</hlm-date-picker-trigger>
    </hlm-month-year-picker>

    <hlm-month-year-picker #mesInput [date]="foco">
      <hlm-month-year-input inputId="mes-input" />
    </hlm-month-year-picker>

    <div hlmDatePickerAnchor></div>
  `,
})
class PickersHost {
  readonly foco = ENE_2026;
  readonly fecha = signal<Date | undefined>(undefined);
  readonly rangoInicial: [Date, Date] = [new Date(2026, 0, 5), new Date(2026, 0, 9)];
  readonly variasIniciales = [new Date(2026, 0, 5)];
  readonly cambios: (Date | null)[] = [];

  readonly simple$ = new FormControl<Date | null>(null);
  readonly rango$ = new FormControl<[Date, Date] | null>(null);
  readonly multi$ = new FormControl<Date[]>([]);
  readonly mes$ = new FormControl<Date | null>(null);

  readonly simple = viewChild.required<HlmDatePicker<Date>>('simple');
  readonly simpleInput = viewChild.required<HlmDatePicker<Date>>('simpleInput');
  readonly rango = viewChild.required<HlmDateRangePicker<Date>>('rango');
  readonly rangoInput = viewChild.required<HlmDateRangePicker<Date>>('rangoInput');
  readonly multi = viewChild.required<HlmDatePickerMulti<Date>>('multi');
  readonly multiInput = viewChild.required<HlmDatePickerMulti<Date>>('multiInput');
  readonly mes = viewChild.required<HlmMonthYearPicker<Date>>('mes');
  readonly mesInput = viewChild.required<HlmMonthYearPicker<Date>>('mesInput');
}

describe('Selectores de fecha de spartan.ng', () => {
  let fixture: ComponentFixture<PickersHost>;
  let host: PickersHost;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [...dateProviderConfig] });
    fixture = TestBed.createComponent(PickersHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const button = (id: string) => el().querySelector<HTMLButtonElement>(`#${id}`)!;
  const input = (id: string) => el().querySelector<HTMLInputElement>(`#${id}`)!;

  async function settle() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /** Botón de un día del calendario abierto (o de un mes/año en el de mes y año). */
  function cell(text: string): HTMLButtonElement {
    const buttons = [
      ...document.querySelectorAll<HTMLButtonElement>(
        '[brnCalendarCellButton], [brnMonthYearCalendarMonthButton], [brnMonthYearCalendarYearButton]',
      ),
    ];
    const found = buttons.find((b) => b.textContent?.trim() === text && !b.disabled);
    if (!found) throw new Error(`No hay celda "${text}"`);
    return found;
  }

  async function type(target: HTMLInputElement, value: string) {
    target.focus();
    target.dispatchEvent(new Event('focus'));
    target.value = value;
    target.dispatchEvent(new Event('input'));
    await settle();
  }

  async function blur(target: HTMLInputElement) {
    target.dispatchEvent(new Event('blur'));
    await settle();
  }

  async function enter(target: HTMLInputElement) {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
  }

  it('fecha simple: elige un día desde el botón y lo muestra con el formato del portal', async () => {
    expect(button('simple').textContent).toContain('Fecha');
    expect(button('simple').hasAttribute('data-placeholder')).toBe(true);

    button('simple').click();
    await settle();
    expect(document.body.textContent).toContain('Encabezado');
    cell('15').click();
    await settle();

    expect(host.simple$.value).toEqual(new Date(2026, 0, 15));
    expect(button('simple').textContent?.trim()).toBe('15/01/2026');
    expect(host.simple().hasDate()).toBe(true);
    expect(host.simple().labelableId()).toBe('simple');

    host.simple$.setValue(new Date(2026, 1, 2));
    await settle();
    expect(button('simple').textContent?.trim()).toBe('02/02/2026');

    host.simple$.disable();
    await settle();
    expect(button('simple').disabled).toBe(true);
    host.simple().updateDate(new Date(2026, 1, 3));
    expect(host.simple$.value).toEqual(new Date(2026, 1, 2));
    host.simple$.enable();

    host.simple().open();
    await settle();
    host.simple().close();
    await settle();
    expect(host.simple$.touched).toBe(true);

    host.simple().touched();
    host.simple().reset();
    expect(host.simple$.value).toBeNull();
    host.simple$.setValue(null);
  });

  it('fecha simple con campo: escribe, confirma con Enter o al salir y limpia con la X', async () => {
    const campo = input('simple-input');
    campo.click();
    await settle();
    expect(document.querySelector('hlm-calendar')).not.toBeNull();

    await type(campo, '2026-01-20T00:00:00');
    await enter(campo);
    expect(host.cambios.at(-1)).toEqual(new Date(2026, 0, 20));

    await type(campo, 'no es fecha');
    await blur(campo);
    expect(host.cambios.at(-1)).toBeNull();
    expect(campo.value).toBe('no es fecha');

    await type(campo, '');
    await blur(campo);
    expect(host.simpleInput().value()).toBeNull();

    host.fecha.set(new Date(2026, 0, 7));
    await settle();
    expect(campo.value).toBe('07/01/2026');
    campo.dispatchEvent(new Event('focus'));
    await settle();

    el().querySelector<HTMLButtonElement>('[aria-label="Clear date"]')!.click();
    await settle();
    expect(host.cambios.at(-1)).toBeNull();

    campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await settle();
    el().querySelector<HTMLButtonElement>('[aria-label="Open calendar"]')!.click();
    await settle();
    expect(document.querySelector('hlm-calendar')).not.toBeNull();
  });

  it('rango: elige inicio y fin, se cierra solo y conserva el rango al reabrir', async () => {
    button('rango').click();
    await settle();
    cell('5').click();
    await settle();
    cell('9').click();
    await settle();

    expect(host.rango$.value).toEqual([diaActual(5), diaActual(9)]);
    expect(button('rango').textContent?.trim()).toBe(
      `${ddmmyyyy(diaActual(5))} - ${ddmmyyyy(diaActual(9))}`,
    );
    expect(button('rango').querySelector('ng-icon')).toBeNull();

    // Reabrir, elegir solo el inicio y cerrar: se recupera el rango anterior.
    host.rango().open();
    await settle();
    cell('12').click();
    await settle();
    host.rango().close();
    await settle();
    expect(host.rango().value()).toEqual([diaActual(5), diaActual(9)]);

    host.rango().updateDate([new Date(2026, 0, 1), new Date(2026, 0, 3)]);
    expect(host.rango$.value).toEqual([new Date(2026, 0, 1), new Date(2026, 0, 3)]);
    host.rango().updateDate(null);
    expect(host.rango$.value).toBeNull();

    host.rango$.setValue([new Date(2026, 0, 2), new Date(2026, 0, 4)]);
    host.rango$.setValue(null);
    host.rango$.disable();
    await settle();
    host.rango().updateDate([new Date(2026, 0, 1), new Date(2026, 0, 3)]);
    expect(host.rango$.value).toBeNull();
    host.rango$.enable();
    host.rango().touched();
    host.rango().reset();
    expect(host.rango().hasDate()).toBe(false);
  });

  it('rango con campo: interpreta el texto y lo vuelve a mostrar al salir', async () => {
    const campo = input('rango-input');
    expect(campo.value).toBe('05/01/2026 - 09/01/2026');

    await type(campo, '2026-02-01T00:00:00 - 2026-02-03T00:00:00');
    await blur(campo);
    expect(host.rangoInput().value()).toEqual([new Date(2026, 1, 1), new Date(2026, 1, 3)]);

    campo.dispatchEvent(new Event('focus'));
    await settle();
    await enter(campo);
    expect(host.rangoInput().hasDate()).toBe(true);
  });

  it('varias fechas: respeta el máximo y se cierra al alcanzarlo', async () => {
    expect(button('multi').getAttribute('data-matches-spartan-invalid')).toBe('true');
    button('multi').click();
    await settle();
    cell('3').click();
    await settle();
    cell('4').click();
    await settle();

    expect(host.multi$.value).toEqual([diaActual(3), diaActual(4)]);
    expect(button('multi').textContent?.trim()).toBe(
      `${ddmmyyyy(diaActual(3))}, ${ddmmyyyy(diaActual(4))}`,
    );

    host.multi$.setValue([new Date(2026, 0, 8)]);
    host.multi().updateDate(null);
    expect(host.multi$.value).toEqual([]);
    host.multi$.disable();
    await settle();
    host.multi().updateDate([new Date(2026, 0, 8)]);
    expect(host.multi$.value).toEqual([]);
    host.multi$.enable();
    host.multi().open();
    await settle();
    host.multi().close();
    await settle();
    host.multi().touched();
    host.multi().reset();
    expect(host.multi().hasDate()).toBe(false);
  });

  it('varias fechas con campo: separa por comas y valida cada fecha', async () => {
    const campo = input('multi-input');
    expect(campo.value).toBe('05/01/2026');

    campo.dispatchEvent(new Event('focus'));
    await settle();
    expect(campo.value).toBe('05/01/2026');

    await type(campo, '10/01/2026, 11/01/2026');
    await blur(campo);
    expect(host.multiInput().value()).toEqual([new Date(2026, 0, 10), new Date(2026, 0, 11)]);

    await type(campo, '10/01/2026, 99/99/2026');
    await blur(campo);
    expect(host.multiInput().value()).toBeNull();
  });

  it('mes y año: elige año y mes, y lo muestra como MM/AAAA', async () => {
    button('mes').click();
    await settle();
    // Encabezado: pasa a la vista de años y vuelve a la de meses.
    document.querySelector<HTMLButtonElement>('[brnMonthYearCalendarHeader]')?.click();
    await settle();
    document.querySelector<HTMLButtonElement>('[brnMonthYearCalendarNextButton]')?.click();
    document.querySelector<HTMLButtonElement>('[brnMonthYearCalendarPreviousButton]')?.click();
    await settle();
    cell(String(new Date().getFullYear())).click();
    await settle();
    cell('Mar').click();
    await settle();

    expect(host.mes$.value?.getMonth()).toBe(2);
    expect(button('mes').textContent?.trim()).toMatch(/^03\/\d{4}$/);

    host.mes$.setValue(null);
    host.mes$.disable();
    await settle();
    host.mes().updateDate(new Date(2026, 4, 1));
    expect(host.mes$.value).toBeNull();
    host.mes$.enable();
    host.mes().open();
    await settle();
    host.mes().close();
    await settle();
    host.mes().touched();
    host.mes().reset();
    expect(host.mes().hasDate()).toBe(false);
  });

  it('mes y año con campo: interpreta MM/AAAA y rechaza valores inválidos', async () => {
    const campo = input('mes-input');
    expect(campo.value).toBe('01/2026');

    await type(campo, '04/2025');
    await blur(campo);
    expect(host.mesInput().value()).toEqual(new Date(2025, 3, 1));

    for (const invalido of ['13/2025', 'abril']) {
      await type(campo, invalido);
      await blur(campo);
      expect(host.mesInput().value()).toBeNull();
    }
  });
});

describe('Configuración de los selectores de fecha', () => {
  it('sin proveedor usan los formatos por defecto de spartan.ng', async () => {
    const fixture = TestBed.createComponent(PickersHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.componentInstance;

    host.simple$.setValue(new Date(2026, 0, 15));
    host.rango$.setValue([new Date(2026, 0, 1), new Date(2026, 0, 2)]);
    host.multi$.setValue([new Date(2026, 0, 3)]);
    host.mes$.setValue(new Date(2026, 5, 1));
    fixture.detectChanges();

    const text = (id: string) =>
      (fixture.nativeElement as HTMLElement).querySelector(`#${id}`)?.textContent?.trim();
    expect(text('simple')).toBe(new Date(2026, 0, 15).toDateString());
    expect(text('rango')).toBe(
      `${new Date(2026, 0, 1).toDateString()} - ${new Date(2026, 0, 2).toDateString()}`,
    );
    expect(text('multi')).toBe(new Date(2026, 0, 3).toDateString());
    expect(text('mes')).toBe('06/2026');

    const rango = host.rangoInput();
    const campo = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#rango-input',
    )!;
    for (const [valor, esperado] of [
      ['no', null],
      ['2026-01-01T00:00:00', [new Date(2026, 0, 1), new Date(2026, 0, 1)]],
      ['2026-01-01T00:00:00 - no', [new Date(2026, 0, 1), new Date(2026, 0, 1)]],
      ['a - b - c', null],
    ] as const) {
      campo.value = valor;
      campo.dispatchEvent(new Event('input'));
      campo.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      expect(rango.value()).toEqual(esperado);
    }

    const simple = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#simple-input',
    )!;
    simple.value = '2026-03-01T00:00:00';
    simple.dispatchEvent(new Event('input'));
    simple.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.simpleInput().value()).toEqual(new Date(2026, 2, 1));
  });

  it('acepta configuración propia del selector de mes', () => {
    TestBed.configureTestingModule({
      providers: [provideHlmMonthYearPickerConfig<Date>({ formatDate: () => 'mes propio' })],
    });
    const fixture = TestBed.createComponent(PickersHost);
    fixture.componentInstance.mes$.setValue(new Date(2026, 0, 1));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('#mes')?.textContent?.trim()).toBe(
      'mes propio',
    );
  });
});

/** Campos de texto enlazados a controles obligatorios, para el estado inválido. */
@Component({
  imports: [HlmDatePickerImports, ReactiveFormsModule],
  template: `
    <hlm-date-picker [formControl]="simple"
      ><hlm-date-picker-input inputId="i-simple"
    /></hlm-date-picker>
    <hlm-date-range-picker [formControl]="rango"
      ><hlm-date-range-input inputId="i-rango"
    /></hlm-date-range-picker>
    <hlm-date-picker-multi [formControl]="multi"
      ><hlm-date-multi-input inputId="i-multi"
    /></hlm-date-picker-multi>
    <hlm-month-year-picker [formControl]="mes"
      ><hlm-month-year-input inputId="i-mes"
    /></hlm-month-year-picker>
    <hlm-date-picker [formControl]="boton"
      ><hlm-date-picker-trigger buttonId="i-boton">F</hlm-date-picker-trigger></hlm-date-picker
    >
  `,
})
class InvalidosHost {
  readonly simple = new FormControl<Date | null>(null, Validators.required);
  readonly rango = new FormControl<[Date, Date] | null>(null, Validators.required);
  readonly multi = new FormControl<Date[] | null>(null, Validators.required);
  readonly mes = new FormControl<Date | null>(null, Validators.required);
  readonly boton = new FormControl<Date | null>(null, Validators.required);
}

describe('Casos límite de los selectores de fecha', () => {
  it('se marcan inválidos cuando el control obligatorio está vacío y tocado', async () => {
    const fixture = TestBed.createComponent(InvalidosHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.componentInstance;
    for (const control of [host.simple, host.rango, host.multi, host.mes, host.boton]) {
      control.markAsTouched();
      control.markAsDirty();
      control.setValue(null);
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const boton = (fixture.nativeElement as HTMLElement).querySelector('#i-boton')!;
    expect(boton.getAttribute('aria-invalid')).toBe('true');
    for (const id of ['i-simple', 'i-rango', 'i-multi', 'i-mes', 'i-boton']) {
      const campo = (fixture.nativeElement as HTMLElement).querySelector(`#${id}`)!;
      // El campo de texto delega `aria-invalid` en `hlmInputGroupInput`; el estado se refleja aquí.
      expect([id, campo.getAttribute('data-matches-spartan-invalid')]).toEqual([id, 'true']);
      expect([id, campo.getAttribute('data-touched')]).toEqual([id, 'true']);
    }
  });

  it('ignoran selecciones con el selector deshabilitado y exponen el id de su disparador', async () => {
    const fixture = TestBed.createComponent(PickersHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.componentInstance;

    type Interno = {
      _handleChange(v: unknown): void;
      _handleEndDateChange(v: unknown): void;
      setDisabledState(d: boolean): void;
    };
    const simple = host.simpleInput() as unknown as Interno;
    const multi = host.multiInput() as unknown as Interno;
    const rango = host.rangoInput() as unknown as Interno;
    const mes = host.mesInput() as unknown as Interno;

    // Sin cierre automático la selección no cierra el calendario.
    simple._handleChange(undefined);
    expect(host.simpleInput().value()).toBeNull();
    mes._handleChange(undefined);
    expect(host.mesInput().value()).toBeNull();
    multi._handleChange(undefined);
    multi._handleChange([new Date(2026, 0, 2)]);
    expect(host.multiInput().value()).toEqual([new Date(2026, 0, 2)]);
    rango._handleEndDateChange(new Date(2026, 0, 20));
    expect(host.rangoInput().value()?.[1]).toEqual(new Date(2026, 0, 20));

    for (const picker of [simple, multi, rango, mes]) picker.setDisabledState(true);
    simple._handleChange(new Date(2026, 0, 3));
    mes._handleChange(new Date(2026, 0, 3));
    multi._handleChange([new Date(2026, 0, 3)]);
    rango._handleEndDateChange(new Date(2026, 0, 21));
    expect(host.simpleInput().value()).toBeNull();
    expect(host.multiInput().value()).toEqual([new Date(2026, 0, 2)]);
    expect(host.rangoInput().value()?.[1]).toEqual(new Date(2026, 0, 20));

    host.multi().writeValue(null);
    expect(host.multi().value()).toBeNull();
    expect(host.rango().labelableId()).toBe('rango');
    expect(host.multi().labelableId()).toBe('multi');
    expect(host.mes().labelableId()).toBe('mes');
  });

  it('los formatos por defecto aceptan valores que no son Date y validan el texto', () => {
    const [simple, rango, multi, mes] = TestBed.runInInjectionContext(() => [
      injectHlmDatePickerConfig<string>(),
      injectHlmDateRangePickerConfig<string>(),
      injectHlmDatePickerMultiConfig<string>(),
      injectHlmMonthYearPickerConfig<string>(),
    ]);

    expect(simple.formatDate('hoy')).toBe('hoy');
    expect(simple.formatInputDate('hoy')).toBe('hoy');
    expect(rango.formatDates(['a', 'b'])).toBe('a - b');
    expect(rango.formatInputDates(['a', null])).toBe('a');
    expect(rango.parseDate(5 as unknown as string)).toBeNull();
    expect(multi.formatDates(['a', 'b'])).toBe('a, b');
    expect(multi.formatInputDates(['a'])).toBe('a');
    expect(multi.parseDate(5 as unknown as string)).toBeNull();
    for (const invalido of ['ayer', '32/01/2026', '31/02/2026']) {
      expect([invalido, multi.parseDate(invalido)]).toEqual([invalido, null]);
    }
    expect(mes.formatDate('enero')).toBe('enero');
    expect(mes.parseDate(5 as unknown as string)).toBeNull();
  });
});
