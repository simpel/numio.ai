'use client';

import {
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
} from '@shadcn/ui/context-menu';
import BaseContextMenu from './base-context-menu';

interface StateOption {
	value: string;
	label: string;
	color?: string;
}

interface StateContextMenuProps<T = unknown> {
	children: React.ReactNode;
	availableStates?: StateOption[];
	onStateChange?: (newState: string) => void;
	currentState?: string;
	additionalItems?: React.ReactNode | ((row: T) => React.ReactNode);
	rowData?: T;
	stateLabel?: string;
}

export default function StateContextMenu<T = unknown>({
	children,
	availableStates = [],
	onStateChange,
	currentState,
	additionalItems,
	rowData,
	stateLabel = 'Status',
}: StateContextMenuProps<T>) {
	const renderStateItems = () => {
		if (!availableStates.length || !onStateChange || !currentState) {
			return null;
		}

		return (
			<>
				<ContextMenuSub>
					<ContextMenuSubTrigger>{stateLabel}</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<ContextMenuRadioGroup
							value={currentState}
							onValueChange={onStateChange}
						>
							{availableStates.map((state) => (
								<ContextMenuRadioItem
									key={state.value}
									value={state.value}
									className="cursor-pointer"
								>
									{state.label}
								</ContextMenuRadioItem>
							))}
						</ContextMenuRadioGroup>
					</ContextMenuSubContent>
				</ContextMenuSub>
				{additionalItems && <ContextMenuSeparator />}
			</>
		);
	};

	const renderAdditionalItems = () => {
		if (!additionalItems) return null;

		if (typeof additionalItems === 'function') {
			return additionalItems(rowData as T);
		}

		return additionalItems;
	};

	return (
		<BaseContextMenu<T>
			additionalItems={() => (
				<>
					{renderStateItems()}
					{renderAdditionalItems()}
				</>
			)}
			rowData={rowData}
		>
			{children}
		</BaseContextMenu>
	);
}
