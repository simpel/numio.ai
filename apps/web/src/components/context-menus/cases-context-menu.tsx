'use client';

import StateContextMenu from './state-context-menu';
import {
	CaseState,
	getAvailableTransitions,
	getStateDisplayName,
} from '@src/lib/state-machines/case-state-machine';

interface CaseData {
	id: string;
	title: string;
	description?: string;
	client?: string;
	clientId?: string;
	status?: string;
	state?: string;
	createdAt: string;
}

interface CasesContextMenuProps {
	children: React.ReactNode;
	rowData?: CaseData;
	onStateChange: (caseId: string, newState: string) => void;
}

export default function CasesContextMenu({
	children,
	rowData,
	onStateChange,
}: CasesContextMenuProps) {
	const caseData = rowData as CaseData;
	const currentState = caseData?.state || 'created';

	const getStateOptions = (currentState: string) => {
		try {
			const availableTransitions = getAvailableTransitions(
				currentState as CaseState
			);
			return availableTransitions.map((state) => ({
				value: state,
				label: getStateDisplayName(state),
				color: '',
			}));
		} catch (error) {
			console.error('Error getting state options:', error);
			return [];
		}
	};

	const availableStates = getStateOptions(currentState);

	const handleStateChange = (newState: string) => {
		if (caseData?.id) {
			onStateChange(caseData.id, newState);
		}
	};

	return (
		<StateContextMenu
			availableStates={availableStates}
			onStateChange={handleStateChange}
			currentState={currentState}
			rowData={rowData}
			stateLabel="Status"
		>
			{children}
		</StateContextMenu>
	);
}
