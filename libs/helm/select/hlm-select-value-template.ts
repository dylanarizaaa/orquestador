import { Directive } from '@angular/core';
import { BrnSelectValueTemplate } from '@brain/select';

@Directive({ selector: '[hlmSelectValueTemplate]', hostDirectives: [BrnSelectValueTemplate] })
export class HlmSelectValueTemplate { }
