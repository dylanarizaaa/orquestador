import { Directive } from '@angular/core';
import { BrnDialogContent } from '@brain/dialog';

@Directive({
	selector: '[hlmDialogPortal]',
	hostDirectives: [{ directive: BrnDialogContent, inputs: ['context', 'class'] }],
})
export class HlmDialogPortal { }
