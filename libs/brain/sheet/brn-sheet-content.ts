import { Directive, inject } from '@angular/core';
import {
	type ExposesSide,
	provideExposedSideProviderExisting,
	provideExposesStateProviderExisting,
} from '../core';
import { BrnDialogContent } from '../dialog';
import { BrnSheet } from './brn-sheet';

@Directive({
	selector: '[brnSheetContent]',
	providers: [
		provideExposesStateProviderExisting(() => BrnSheetContent),
		provideExposedSideProviderExisting(() => BrnSheetContent),
	],
})
export class BrnSheetContent<T extends Record<string, unknown>> extends BrnDialogContent<T> implements ExposesSide {
	public readonly side = inject(BrnSheet).sideState;
}
