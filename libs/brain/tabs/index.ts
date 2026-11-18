import { BrnTabs } from './brn-tabs';
import { BrnTabsContent } from './brn-tabs-content';
import { BrnTabsContentLazy } from './brn-tabs-content-lazy';
import { BrnTabsList } from './brn-tabs-list';
import { BrnTabsTrigger } from './brn-tabs-trigger';

export * from './brn-tabs';
export * from './brn-tabs-content';
export * from './brn-tabs-content-lazy';
export * from './brn-tabs-list';
export * from './brn-tabs-paginated-list';
export * from './brn-tabs-trigger';

export const BrnTabsImports = [BrnTabs, BrnTabsList, BrnTabsTrigger, BrnTabsContent, BrnTabsContentLazy] as const;
