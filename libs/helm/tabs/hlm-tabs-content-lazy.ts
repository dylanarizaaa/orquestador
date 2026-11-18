import { Directive } from '@angular/core';
import { BrnTabsContentLazy } from '@brain/tabs';

@Directive({
	selector: 'ng-template[hlmTabsContentLazy]',
	hostDirectives: [BrnTabsContentLazy],
})
export class HlmTabsContentLazy { }
