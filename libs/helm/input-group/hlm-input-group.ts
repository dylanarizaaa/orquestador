import { Directive } from '@angular/core';
import { classes } from '../utils';

@Directive({
  selector: '[hlmInputGroup],hlm-input-group',
  host: {
    'data-slot': 'input-group',
    role: 'group',
  },
})
export class HlmInputGroup {
  constructor() {
    classes(
      () =>
        'group/input-group border-input dark:bg-input/30 has-[[data-slot=input-group-control]:focus-visible]:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-accent has-[[data-slot][data-matches-spartan-invalid=true]]:ring-destructive has-[[data-slot][data-matches-spartan-invalid=true]]:border-transparent dark:has-[[data-slot][data-matches-spartan-invalid=true]]:ring-destructive/40 h-10 rounded-md border shadow-xs transition-[color,box-shadow] in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot][data-matches-spartan-invalid=true]]:ring-2 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pe-1.5 has-[>[data-align=inline-start]]:[&>input]:ps-1.5 relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto',
    );
  }
}
