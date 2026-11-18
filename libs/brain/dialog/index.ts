import { BrnDialog } from './brn-dialog';
import { BrnDialogClose } from './brn-dialog-close';
import { BrnDialogContent } from './brn-dialog-content';
import { BrnDialogDescription } from './brn-dialog-description';
import { BrnDialogOverlay } from './brn-dialog-overlay';
import { BrnDialogTitle } from './brn-dialog-title';
import { BrnDialogTrigger } from './brn-dialog-trigger';

export * from './brn-dialog';
export * from './brn-dialog-close';
export * from './brn-dialog-content';
export * from './brn-dialog-description';
export * from './brn-dialog-options';
export * from './brn-dialog-overlay';
export * from './brn-dialog-ref';
export * from './brn-dialog-state';
export * from './brn-dialog-title';
export * from './brn-dialog-token';
export * from './brn-dialog-trigger';
export * from './brn-dialog-utils';
export * from './brn-dialog.service';

export const BrnDialogImports = [
	BrnDialog,
	BrnDialogOverlay,
	BrnDialogTrigger,
	BrnDialogClose,
	BrnDialogContent,
	BrnDialogTitle,
	BrnDialogDescription,
] as const;
