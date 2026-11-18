import { CdkMenu, CdkMenuGroup, CdkMenuItem, CdkMenuItemCheckbox, CdkMenuItemRadio, CdkMenuItemSelectable, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, Directive, HOST_TAG_NAME, InjectionToken, booleanAttribute, computed, effect, inject, input, numberAttribute, signal, type ValueProvider } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { classes } from '../utils';
import { createMenuPosition, type MenuAlign, type MenuSide } from '@brain/core';
import { lucideCheck, lucideChevronRight } from '@ng-icons/lucide';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type BooleanInput, type NumberInput } from '@angular/cdk/coercion';

@Component({
	selector: 'hlm-dropdown-menu-checkbox-indicator',
	imports: [NgIcon],
	providers: [provideIcons({ lucideCheck })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'data-slot': 'dropdown-menu-checkbox-item-indicator' },
	template: `
		<ng-icon name="lucideCheck" />
	`,
})
export class HlmDropdownMenuCheckboxIndicator {
	constructor() {
		classes(
			() =>
				'absolute end-2 flex items-center justify-center [&_ng-icon]:text-[calc(var(--spacing)*4)] pointer-events-none opacity-0 group-data-checked/dropdown-menu-checkbox:opacity-100',
		);
	}
}

/** @internal. Use HlmDropdownMenuCheckbox instead. */
@Directive({
	selector: '[hlmDropdownMenuCheckboxCdk]',
	providers: [
		{ provide: CdkMenuItemCheckbox, useExisting: HlmDropdownMenuCheckboxCdk },
		{ provide: CdkMenuItemSelectable, useExisting: HlmDropdownMenuCheckboxCdk },
		{ provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
	],
})
export class HlmDropdownMenuCheckboxCdk extends CdkMenuItemCheckbox {
	public readonly keepOpen = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

	public override trigger(options?: { keepOpen: boolean }) {
		super.trigger({ ...options, keepOpen: this.keepOpen() });
	}
}

@Directive({
	selector: '[hlmDropdownMenuCheckbox],[hlmDropdownMenuCheckboxItem]',
	hostDirectives: [
		{
			directive: HlmDropdownMenuCheckboxCdk,
			inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuItemChecked: checked', 'keepOpen'],
			outputs: ['cdkMenuItemTriggered: triggered'],
		},
	],
	host: {
		'data-slot': 'dropdown-menu-checkbox-item',
		'[attr.data-disabled]': '_cdkMenuItem.disabled ? "" : null',
		'[attr.data-checked]': '_cdkMenuItem.checked ? "" : null',
		'[attr.data-inset]': 'inset() ? "" : null',
	},
})
export class HlmDropdownMenuCheckbox {
	protected readonly _cdkMenuItem = inject(HlmDropdownMenuCheckboxCdk);

	public readonly inset = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	constructor() {
		classes(
			() =>
				'hover:bg-accent-foreground focus:bg-accent-foreground hover:text-accent focus:text-accent gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm data-inset:ps-8 [&_ng-icon:not([class*=\'text-\'])]:text-[calc(var(--spacing)*4)] group/dropdown-menu-checkbox relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0',
		);
	}
}

@Directive({
	selector: '[hlmDropdownMenuGroup],hlm-dropdown-menu-group',
	hostDirectives: [CdkMenuGroup],
	host: { 'data-slot': 'dropdown-menu-group' },
})
export class HlmDropdownMenuGroup {
	constructor() {
		classes(() => 'block');
	}
}

@Component({
	selector: 'hlm-dropdown-menu-item-sub-indicator',
	imports: [NgIcon],
	providers: [provideIcons({ lucideChevronRight })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<ng-icon name="lucideChevronRight" class="text-[calc(var(--spacing)*4)] rtl:rotate-180" />
	`,
})
export class HlmDropdownMenuItemSubIndicator {
	constructor() {
		classes(() => 'ms-auto flex items-center justify-center');
	}
}

@Directive({
	selector: '[hlmDropdownMenuItem],hlm-dropdown-menu-item',
	hostDirectives: [
		{
			directive: CdkMenuItem,
			inputs: ['cdkMenuItemDisabled: disabled'],
			outputs: ['cdkMenuItemTriggered: triggered'],
		},
	],
	host: {
		'data-slot': 'dropdown-menu-item',
		'[attr.disabled]': '_isButton && disabled() ? "" : null',
		'[attr.data-disabled]': 'disabled() ? "" : null',
		'[attr.data-variant]': 'variant()',
		'[attr.data-inset]': 'inset() ? "" : null',
	},
})
export class HlmDropdownMenuItem {
	protected readonly _isButton = inject(HOST_TAG_NAME) === 'button';

	public readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

	public readonly variant = input<'default' | 'destructive'>('default');

	public readonly inset = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	constructor() {
		classes(
			() =>
				'hover:bg-accent-foreground focus:bg-accent-foreground hover:text-accent focus:text-accent data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:hover:bg-destructive/20 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:hover:text-destructive data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[ng-icon]:text-destructive not-data-[variant=destructive]:hover:**:text-accent not-data-[variant=destructive]:focus:**:text-accent gap-2 rounded-sm px-2 py-1.5 text-sm data-inset:ps-8 [&_ng-icon:not([class*=\'text-\'])]:text-[calc(var(--spacing)*4)] group/dropdown-menu-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0',
		);
	}
}

@Directive({
	selector: '[hlmDropdownMenuLabel],hlm-dropdown-menu-label',
	host: {
		'data-slot': 'dropdown-menu-label',
		'[attr.data-inset]': 'inset() ? "" : null',
	},
})
export class HlmDropdownMenuLabel {
	public readonly inset = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	constructor() {
		classes(() => 'text-muted-foreground px-2 py-1.5 text-xs font-medium data-inset:ps-8 block');
	}
}

@Component({
	selector: 'hlm-dropdown-menu-radio-indicator',
	imports: [NgIcon],
	providers: [provideIcons({ lucideCheck })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { 'data-slot': 'dropdown-menu-radio-item-indicator' },
	template: `
		<ng-icon name="lucideCheck" />
	`,
})
export class HlmDropdownMenuRadioIndicator {
	constructor() {
		classes(
			() =>
				'absolute end-2 flex items-center justify-center [&_ng-icon]:text-[calc(var(--spacing)*4)] pointer-events-none opacity-0 group-data-checked/dropdown-menu-radio:opacity-100',
		);
	}
}

/** @internal. Use HlmDropdownMenuRadio instead. */
@Directive({
	selector: '[hlmDropdownMenuRadioCdk]',
	providers: [
		{ provide: CdkMenuItemRadio, useExisting: HlmDropdownMenuRadioCdk },
		{ provide: CdkMenuItemSelectable, useExisting: HlmDropdownMenuRadioCdk },
		{ provide: CdkMenuItem, useExisting: CdkMenuItemSelectable },
	],
})
export class HlmDropdownMenuRadioCdk extends CdkMenuItemRadio {
	public readonly keepOpen = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

	public override trigger(options?: { keepOpen: boolean }) {
		super.trigger({ ...options, keepOpen: this.keepOpen() });
	}
}

@Directive({
	selector: '[hlmDropdownMenuRadio]',
	hostDirectives: [
		{
			directive: HlmDropdownMenuRadioCdk,
			inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuItemChecked: checked', 'keepOpen'],
			outputs: ['cdkMenuItemTriggered: triggered'],
		},
	],
	host: {
		'data-slot': 'dropdown-menu-radio-item',
		'[attr.data-disabled]': '_cdkMenuItem.disabled ? "" : null',
		'[attr.data-checked]': '_cdkMenuItem.checked ? "" : null',
	},
})
export class HlmDropdownMenuRadio {
	protected readonly _cdkMenuItem = inject(HlmDropdownMenuRadioCdk);

	constructor() {
		classes(
			() =>
				'hover:bg-accent-foreground focus:bg-accent-foreground hover:text-accent focus:text-accent gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm data-inset:ps-8 [&_ng-icon:not([class*=\'text-\'])]:text-[calc(var(--spacing)*4)] group/dropdown-menu-radio relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0',
		);
	}
}

@Directive({
	selector: '[hlmDropdownMenuSeparator],hlm-dropdown-menu-separator',
	host: { 'data-slot': 'dropdown-menu-separator' },
})
export class HlmDropdownMenuSeparator {
	constructor() {
		classes(() => 'bg-border -mx-1 my-1 h-px block');
	}
}

@Directive({
	selector: '[hlmDropdownMenuShortcut],hlm-dropdown-menu-shortcut',
	host: { 'data-slot': 'dropdown-menu-shortcut' },
})
export class HlmDropdownMenuShortcut {
	constructor() {
		classes(() => 'text-muted-foreground group-focus/dropdown-menu-item:text-accent ms-auto text-xs tracking-widest');
	}
}

@Directive({
	selector: '[hlmDropdownMenuSubTrigger]',
	hostDirectives: [
		{
			directive: CdkMenuTrigger,
			inputs: ['cdkMenuTriggerFor: hlmDropdownMenuSubTrigger', 'cdkMenuTriggerData: hlmDropdownMenuTriggerData'],
			outputs: ['cdkMenuOpened: hlmDropdownMenuSubOpened', 'cdkMenuClosed: hlmDropdownMenuSubClosed'],
		},
	],
	host: { 'data-slot': 'dropdown-menu-sub-trigger' },
})
export class HlmDropdownMenuSubTrigger {
	private readonly _cdkTrigger = inject(CdkMenuTrigger, { host: true });
	private readonly _config = injectHlmDropdownMenuConfig();

	public readonly align = input<MenuAlign>(this._config.align);
	public readonly side = input<MenuSide>(this._config.side);

	private readonly _menuPosition = computed(() => createMenuPosition(this.align(), this.side()));

	constructor() {
		this._cdkTrigger.opened.pipe(takeUntilDestroyed()).subscribe(() =>
			setTimeout(
				() =>
				// eslint-disable-next-line
				((this._cdkTrigger as any)._spartanLastPosition = // eslint-disable-next-line
					(this._cdkTrigger as any).overlayRef._positionStrategy._lastPosition),
			),
		);

		effect(() => {
			this._cdkTrigger.menuPosition = this._menuPosition();
		});

		classes(() => 'aria-expanded:bg-accent-foreground aria-expanded:text-accent');
	}
}

@Directive({
	selector: '[hlmDropdownMenuSub],hlm-dropdown-menu-sub',
	hostDirectives: [CdkMenu],
	host: {
		'data-slot': 'dropdown-menu-sub',
		'[attr.data-state]': '_state()',
		'[attr.data-side]': '_side()',
	},
})
export class HlmDropdownMenuSub {
	private readonly _host = inject(CdkMenu);

	protected readonly _state = signal('open');
	protected readonly _side = signal('top');

	constructor() {
		this.setSideWithDarkMagic();
		// this is a best effort, but does not seem to work currently
		// TODO: figure out a way for us to know the host is about to be closed. might not be possible with CDK
		this._host.closed.pipe(takeUntilDestroyed()).subscribe(() => this._state.set('closed'));

		classes(() => 'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-24 rounded-md p-1 shadow-lg ring-1 duration-100 w-auto');
	}

	private setSideWithDarkMagic() {
		/**
		 * This is an ugly workaround to at least figure out the correct side of where a submenu
		 * will appear and set the attribute to the host accordingly
		 *
		 * First of all we take advantage of the menu stack not being aware of the root
		 * object immediately after it is added. This code executes before the root element is added,
		 * which means the stack is still empty and the peek method returns undefined.
		 */
		const isRoot = this._host.menuStack.peek() === undefined;
		setTimeout(() => {
			// our menu trigger directive leaves the last position used for use immediately after opening
			// we can access it here and determine the correct side.
			// eslint-disable-next-line
			const ps = (this._host as any)._parentTrigger._spartanLastPosition;
			if (!ps) {
				// if we have no last position we default to the most likely option
				// I hate that we have to do this and hope we can revisit soon and improve
				this._side.set(isRoot ? 'top' : 'left');
				return;
			}
			const side = isRoot ? ps.originY : ps.originX === 'end' ? 'right' : 'left';
			this._side.set(side);
		});
	}
}

export interface HlmDropdownMenuConfig {
	align: MenuAlign;
	side: MenuSide;
}

const defaultConfig: HlmDropdownMenuConfig = {
	align: 'start',
	side: 'bottom',
};

const HlmDropdownMenuConfigToken = new InjectionToken<HlmDropdownMenuConfig>('HlmDropdownMenuConfig');

export function provideHlmDropdownMenuConfig(config: Partial<HlmDropdownMenuConfig>): ValueProvider {
	return { provide: HlmDropdownMenuConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectHlmDropdownMenuConfig(): HlmDropdownMenuConfig {
	return inject(HlmDropdownMenuConfigToken, { optional: true }) ?? defaultConfig;
}

@Directive({
	selector: '[hlmDropdownMenuTrigger]',
	hostDirectives: [
		{
			directive: CdkMenuTrigger,
			inputs: ['cdkMenuTriggerFor: hlmDropdownMenuTrigger', 'cdkMenuTriggerData: hlmDropdownMenuTriggerData'],
			outputs: ['cdkMenuOpened: hlmDropdownMenuOpened', 'cdkMenuClosed: hlmDropdownMenuClosed'],
		},
	],
	host: { 'data-slot': 'dropdown-menu-trigger' },
})
export class HlmDropdownMenuTrigger {
	private readonly _cdkTrigger = inject(CdkMenuTrigger, { host: true });
	private readonly _config = injectHlmDropdownMenuConfig();

	public readonly align = input<MenuAlign>(this._config.align);
	public readonly side = input<MenuSide>(this._config.side);

	private readonly _menuPosition = computed(() => createMenuPosition(this.align(), this.side()));

	constructor() {
		// once the trigger opens we wait until the next tick and then grab the last position
		// used to position the menu. we store this in our trigger which the brnMenu directive has
		// access to through DI
		this._cdkTrigger.opened.pipe(takeUntilDestroyed()).subscribe(() =>
			setTimeout(
				() =>
				// eslint-disable-next-line
				((this._cdkTrigger as any)._spartanLastPosition = // eslint-disable-next-line
					(this._cdkTrigger as any).overlayRef._positionStrategy._lastPosition),
			),
		);

		effect(() => {
			this._cdkTrigger.menuPosition = this._menuPosition();
		});
	}
}

@Directive({
	selector: '[hlmDropdownMenu],hlm-dropdown-menu',
	hostDirectives: [CdkMenu],
	host: {
		'data-slot': 'dropdown-menu',
		'[attr.data-state]': '_state()',
		'[attr.data-side]': '_side()',
		'[style.--side-offset]': 'sideOffset()',
	},
})
export class HlmDropdownMenu {
	private readonly _host = inject(CdkMenu);

	protected readonly _state = signal('open');
	protected readonly _side = signal('top');

	public readonly sideOffset = input<number, NumberInput>(1, { transform: numberAttribute });

	constructor() {
		classes(
			() =>
				'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-32 rounded-md p-1 shadow-md ring-1 duration-100 my-[--spacing(var(--side-offset))] overflow-x-hidden overflow-y-auto outline-none',
		);

		this.setSideWithDarkMagic();
		// this is a best effort, but does not seem to work currently
		// TODO: figure out a way for us to know the host is about to be closed. might not be possible with CDK
		this._host.closed.pipe(takeUntilDestroyed()).subscribe(() => this._state.set('closed'));
	}

	private setSideWithDarkMagic() {
		/**
		 * This is an ugly workaround to at least figure out the correct side of where a submenu
		 * will appear and set the attribute to the host accordingly
		 *
		 * First of all we take advantage of the menu stack not being aware of the root
		 * object immediately after it is added. This code executes before the root element is added,
		 * which means the stack is still empty and the peek method returns undefined.
		 */
		const isRoot = this._host.menuStack.peek() === undefined;
		setTimeout(() => {
			// our menu trigger directive leaves the last position used for use immediately after opening
			// we can access it here and determine the correct side.
			// eslint-disable-next-line
			const ps = (this._host as any)._parentTrigger._spartanLastPosition;
			if (!ps) {
				// if we have no last position we default to the most likely option
				// I hate that we have to do this and hope we can revisit soon and improve
				this._side.set(isRoot ? 'top' : 'left');
				return;
			}
			const side = isRoot ? ps.originY : ps.originX === 'end' ? 'right' : 'left';
			this._side.set(side);
		});
	}
}