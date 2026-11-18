import { Directive } from '@angular/core';
import { BrnCollapsibleTrigger } from '@brain/collapsible';

@Directive({
	selector: 'button[hlmCollapsibleTrigger]',
	hostDirectives: [{ directive: BrnCollapsibleTrigger, inputs: ['type'] }],
	host: { 'data-slot': 'collapsible-trigger' },
})
export class HlmCollapsibleTrigger { }
