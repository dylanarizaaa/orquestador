import { Directive } from '@angular/core';
import { classes } from '../utils';

@Directive({
	selector: '[hlmDialogFooter],hlm-dialog-footer',
	host: { 'data-slot': 'dialog-footer' },
})
export class HlmDialogFooter {
	constructor() {
		classes(() => 'gap-2 flex flex-col-reverse gap-6 sm:flex-row sm:justify-center');
	}
}
