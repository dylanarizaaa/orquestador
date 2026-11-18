import { Directive } from '@angular/core';
import { BrnDialogTitle } from '../dialog';

@Directive({
	selector: '[brnSheetTitle]',
	hostDirectives: [BrnDialogTitle],
})
export class BrnSheetTitle { }
