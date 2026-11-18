import { BrnAccordion } from './brn-accordion';
import { BrnAccordionContent } from './brn-accordion-content';
import { BrnAccordionHeader } from './brn-accordion-header';
import { BrnAccordionItem } from './brn-accordion-item';
import { BrnAccordionTrigger } from './brn-accordion-trigger';

export * from './brn-accordion';
export * from './brn-accordion-content';
export * from './brn-accordion-header';
export * from './brn-accordion-item';
export * from './brn-accordion-token';
export * from './brn-accordion-trigger';

export const BrnAccordionImports = [
	BrnAccordion,
	BrnAccordionContent,
	BrnAccordionHeader,
	BrnAccordionItem,
	BrnAccordionTrigger,
] as const;
