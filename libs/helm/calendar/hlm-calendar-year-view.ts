import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { injectDateAdapter } from '@brain/date-time';
import { buttonVariants } from '@helm/button';
import { hlm } from '../utils';

/**
 * Presentational year grid used by the calendars when the header is drilled down from the months view.
 * Shows a single decade (with the leading/trailing year dimmed) and emits the first day of the selected
 * year. When `rangeStart`/`rangeEnd` are provided, the years covered by that range are highlighted.
 */
@Component({
  selector: 'hlm-calendar-year-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-slot': 'calendar-year-view' },
  template: `
		<div class="grid w-56 grid-cols-4 gap-y-3 place-items-center pt-2" role="group" aria-label="Select year">
			@for (year of _years(); track year.value) {
				<button
					type="button"
					[class]="_btnClass"
					[attr.aria-pressed]="year.selected"
					[attr.data-selected]="year.selected ? '' : null"
					[attr.data-range-start]="year.rangeStart ? '' : null"
					[attr.data-range-end]="year.rangeEnd ? '' : null"
					[attr.data-range-between]="year.between ? '' : null"
					[attr.data-today]="year.current && !year.selected && !year.between ? '' : null"
					[attr.data-outside]="year.outside ? '' : null"
					[disabled]="year.disabled"
					(click)="yearSelected.emit(year.date)"
				>
					{{ year.value }}
				</button>
			}
		</div>
	`,
})
export class HlmCalendarYearView<T> {
  /** Access the date time adapter */
  protected readonly _dateAdapter = injectDateAdapter<T>();

  /** The date whose year is currently focused (defines the panel's decade). */
  public readonly focusedDate = input.required<T>();

  /** The minimum date that can be selected. */
  public readonly min = input<T>();

  /** The maximum date that can be selected. */
  public readonly max = input<T>();

  /** The start of the currently selected range, if any. */
  public readonly rangeStart = input<T>();

  /** The end of the currently selected range, if any. */
  public readonly rangeEnd = input<T>();

  /** Emits the first day of the selected year. */
  public readonly yearSelected = output<T>();

  protected readonly _years = computed(() => {
    const adapter = this._dateAdapter;
    const focused = this.focusedDate();
    const focusedYear = adapter.getYear(focused);
    const currentYear = adapter.getYear(adapter.now());
    const decadeStart = Math.floor(focusedYear / 10) * 10;
    const min = this.min();
    const max = this.max();
    const minYear = min ? adapter.getYear(min) : undefined;
    const maxYear = max ? adapter.getYear(max) : undefined;
    const start = this.rangeStart();
    const end = this.rangeEnd();
    const hasRange = start !== undefined || end !== undefined;
    const startYear = start ? adapter.getYear(start) : undefined;
    const endYear = end ? adapter.getYear(end) : undefined;

    // 12 cells: the 10 years of the decade plus one leading and one trailing year to fill the grid.
    return Array.from({ length: 12 }, (_, i) => {
      const value = decadeStart - 1 + i;
      const isStart = startYear !== undefined && value === startYear;
      const isEnd = endYear !== undefined && value === endYear;
      const between = startYear !== undefined && endYear !== undefined && value > startYear && value < endYear;

      return {
        value,
        date: adapter.set(focused, { year: value, day: 1 }),
        rangeStart: isStart,
        rangeEnd: isEnd,
        between,
        selected: hasRange ? isStart || isEnd : value === focusedYear,
        current: value === currentYear,
        outside: value < decadeStart || value > decadeStart + 9,
        disabled: (minYear !== undefined && value < minYear) || (maxYear !== undefined && value > maxYear),
      };
    });
  });

  protected readonly _btnClass = hlm(
    buttonVariants({ variant: 'ghost' }),
    'size-12 rounded-full text-sm font-normal',
    'data-[outside]:text-muted-foreground data-[outside]:opacity-50',
    'data-[range-between]:bg-accent-foreground data-[range-between]:text-accent',
    'data-[today]:text-tertiary',
    'data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:hover:bg-accent data-[selected]:hover:text-accent-foreground data-[selected]:focus:bg-accent data-[selected]:focus:text-accent-foreground',
    'disabled:pointer-events-none disabled:opacity-50',
    'dark:hover:text-accent-foreground',
  );
}
