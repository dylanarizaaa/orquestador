import { Directive } from '@angular/core';
import { BrnDialogClose } from '@brain/dialog';

@Directive({
	selector: 'button[hlmDialogClose]',
	hostDirectives: [BrnDialogClose],
	host: { 'data-slot': 'dialog-close' },
})
export class HlmDialogClose { }
