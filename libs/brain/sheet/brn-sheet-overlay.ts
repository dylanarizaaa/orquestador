import { Directive } from '@angular/core';
import { provideCustomClassSettableExisting } from '../core';
import { BrnDialogOverlay } from '../dialog';

@Directive({
	selector: '[brnSheetOverlay],brn-sheet-overlay',
	providers: [provideCustomClassSettableExisting(() => BrnSheetOverlay)],
})
export class BrnSheetOverlay extends BrnDialogOverlay { }
