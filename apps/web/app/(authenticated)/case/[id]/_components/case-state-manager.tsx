'use client';

import { useState } from 'react';
import StateDropdown from '@src/components/state-dropdown';
import {
	CaseState,
	getAvailableTransitions,
	getStateDisplayName,
} from '@src/lib/state-machines/case-state-machine';
import { updateCaseStateAction } from '@src/lib/db/case/case.actions';
import { toast } from 'sonner';

interface CaseStateManagerProps {
	caseId: string;
	currentState: string;
}

export default function CaseStateManager({
	caseId,
	currentState,
}: CaseStateManagerProps) {
	const [isUpdating, setIsUpdating] = useState(false);

	const handleStateChange = async (newState: string) => {
		setIsUpdating(true);
		try {
			const result = await updateCaseStateAction(caseId, newState);
			if (result.isSuccess) {
				toast.success('Case state updated successfully');
				// Refresh the page to show updated data
				window.location.reload();
			} else {
				toast.error(result.message || 'Failed to update case state');
			}
		} catch (error) {
			console.error('State change error:', error);
			toast.error('Failed to update case state');
		} finally {
			setIsUpdating(false);
		}
	};

	const getStateOptions = () => {
		// Ensure we have a valid current state
		const validCurrentState = currentState || 'created';

		const availableTransitions = getAvailableTransitions(
			validCurrentState as CaseState
		);

		return availableTransitions.map((state) => ({
			value: state,
			label: getStateDisplayName(state),
			color: '', // No longer used
		}));
	};

	const stateOptions = getStateOptions();

	return (
		<div className="space-y-3">
			{stateOptions.length > 0 ? (
				<div>
					<label className="text-muted-foreground mb-2 block text-sm font-medium">
						Change State
					</label>
					<StateDropdown
						currentState={currentState || 'created'}
						availableStates={stateOptions}
						onStateChange={handleStateChange}
						disabled={isUpdating}
						placeholder="Select new state..."
						className="w-full"
					/>
				</div>
			) : (
				<div>
					<label className="text-muted-foreground mb-2 block text-sm font-medium">
						Current State
					</label>
					<div className="text-sm font-medium">
						{getStateDisplayName((currentState || 'created') as CaseState)}
					</div>
					<p className="text-muted-foreground mt-2 text-sm">
						No state transitions available from current state.
					</p>
				</div>
			)}
		</div>
	);
}
