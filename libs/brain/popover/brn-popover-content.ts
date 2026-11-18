import { Directive } from '@angular/core';
import { provideExposesStateProviderExisting } from '../core';
import { BrnOverlayContent } from '../overlay';

@Directive({
	selector: '[brnPopoverContent]',
	providers: [provideExposesStateProviderExisting(() => BrnPopoverContent)],
})
export class BrnPopoverContent<T extends Record<string, unknown>> extends BrnOverlayContent<T> { }
