import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import { injectDateAdapter } from '../date-time';
import { injectBrnCalendar } from './brn-calendar.token';

@Directive({
	selector: 'button[brnCalendarCellButton]',
	host: {
		role: 'gridcell',
		'[tabindex]': 'focusable() ? 0 : -1',
		type: 'button',
		'[attr.data-outside]': "!selected() && outside() && (!end() && !start())? '' : null",
		'[attr.data-today]': "today() && !selected() ? '' : null",
		'[attr.data-selected]': "selected() ? '' : null",
		'[attr.data-disabled]': "disabled() ? '' : null",
		'[attr.aria-selected]': "selected() ? 'true' : null",
		'[attr.aria-disabled]': "disabled() ? 'true' : null",
		'[attr.data-range-start]': 'start() ? "" : null',
		'[attr.data-range-end]': 'end() ? "" : null',
		'[attr.data-highlighted]': 'highlighted() ? "" : null',
		'[attr.data-range-between]': 'betweenRange() ? "" : null',
		'[disabled]': 'disabled()',
		'(click)': '_calendar.selectDate(date())',
		'(keydown.arrowLeft)': 'focusPrevious($event)',
		'(keydown.arrowRight)': 'focusNext($event)',
		'(keydown.arrowUp)': 'focusAbove($event)',
		'(keydown.arrowDown)': 'focusBelow($event)',
		'(keydown.home)': 'focusFirst($event)',
		'(keydown.end)': 'focusLast($event)',
		'(keydown.pageUp)': 'focusPreviousMonth($event)',
		'(keydown.pageDown)': 'focusNextMonth($event)',
	},
})
export class BrnCalendarCellButton<T> {
	/** Access the date adapter */
	protected readonly _dateAdapter = injectDateAdapter<T>();

	/** Access the calendar component */
	protected readonly _calendar = injectBrnCalendar<T>();

	/** Access the element ref */
	private readonly _elementRef = inject<ElementRef<HTMLButtonElement>>(ElementRef);

	/** The date this cell represents */
	public readonly date = input.required<T>();

	/**
	 * The month this cell visually belongs to. Used to compute `outside`/`focusable` when several
	 * months are rendered at once (e.g. a two-month range calendar). When not provided it falls back
	 * to the calendar's focused date, preserving the single-month behaviour.
	 */
	public readonly referenceMonth = input<T>();

	/** Whether this date is currently selected */
	public readonly selected = computed(() => this._calendar.isSelected(this.date()));
	public readonly start = computed(() => this._calendar.isStartOfRange(this.date()));
	public readonly end = computed(() => this._calendar.isEndOfRange(this.date()));
	public readonly betweenRange = computed(() => this._calendar.isBetweenRange(this.date()));
	public readonly highlighted = computed(() =>
		this._calendar.highlightDays().some((d) => this._dateAdapter.isSameDay(this.date(), d)),
	);

	/** Whether this date is focusable */
	public readonly focusable = computed(() => {
		// only the cell matching the focused date is a tab stop (roving tabindex).
		if (!this._dateAdapter.isSameDay(this._calendar.focusedDate(), this.date())) {
			return false;
		}

		// when several months are rendered, the focused date can also appear as an overflow cell in a
		// neighbouring month. Keep a single tab stop by only allowing the cell within its own month.
		const reference = this.referenceMonth();
		return reference ? this._dateAdapter.isSameMonth(this.date(), reference) : true;
	});

	public readonly outside = computed(() => {
		const reference = this.referenceMonth() ?? this._calendar.focusedDate();
		return !this._dateAdapter.isSameMonth(this.date(), reference);
	});

	/** Whether this date is today */
	public readonly today = computed(() => this._dateAdapter.isSameDay(this.date(), this._dateAdapter.now()));

	/** Whether this date is disabled */
	public readonly disabled = computed(() => this._calendar.isDateDisabled(this.date()) || this._calendar.disabled());

	/**
	 * Focus the previous cell.
	 */
	protected focusPrevious(event: Event): void {
		event.preventDefault();
		event.stopPropagation();

		// in rtl, the arrow keys are reversed.
		const targetDate = this._dateAdapter.add(this._calendar.focusedDate(), {
			days: this.getDirection() === 'rtl' ? 1 : -1,
		});

		this._calendar.setFocusedDate(targetDate);
	}

	/**
	 * Focus the next cell.
	 */
	protected focusNext(event: Event): void {
		event.preventDefault();
		event.stopPropagation();

		const targetDate = this._dateAdapter.add(this._calendar.focusedDate(), {
			days: this.getDirection() === 'rtl' ? -1 : 1,
		});

		this._calendar.setFocusedDate(targetDate);
	}

	/**
	 * Focus the above cell.
	 */
	protected focusAbove(event: Event): void {
		event.preventDefault();
		event.stopPropagation();
		this._calendar.setFocusedDate(this._dateAdapter.subtract(this._calendar.focusedDate(), { days: 7 }));
	}

	/**
	 * Focus the below cell.
	 */
	protected focusBelow(event: Event): void {
		event.preventDefault();
		event.stopPropagation();
		this._calendar.setFocusedDate(this._dateAdapter.add(this._calendar.focusedDate(), { days: 7 }));
	}

	/**
	 * Focus the first date of the month.
	 */
	protected focusFirst(event: Event): void {
		event.preventDefault();
		event.stopPropagation();
		this._calendar.setFocusedDate(this._dateAdapter.startOfMonth(this._calendar.focusedDate()));
	}

	/**
	 * Focus the last date of the month.
	 */
	protected focusLast(event: Event): void {
		event.preventDefault();
		event.stopPropagation();
		this._calendar.setFocusedDate(this._dateAdapter.endOfMonth(this._calendar.focusedDate()));
	}

	/**
	 * Focus the same date in the previous month.
	 */
	protected focusPreviousMonth(event: Event): void {
		event.preventDefault();
		event.stopPropagation();

		const date = this._dateAdapter.getDate(this._calendar.focusedDate());

		let previousMonthTarget = this._dateAdapter.startOfMonth(this._calendar.focusedDate());
		previousMonthTarget = this._dateAdapter.subtract(previousMonthTarget, { months: 1 });

		const lastDay = this._dateAdapter.endOfMonth(previousMonthTarget);

		// if we are on a date that does not exist in the previous month, we should focus the last day of the month.
		if (date > this._dateAdapter.getDate(lastDay)) {
			this._calendar.setFocusedDate(lastDay);
		} else {
			this._calendar.setFocusedDate(this._dateAdapter.set(previousMonthTarget, { day: date }));
		}
	}

	/**
	 * Focus the same date in the next month.
	 */
	protected focusNextMonth(event: Event): void {
		event.preventDefault();
		event.stopPropagation();

		const date = this._dateAdapter.getDate(this._calendar.focusedDate());

		let nextMonthTarget = this._dateAdapter.startOfMonth(this._calendar.focusedDate());
		nextMonthTarget = this._dateAdapter.add(nextMonthTarget, { months: 1 });

		const lastDay = this._dateAdapter.endOfMonth(nextMonthTarget);

		// if we are on a date that does not exist in the next month, we should focus the last day of the month.
		if (date > this._dateAdapter.getDate(lastDay)) {
			this._calendar.setFocusedDate(lastDay);
		} else {
			this._calendar.setFocusedDate(this._dateAdapter.set(nextMonthTarget, { day: date }));
		}
	}

	/**
	 * Get the direction of the element.
	 */
	private getDirection(): 'ltr' | 'rtl' {
		return getComputedStyle(this._elementRef.nativeElement).direction === 'rtl' ? 'rtl' : 'ltr';
	}

	focus(): void {
		this._elementRef.nativeElement.focus();
	}
}
