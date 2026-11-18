import type { BooleanInput } from '@angular/cdk/coercion';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	contentChild,
	forwardRef,
	input,
	linkedSignal,
	output,
	signal,
	untracked,
	viewChild,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrnFieldControl, provideBrnLabelable } from '@brain/field';
import { BrnPopover } from '@brain/popover'
import type { ChangeFn, TouchFn } from '@brain/forms'
import type { BrnOverlayState } from '@brain/overlay';
import { HlmButton } from '@helm/button';
import { HlmCalendarRange } from '@helm/calendar';
import { HlmPopoverImports } from '@helm/popover';
import { HlmDatePickerTriggerToken } from './hlm-date-picker-trigger.token';
import { HlmDatePickerBase, provideHlmDatePicker } from './hlm-date-picker.token';
import { injectHlmDateRangePickerConfig } from './hlm-date-range-picker.token';

export const HLM_DATE_RANGE_PICKER_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => HlmDateRangePicker),
	multi: true,
};

@Component({
	selector: 'hlm-date-range-picker',
	imports: [HlmPopoverImports, HlmCalendarRange, HlmButton],
	providers: [
		HLM_DATE_RANGE_PICKER_VALUE_ACCESSOR,
		provideHlmDatePicker(HlmDateRangePicker),
		provideBrnLabelable(HlmDateRangePicker),
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [BrnFieldControl],
	host: { class: 'block' },
	template: `
		<hlm-popover
			sideOffset="5"
			[state]="_popoverState()"
			(stateChanged)="_popoverState.set($event)"
			(closed)="_onClose(); _onTouched?.(); closed.emit()"
		>
			<ng-content />

			<hlm-popover-content class="w-fit p-0" *hlmPopoverPortal="let ctx">
				<ng-content select="[hlmDatePickerHeader]" />
				<hlm-calendar-range
					calendarClass="border-0 rounded-none"
					[startDate]="_start()"
					[captionLayout]="captionLayout()"
					[endDate]="_end()"
					[min]="min()"
					[max]="max()"
					[disabled]="_disabled()"
					(startDateChange)="_handleStartDayChange($event)"
					(endDateChange)="_handleEndDateChange($event)"
				/>
				<ng-content select="[hlmDatePickerFooter]" />
				@if (manualApply()) {
					<div class="flex items-center justify-end gap-2 p-3">
						<button hlmBtn type="button" variant="ghost" class="text-accent" (click)="_clear()">{{ clearLabel() }}</button>
						<button hlmBtn type="button" [disabled]="!_canApply()" (click)="_apply()">{{ applyLabel() }}</button>
					</div>
				}
			</hlm-popover-content>
		</hlm-popover>
	`,
})
export class HlmDateRangePicker<T> implements HlmDatePickerBase<T>, ControlValueAccessor {
	private readonly _config = injectHlmDateRangePickerConfig<T>();

	public readonly popover = viewChild.required(BrnPopover);

	private readonly _trigger = contentChild(HlmDatePickerTriggerToken);

	/** Show dropdowns to navigate between months or years. */
	public readonly captionLayout = input<'dropdown' | 'label' | 'dropdown-months' | 'dropdown-years'>('label');

	/** The minimum date that can be selected.*/
	public readonly min = input<T>();

	/** The maximum date that can be selected. */
	public readonly max = input<T>();

	/** Determine if the date picker is disabled. */
	public readonly disabled = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	/** The selected value. */
	public readonly date = input<[T, T]>();

	protected readonly _mutableDate = linkedSignal(this.date);

	protected readonly _start = linkedSignal(() => this._mutableDate()?.[0]);
	protected readonly _end = linkedSignal(() => this._mutableDate()?.[1]);

	/** If true, the date picker will close when the end date is selected */
	public readonly autoCloseOnEndSelection = input<boolean, BooleanInput>(this._config.autoCloseOnEndSelection, {
		transform: booleanAttribute,
	});

	/**
	 * If true, selecting a range does NOT commit the value: it stays as a draft until the user
	 * confirms with the "Apply" button. Also renders a footer with "Clear" and "Apply" actions.
	 */
	public readonly manualApply = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	/** Label for the confirm action shown when `manualApply` is enabled. */
	public readonly applyLabel = input('Aplicar');

	/** Label for the clear action shown when `manualApply` is enabled. */
	public readonly clearLabel = input('Limpiar');

	/** True when the current draft selection is a complete, enabled range that can be applied. */
	protected readonly _canApply = computed(() => !!this._start() && !!this._end() && !this._disabled());

	/** Defines how the date should be displayed in the UI.  */
	public readonly formatDates = input<(dates: [T | undefined, T | undefined]) => string>(this._config.formatDates);

	/** Defines how the date should be transformed before saving to model/form. */
	public readonly transformDates = input<(date: [T, T]) => [T, T]>(this._config.transformDates);

	protected readonly _popoverState = signal<BrnOverlayState | null>(null);

	protected readonly _disabled = linkedSignal(this.disabled);

	/** @internal The disabled state as a readonly signal */
	public readonly disabledState = this._disabled.asReadonly();

	public readonly formattedDate = computed(() => {
		const start = this._start();
		const end = this._end();
		return start || end ? this.formatDates()([start, end]) : undefined;
	});

	public readonly dateChange = output<[T, T] | null>();

	/** Emits the start date as soon as it is picked (before the range is completed). */
	public readonly startDateChange = output<T | undefined>();

	/** Emits when the picker popover closes (whether or not a full range was selected). */
	public readonly closed = output<void>();

	public readonly labelableId = computed(() => this._trigger()?.triggerId());

	public readonly hasDate = computed(() => !!this._start() || !!this._end());

	protected _onChange?: ChangeFn<[T, T] | null>;
	protected _onTouched?: TouchFn;

	protected _handleStartDayChange(value: T | undefined) {
		this._start.set(value);
		this.startDateChange.emit(value);
	}

	protected _handleEndDateChange(value: T | undefined): void {
		this._end.set(value);
		if (this._disabled()) return;
		// En modo `manualApply` la selección queda como borrador hasta pulsar "Aplicar".
		if (this.manualApply()) return;

		const start = this._start();
		if (start && value) {
			this._commit([start, value]);

			if (this.autoCloseOnEndSelection()) {
				this._popoverState.set('closed');
			}
		}
	}

	/** Persiste el rango en el modelo/formulario y notifica a los suscriptores. */
	private _commit(range: [T, T]): void {
		const transformedDates = this.transformDates()(range);
		this._mutableDate.set(transformedDates);
		this.dateChange.emit(transformedDates);
		this._onChange?.(transformedDates);
	}

	/** Confirma el borrador de selección (botón "Aplicar") y cierra el calendario. */
	protected _apply(): void {
		const start = this._start();
		const end = this._end();
		if (!start || !end || this._disabled()) return;
		this._commit([start, end]);
		this._popoverState.set('closed');
	}

	/** Limpia la selección y el valor confirmado (botón "Limpiar"), dejando el calendario abierto. */
	protected _clear(): void {
		this._start.set(undefined);
		this._end.set(undefined);
		this._mutableDate.set(undefined);
		this.dateChange.emit(null);
		this._onChange?.(null);
	}

	/** CONTROL VALUE ACCESSOR */
	public writeValue(value: [T, T] | null): void {
		untracked(() => {
			if (!value) {
				this._mutableDate.set(undefined);
			} else {
				this._mutableDate.set(this.transformDates()(value));
			}
		});
	}

	public registerOnChange(fn: ChangeFn<[T, T] | null>): void {
		this._onChange = fn;
	}

	public registerOnTouched(fn: TouchFn): void {
		this._onTouched = fn;
	}

	public setDisabledState(isDisabled: boolean): void {
		this._disabled.set(isDisabled);
	}

	public open() {
		this._popoverState.set('open');
	}

	public close() {
		this._popoverState.set('closed');
	}

	public reset() {
		this._mutableDate.set(undefined);
		this._start.set(undefined);
		this._end.set(undefined);
		this._onChange?.(null);
		this.dateChange.emit(null);
	}

	protected _onClose(): void {
		const dates = this._mutableDate();
		// En modo `manualApply`, cerrar sin confirmar descarta el borrador y restaura lo aplicado.
		if (this.manualApply()) {
			this._start.set(dates?.[0]);
			this._end.set(dates?.[1]);
			return;
		}
		if (this._start() && !this._end() && dates) {
			this._start.set(dates[0]);
			this._end.set(dates[1]);
		}
	}
}
