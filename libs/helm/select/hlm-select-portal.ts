import { Directive } from '@angular/core';
import { BrnPopoverContent } from '@brain/popover';

@Directive({
	selector: '[hlmSelectPortal]',
	hostDirectives: [{ directive: BrnPopoverContent, inputs: ['context', 'class'] }],
})
export class HlmSelectPortal { }
