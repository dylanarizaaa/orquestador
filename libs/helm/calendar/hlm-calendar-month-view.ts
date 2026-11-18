import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { injectBrnCalendarI18n } from '@brain/calendar';
import { injectDateAdapter } from '@brain/date-time';
import { buttonVariants } from '@helm/button';
import { hlm } from '../utils';

/**
 * Presentational month grid used by the calendars when the header is drilled down from the days view.
 * Emits the first day of the month the user selects (so callers don't need to know the panel's year).
 * When `rangeStart`/`rangeEnd` are provided, the months covered by that range are highlighted, mirroring
 * the days view; otherwise the focused month is highlighted (single-date calendars).
 */
@Component({
  selector: 'hlm-calendar-month-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-slot': 'calendar-month-view' },
  template: `
		<div class="grid w-56 grid-cols-4 gap-y-4 gap-x-8 place-items-center pt-2" role="group" aria-label="Select month">
			@for (month of _months(); track month.index) {
				<button
					type="button"
					[class]="_btnClass"
					[attr.aria-pressed]="month.selected"
					[attr.data-selected]="month.selected ? '' : null"
					[attr.data-range-start]="month.rangeStart ? '' : null"
					[attr.data-range-end]="month.rangeEnd ? '' : null"
					[attr.data-range-between]="month.between ? '' : null"
					[attr.data-today]="month.current && !month.selected && !month.between ? '' : null"
					[disabled]="month.disabled"
					(click)="monthSelected.emit(month.date)"
				>
					{{ month.label }}
				</button>
			}
		</div>
	`,
})
export class HlmCalendarMonthView<T> {
  /** Access the calendar i18n */
  protected readonly _i18n = injectBrnCalendarI18n();

  /** Access the date time adapter */
  protected readonly _dateAdapter = injectDateAdapter<T>();

  /** The date whose month/year is currently focused (defines the panel's year). */
  public readonly focusedDate = input.required<T>();

  /** The minimum date that can be selected. */
  public readonly min = input<T>();

  /** The maximum date that can be selected. */
  public readonly max = input<T>();

  /** The start of the currently selected range, if any. */
  public readonly rangeStart = input<T>();

  /** The end of the currently selected range, if any. */
  public readonly rangeEnd = input<T>();

  /** Emits the first day of the selected month. */
  public readonly monthSelected = output<T>();

  protected readonly _months = computed(() => {
    const adapter = this._dateAdapter;
    const focused = this.focusedDate();
    const year = adapter.getYear(focused);
    const focusedMonth = adapter.getMonth(focused);
    const now = adapter.now();
    const min = this.min();
    const max = this.max();
    const start = this.rangeStart();
    const end = this.rangeEnd();
    const hasRange = start !== undefined || end !== undefined;

    // compare months as a single ordinal so range maths ignores the day component.
    const ordinal = (y: number, m: number) => y * 12 + m;
    const startOrd = start ? ordinal(adapter.getYear(start), adapter.getMonth(start)) : undefined;
    const endOrd = end ? ordinal(adapter.getYear(end), adapter.getMonth(end)) : undefined;

    return this._i18n
      .config()
      .months()
      .map((label, index) => {
        const date = adapter.set(focused, { month: index, day: 1 });
        const ord = ordinal(year, index);
        const isStart = startOrd !== undefined && ord === startOrd;
        const isEnd = endOrd !== undefined && ord === endOrd;
        const between = startOrd !== undefined && endOrd !== undefined && ord > startOrd && ord < endOrd;
        const beforeMin = min ? adapter.isBefore(adapter.endOfMonth(date), adapter.startOfDay(min)) : false;
        const afterMax = max ? adapter.isAfter(date, adapter.endOfDay(max)) : false;

        return {
          index,
          label,
          date,
          rangeStart: isStart,
          rangeEnd: isEnd,
          between,
          selected: hasRange ? isStart || isEnd : index === focusedMonth,
          current: adapter.getYear(now) === year && adapter.getMonth(now) === index,
          disabled: beforeMin || afterMax,
        };
      });
  });

  protected readonly _btnClass = hlm(
    buttonVariants({ variant: 'ghost' }),
    'size-12 rounded-full text-sm font-normal',
    'data-[range-between]:bg-accent-foreground data-[range-between]:text-accent',
    'data-[today]:text-tertiary',
    'data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:hover:bg-accent data-[selected]:hover:text-accent-foreground data-[selected]:focus:bg-accent data-[selected]:focus:text-accent-foreground',
    'disabled:pointer-events-none disabled:opacity-50',
    'dark:hover:text-accent-foreground',
  );
}
