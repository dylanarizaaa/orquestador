import { Directive } from '@angular/core';
import { BrnSheetTitle } from '@brain/sheet';
import { classes } from '../utils';

@Directive({
	selector: '[hlmSheetTitle]',
	hostDirectives: [BrnSheetTitle],
	host: { 'data-slot': 'sheet-title' },
})
export class HlmSheetTitle {
	constructor() {
		classes(() => 'text-foreground font-medium');
	}
}
