import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: 'main[hlmSidebarInset]',
  exportAs: 'hlmSidebarInset',
  host: { 'data-slot': 'sidebar-inset' },
})
export class HlmSidebarInset {
  constructor() {
    classes(
      () =>
        'bg-background md:peer-data-[variant=floating]:m-8 md:peer-data-[variant=floating]:ms-0 md:peer-data-[variant=floating]:rounded-[20px] md:peer-data-[variant=floating]:shadow-[-2px_4px_12px_0px_rgba(87,87,87,0.15)] md:peer-data-[variant=floating]:peer-data-[state=collapsed]:ms-2 relative flex w-full flex-1 flex-col overflow-hidden',
    );
  }
}
