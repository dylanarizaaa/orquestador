import { Directive } from '@angular/core';
import { BrnSheetContent } from '@brain/sheet';

@Directive({
	selector: '[hlmSheetPortal]',
	hostDirectives: [{ directive: BrnSheetContent, inputs: ['context', 'class'] }],
})
export class HlmSheetPortal { }
