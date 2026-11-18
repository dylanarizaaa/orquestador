import { BrnCollapsible } from './brn-collapsible';
import { BrnCollapsibleContent } from './brn-collapsible-content';
import { BrnCollapsibleTrigger } from './brn-collapsible-trigger';

export * from './brn-collapsible';
export * from './brn-collapsible-content';
export * from './brn-collapsible-token';
export * from './brn-collapsible-trigger';

export const BrnCollapsibleImports = [BrnCollapsible, BrnCollapsibleTrigger, BrnCollapsibleContent] as const;
