'use client';

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuTrigger,
} from '@shadcn/ui/context-menu';

interface BaseContextMenuProps<T = unknown> {
	children: React.ReactNode;
	additionalItems?: React.ReactNode | ((row: T) => React.ReactNode);
	rowData?: T;
}

export default function BaseContextMenu<T = unknown>({
	children,
	additionalItems,
	rowData,
}: BaseContextMenuProps<T>) {
	// Handle additional items - can be either a React node or a function
	const renderAdditionalItems = () => {
		if (!additionalItems) return null;

		if (typeof additionalItems === 'function') {
			return additionalItems(rowData as T);
		}

		return additionalItems;
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent>{renderAdditionalItems()}</ContextMenuContent>
		</ContextMenu>
	);
}
