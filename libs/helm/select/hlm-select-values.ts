import { Directive } from '@angular/core';
import { BrnSelectValues } from '@brain/select';

@Directive({ selector: '[hlmSelectValues]', hostDirectives: [BrnSelectValues] })
export class HlmSelectValues { }
