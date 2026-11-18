import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
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
import { BrnCalendarImports, BrnCalendarRange, injectBrnCalendarI18n, type Weekday } from '@brain/calendar';
import { injectDateAdapter } from '@brain/date-time';
import { buttonVariants } from '@helm/button';
import { HlmIcon } from '@helm/icon';
import { hlm } from '../utils';
import { HlmCalendarMonthView } from './hlm-calendar-month-view';
import { HlmCalendarYearView } from './hlm-calendar-year-view';
import type { CalendarView } from './hlm-calendar-view';
import type { ClassValue } from 'clsx';

@Component({
  selector: 'hlm-calendar-range',
  imports: [BrnCalendarImports, NgIcon, HlmIcon, NgTemplateOutlet, HlmCalendarMonthView, HlmCalendarYearView],
  viewProviders: [provideIcons({ lucideChevronLeft, lucideChevronRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-slot': 'calendar' },
  template: `
		<div
			brnCalendarRange
			[min]="min()"
			[max]="max()"
			[disabled]="disabled()"
			[(startDate)]="startDate"
			[(endDate)]="endDate"
			[dateDisabled]="dateDisabled()"
			[weekStartsOn]="weekStartsOn()"
			[highlightDays]="highlightDays()"
			[defaultFocusedDate]="defaultFocusedDate()"
			[class]="_computedCalenderClass()"
		>
			<!-- Declared inside the brnCalendarRange element so the cell buttons can inject the calendar. -->
			<ng-template #panel let-ref="ref" let-label="label" let-weeks="weeks">
				<div class="space-y-4">
					<!-- Per-panel header: prev — drill-down label — next -->
					<div class="relative flex items-center justify-center pt-1">
						<button
							type="button"
							[attr.aria-label]="_i18n.config().labelPrevious()"
							(click)="_shift(-1)"
							class="text-primary hover:text-hover absolute left-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-transparent p-0 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							<ng-icon hlm name="lucideChevronLeft" size="sm" />
						</button>

						<button type="button" [disabled]="_view() === 'years'" (click)="_onHeaderClick()" [class]="_headerClass">
							<span class="font-semibold text-base">{{ label }}</span>
						</button>

						<button
							type="button"
							[attr.aria-label]="_i18n.config().labelNext()"
							(click)="_shift(1)"
							class="text-primary hover:text-hover absolute right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-transparent p-0 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							<ng-icon hlm name="lucideChevronRight" size="sm" />
						</button>
					</div>

					@switch (_view()) {
						@case ('months') {
							<hlm-calendar-month-view
								[focusedDate]="ref"
								[min]="min()"
								[max]="max()"
								[rangeStart]="startDate()"
								[rangeEnd]="endDate()"
								(monthSelected)="_drillToDays($event)"
							/>
						}
						@case ('years') {
							<hlm-calendar-year-view
								[focusedDate]="ref"
								[min]="min()"
								[max]="max()"
								[rangeStart]="startDate()"
								[rangeEnd]="endDate()"
								(yearSelected)="_drillToMonths($event)"
							/>
						}
						@default {
							<table class="border-collapse" role="grid" [attr.aria-label]="label">
								<thead>
									<tr class="flex">
										@for (weekday of _weekdays(); track _dateAdapter.getTime(weekday)) {
											<th
												scope="col"
												class="text-muted-foreground w-11 rounded-md text-[11px] font-normal"
												[attr.aria-label]="_i18n.config().labelWeekday(_dateAdapter.getDay(weekday))"
											>
												{{ _i18n.config().formatWeekdayName(_dateAdapter.getDay(weekday)) }}
											</th>
										}
									</tr>
								</thead>

								<tbody role="rowgroup">
									@for (week of weeks; track $index) {
										<tr class="mt-2 flex w-full">
											@for (date of week; track _dateAdapter.getTime(date)) {
												<td
													brnCalendarCell
													class="data-[selected]:data-[outside]:bg-accent/50 data-[selected]:bg-accent relative w-11 h-10 p-0 text-center text-sm focus-within:relative focus-within:z-20 has-data-[range-end]:after:absolute has-data-[range-end]:after:inset-y-0 has-data-[range-end]:after:left-0 has-data-[range-end]:after:w-4 has-data-[range-start]:after:absolute has-data-[range-start]:after:inset-y-0 has-data-[range-start]:after:right-0 has-data-[range-start]:after:w-4"
												>
													<button brnCalendarCellButton [date]="date" [referenceMonth]="ref" [class]="_btnClass">
														{{ _dateAdapter.getDate(date) }}
													</button>
												</td>
											}
										</tr>
									}
								</tbody>
							</table>
						}
					}
				</div>
			</ng-template>

			<div class="flex flex-col gap-6 sm:flex-row">
				<ng-container
					[ngTemplateOutlet]="panel"
					[ngTemplateOutletContext]="{ ref: _leftRef(), label: _leftLabel(), weeks: _leftWeeks() }"
				/>
				<ng-container
					[ngTemplateOutlet]="panel"
					[ngTemplateOutletContext]="{ ref: _rightRef(), label: _rightLabel(), weeks: _rightWeeks() }"
				/>
			</div>
		</div>
	`,
})
export class HlmCalendarRange<T> {
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

  /** Determine if the date picker is disabled. */
  public readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /** The start date of the range. */
  public readonly startDate = model<T>();

  /** The end date of the range. */
  public readonly endDate = model<T>();

  /** Whether a specific date is disabled. */
  public readonly dateDisabled = input<(date: T) => boolean>(() => false);

  /** The day the week starts on */
  public readonly weekStartsOn = input<Weekday, NumberInput>(undefined, {
    transform: (v: unknown) => numberAttribute(v) as Weekday,
  });

  /** The default focused date. */
  public readonly defaultFocusedDate = input<T>();

  /** Access the calendar directive */
  private readonly _calendar = viewChild.required(BrnCalendarRange);

  /** The current drill-down level shared by both panels. */
  protected readonly _view = signal<CalendarView>('days');

  /** The reference date of the left panel (also the calendar's focused date). */
  protected readonly _leftRef = computed(() => this._calendar().focusedDate());

  /**
   * The reference date of the right panel — always one step after the left panel. The step depends on
   * the active view so the two panels stay consecutive (next month, next year or next decade).
   */
  protected readonly _rightRef = computed(() => {
    const adapter = this._dateAdapter;
    const left = adapter.startOfMonth(this._leftRef());

    switch (this._view()) {
      case 'months':
        return adapter.add(left, { years: 1 });
      case 'years':
        return adapter.add(left, { years: 10 });
      default:
        return adapter.add(left, { months: 1 });
    }
  });

  /** The day weeks for each panel (only rendered in the days view). */
  protected readonly _leftWeeks = computed(() => this._toWeeks(this._calendar().getMonthDays(this._leftRef())));
  protected readonly _rightWeeks = computed(() => this._toWeeks(this._calendar().getMonthDays(this._rightRef())));

  /** The seven weekday cells used to render the column headers. */
  protected readonly _weekdays = computed(() => this._calendar().getMonthDays(this._leftRef()).slice(0, 7));

  /** Header label for each panel, reactive to the current view. */
  protected readonly _leftLabel = computed(() => this._labelFor(this._leftRef()));
  protected readonly _rightLabel = computed(() => this._labelFor(this._rightRef()));

  private _labelFor(ref: T): string {
    const adapter = this._dateAdapter;
    const config = this._i18n.config();

    switch (this._view()) {
      case 'months':
        return config.formatYear(adapter.getYear(ref));
      case 'years': {
        const decadeStart = Math.floor(adapter.getYear(ref) / 10) * 10;
        return `${decadeStart} – ${decadeStart + 9}`;
      }
      default:
        return config.formatHeader(adapter.getMonth(ref), adapter.getYear(ref));
    }
  }

  private _toWeeks(days: T[]): T[][] {
    const weeks: T[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }

  /** Advance both panels one level deeper: days -> months -> years. */
  protected _onHeaderClick(): void {
    this._view.update((view) => (view === 'days' ? 'months' : 'years'));
  }

  /** Select a month from the months view: it becomes the left panel and both panels drop to days. */
  protected _drillToDays(date: T): void {
    this._calendar().focusedDate.set(date);
    this._view.set('days');
  }

  /** Select a year from the years view: it becomes the left panel and both panels drop to months. */
  protected _drillToMonths(date: T): void {
    this._calendar().focusedDate.set(date);
    this._view.set('months');
  }

  /** Shift the visible window. Each arrow moves both panels by one unit of the active view. */
  protected _shift(direction: 1 | -1): void {
    const adapter = this._dateAdapter;
    const calendar = this._calendar();
    const focused = calendar.focusedDate();
    const monthStart = adapter.startOfMonth(focused);

    switch (this._view()) {
      case 'months':
        calendar.focusedDate.set(adapter.add(monthStart, { years: direction }));
        return;
      case 'years':
        calendar.focusedDate.set(adapter.add(monthStart, { years: direction * 10 }));
        return;
      default: {
        // days: move one month, clamping the day to the target month.
        const day = adapter.getDate(focused);
        const monthTarget = adapter.add(monthStart, { months: direction });
        const lastDay = adapter.endOfMonth(monthTarget);
        const target = day > adapter.getDate(lastDay) ? lastDay : adapter.set(monthTarget, { day });

        const constrained = calendar.constrainDate(target);
        calendar.focusedDate.set(adapter.isSameMonth(constrained, target) ? constrained : target);
      }
    }
  }

  protected readonly _headerClass = hlm(
    'text-primary hover:text-hover focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-full px-6',
    'transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none',
  );

  protected readonly _btnClass = hlm(
    buttonVariants({ variant: 'ghost' }),
    'relative z-10 size-10 border-0 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-accent-foreground',
    'data-[outside]:text-muted-foreground data-[outside]:aria-selected:text-muted-foreground',
    'data-[today]:text-tertiary',
    'data-[selected]:bg-accent data-[selected]:text-primary-foreground data-[selected]:focus:bg-accent data-[selected]:focus:text-primary-foreground',
    'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
    'data-[range-between]:bg-accent-foreground data-[range-between]:text-foreground',
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
