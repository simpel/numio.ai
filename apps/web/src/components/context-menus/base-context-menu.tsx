'use client';

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuTrigger,
} from '@shadcn/ui/context-menu';

interface BaseContextMenuProps {
	children: React.ReactNode;
	additionalItems?: React.ReactNode | ((row: any) => React.ReactNode);
	rowData?: any;
}

export default function BaseContextMenu({
	children,
	additionalItems,
	rowData,
}: BaseContextMenuProps) {
	// Handle additional items - can be either a React node or a function
	const renderAdditionalItems = () => {
		if (!additionalItems) return null;

		if (typeof additionalItems === 'function') {
			return additionalItems(rowData);
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
