import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
	model,
	numberAttribute,
	signal,
	viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { BrnCalendarImports, BrnCalendarMulti, injectBrnCalendarI18n, type Weekday } from '@brain/calendar';
import { injectDateAdapter } from '@brain/date-time';
import { buttonVariants } from '@helm/button';
import { HlmIcon } from '@helm/icon';
import { hlm } from '../utils';
import { HlmCalendarMonthView } from './hlm-calendar-month-view';
import { HlmCalendarYearView } from './hlm-calendar-year-view';
import type { CalendarView } from './hlm-calendar-view';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-calendar-multi',
	imports: [BrnCalendarImports, NgIcon, HlmIcon, HlmCalendarMonthView, HlmCalendarYearView],
	viewProviders: [provideIcons({ lucideChevronLeft, lucideChevronRight })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'data-slot': 'calendar' },
	template: `
		<div
			brnCalendarMulti
			[min]="min()"
			[max]="max()"
			[minSelection]="minSelection()"
			[maxSelection]="maxSelection()"
			[disabled]="disabled()"
			[(date)]="date"
			[dateDisabled]="dateDisabled()"
			[weekStartsOn]="weekStartsOn()"
			[highlightDays]="highlightDays()"
			[defaultFocusedDate]="defaultFocusedDate()"
			[class]="_computedCalenderClass()"
		>
			<div class="inline-flex flex-col space-y-4">
				<!-- Header -->
				<div class="space-y-4">
					<div class="relative flex items-center justify-center pt-1">
						<!-- Clicking the header drills down: days -> months -> years (Windows style) -->
						<button type="button" [disabled]="_view() === 'years'" (click)="_onHeaderClick()" [class]="_headerClass">
							<span brnCalendarHeader class="font-semibold">{{ _headerLabel() }}</span>
						</button>

						<div class="flex items-center space-x-1">
							<button
								type="button"
								[attr.aria-label]="_i18n.config().labelPrevious()"
								(click)="_goPrevious()"
								class="ring-offset-background focus-visible:ring-ring border-input hover:bg-accent-foreground text-primary hover:text-hover absolute left-1 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-transparent p-0 text-sm font-medium whitespace-nowrap opacity-50 transition-colors hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
							>
								<ng-icon hlm name="lucideChevronLeft" size="sm" />
							</button>

							<button
								type="button"
								[attr.aria-label]="_i18n.config().labelNext()"
								(click)="_goNext()"
								class="ring-offset-background focus-visible:ring-ring border-input hover:bg-accent-foreground text-primary hover:text-hover absolute right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-transparent p-0 text-sm font-medium whitespace-nowrap opacity-50 transition-colors hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
							>
								<ng-icon hlm name="lucideChevronRight" size="sm" />
							</button>
						</div>
					</div>
				</div>

				@switch (_view()) {
					@case ('months') {
						<hlm-calendar-month-view
							[focusedDate]="_focusedDate()"
							[min]="min()"
							[max]="max()"
							(monthSelected)="_onMonthSelected($event)"
						/>
					}
					@case ('years') {
						<hlm-calendar-year-view
							[focusedDate]="_focusedDate()"
							[min]="min()"
							[max]="max()"
							(yearSelected)="_onYearSelected($event)"
						/>
					}
					@default {
						<table class="w-full border-collapse space-y-1" brnCalendarGrid>
							<thead>
								<tr class="flex">
									<th
										*brnCalendarWeekday="let weekday"
										scope="col"
										class="text-muted-foreground w-11 rounded-md text-[0.8rem] font-normal"
										[attr.aria-label]="_i18n.config().labelWeekday(weekday)"
									>
										{{ _i18n.config().formatWeekdayName(weekday) }}
									</th>
								</tr>
							</thead>

							<tbody role="rowgroup">
								<tr *brnCalendarWeek="let week" class="mt-2 flex w-full">
									@for (date of week; track _dateAdapter.getTime(date)) {
										<td
											brnCalendarCell
											class="data-[selected]:data-[outside]:bg-accent/50 data-[selected]:bg-accent relative w-11 h-10 p-0 text-center text-sm focus-within:relative focus-within:z-20"
										>
											<button brnCalendarCellButton [date]="date" [class]="_btnClass">
												{{ _dateAdapter.getDate(date) }}
											</button>
										</td>
									}
								</tr>
							</tbody>
						</table>
					}
				}
			</div>
		</div>
	`,
})
export class HlmCalendarMulti<T> {
	public readonly calendarClass = input<ClassValue>('');

	protected readonly _computedCalenderClass = computed(() => hlm('rounded-md border p-3', this.calendarClass()));

	/** Access the calendar i18n */
	protected readonly _i18n = injectBrnCalendarI18n();

	/** Access the date time adapter */
	protected readonly _dateAdapter = injectDateAdapter<T>();

	/** The days to highlight. */
	public readonly highlightDays = input<T[]>([]);

	/** The minimum date that can be selected.*/
	public readonly min = input<T>();

	/** The maximum date that can be selected. */
	public readonly max = input<T>();

	/**
	 * Kept for backwards compatibility with the date-picker API. The calendar now always uses the
	 * drill-down header (days -> months -> years), so this input no longer changes the layout.
	 */
	public readonly captionLayout = input<'dropdown' | 'label' | 'dropdown-months' | 'dropdown-years'>('label');

	/** The minimum selectable dates.  */
	public readonly minSelection = input<number, NumberInput>(undefined, {
		transform: numberAttribute,
	});

	/** The maximum selectable dates.  */
	public readonly maxSelection = input<number, NumberInput>(undefined, {
		transform: numberAttribute,
	});

	/** Determine if the date picker is disabled. */
	public readonly disabled = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	/** The selected value. */
	public readonly date = model<T[]>();

	/** Whether a specific date is disabled. */
	public readonly dateDisabled = input<(date: T) => boolean>(() => false);

	/** The day the week starts on */
	public readonly weekStartsOn = input<Weekday, NumberInput>(undefined, {
		transform: (v: unknown) => numberAttribute(v) as Weekday,
	});

	/** The default focused date. */
	public readonly defaultFocusedDate = input<T>();

	/** Access the calendar directive */
	private readonly _calendar = viewChild.required(BrnCalendarMulti);

	/** The current drill-down level of the calendar. */
	protected readonly _view = signal<CalendarView>('days');

	/** The date the calendar is currently focused on. */
	protected readonly _focusedDate = computed(() => this._calendar().focusedDate());

	/** The label shown in the header, reactive to the current view. */
	protected readonly _headerLabel = computed(() => {
		const config = this._i18n.config();
		const adapter = this._dateAdapter;
		const focused = this._focusedDate();

		switch (this._view()) {
			case 'months':
				return config.formatYear(adapter.getYear(focused));
			case 'years': {
				const decadeStart = Math.floor(adapter.getYear(focused) / 10) * 10;
				return `${decadeStart} – ${decadeStart + 9}`;
			}
			default:
				return config.formatHeader(adapter.getMonth(focused), adapter.getYear(focused));
		}
	});

	/** Advance the header one level deeper: days -> months -> years. */
	protected _onHeaderClick(): void {
		this._view.update((view) => (view === 'days' ? 'months' : 'years'));
	}

	/** Select a month from the months view and drop back to the days view. */
	protected _onMonthSelected(date: T): void {
		this._calendar().focusedDate.set(date);
		this._view.set('days');
	}

	/** Select a year from the years view and drop back to the months view. */
	protected _onYearSelected(date: T): void {
		this._calendar().focusedDate.set(date);
		this._view.set('months');
	}

	/** Navigate to the previous month/year/decade depending on the active view. */
	protected _goPrevious(): void {
		this._shift(-1);
	}

	/** Navigate to the next month/year/decade depending on the active view. */
	protected _goNext(): void {
		this._shift(1);
	}

	private _shift(direction: 1 | -1): void {
		const calendar = this._calendar();
		const adapter = this._dateAdapter;
		const focused = calendar.focusedDate();

		switch (this._view()) {
			case 'months':
				calendar.focusedDate.set(adapter.add(adapter.startOfMonth(focused), { years: direction }));
				return;
			case 'years':
				calendar.focusedDate.set(adapter.add(adapter.startOfMonth(focused), { years: direction * 10 }));
				return;
			default: {
				// days: move one month, clamping the day to the target month.
				const day = adapter.getDate(focused);
				const monthTarget = adapter.add(adapter.startOfMonth(focused), { months: direction });
				const lastDay = adapter.endOfMonth(monthTarget);
				const target = day > adapter.getDate(lastDay) ? lastDay : adapter.set(monthTarget, { day });

				const constrained = calendar.constrainDate(target);
				calendar.focusedDate.set(adapter.isSameMonth(constrained, target) ? constrained : target);
			}
		}
	}

	protected readonly _headerClass = hlm(
		'text-primary hover:bg-accent-foreground hover:text-hover focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-full px-6',
		'transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none',
	);

	protected readonly _btnClass = hlm(
		buttonVariants({ variant: 'ghost' }),
		'relative z-10 size-10 border-0 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-accent-foreground',
		'data-[outside]:text-muted-foreground data-[outside]:aria-selected:text-muted-foreground',
		'data-[today]:text-tertiary',
		'data-[selected]:bg-accent data-[selected]:text-primary-foreground data-[selected]:focus:bg-accent data-[selected]:focus:text-primary-foreground',
		'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
		'dark:hover:text-accent',
		"data-[highlighted]:before:content-['']",
		'data-[highlighted]:before:absolute',
		'data-[highlighted]:before:bottom-1',
		'data-[highlighted]:before:left-1/2',
		'data-[highlighted]:before:h-1',
		'data-[highlighted]:before:w-1',
		'data-[highlighted]:before:-translate-x-1/2',
		'data-[highlighted]:before:rounded-full',
		'data-[highlighted]:before:bg-destructive',
	);
}
