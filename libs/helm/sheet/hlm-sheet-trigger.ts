import { Directive } from '@angular/core';
import { BrnSheetTrigger } from '@brain/sheet';

@Directive({
	selector: 'button[hlmSheetTrigger]',
	hostDirectives: [{ directive: BrnSheetTrigger, inputs: ['id', 'side', 'type'] }],
	host: { 'data-slot': 'sheet-trigger' },
})
export class HlmSheetTrigger { }
