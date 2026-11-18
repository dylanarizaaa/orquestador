import { Directive } from '@angular/core';
import { BrnPopoverContent } from '@brain/popover';

@Directive({
	selector: '[hlmPopoverPortal]',
	hostDirectives: [{ directive: BrnPopoverContent, inputs: ['context', 'class'] }],
})
export class HlmPopoverPortal { }
