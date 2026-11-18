import { Directive } from '@angular/core';
import { BrnDialogDescription } from '../dialog';

@Directive({
	selector: '[brnSheetDescription]',
	hostDirectives: [BrnDialogDescription],
})
export class BrnSheetDescription { }
