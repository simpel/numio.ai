'use client';

import { useState } from 'react';
import { Badge } from '@shadcn/ui/badge';
import { Button } from '@shadcn/ui/button';
import {
	getTeamStateDisplayName,
	getTeamStateColor,
	toggleTeamState,
} from '@src/lib/state-machines/team-state-machine';
import { updateTeamStateAction } from '@src/lib/db/team/team.actions';
import { toast } from 'sonner';

interface TeamStateManagerProps {
	teamId: string;
	currentState: string;
	canEdit?: boolean;
}

export default function TeamStateManager({
	teamId,
	currentState,
	canEdit = true,
}: TeamStateManagerProps) {
	const [isUpdating, setIsUpdating] = useState(false);

	const handleStateToggle = async () => {
		if (!canEdit) return;

		setIsUpdating(true);
		try {
			const newState = toggleTeamState(currentState as any);
			const result = await updateTeamStateAction(teamId, newState);
			if (result.isSuccess) {
				toast.success('Team state updated successfully');
				// Refresh the page to show updated data
				window.location.reload();
			} else {
				toast.error(result.message || 'Failed to update team state');
			}
		} catch (error) {
			toast.error('Failed to update team state');
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<Badge className={getTeamStateColor(currentState as any)}>
					{getTeamStateDisplayName(currentState as any)}
				</Badge>
			</div>

			{canEdit && (
				<Button
					variant="outline"
					size="sm"
					onClick={handleStateToggle}
					disabled={isUpdating}
				>
					{isUpdating
						? 'Updating...'
						: `Toggle to ${toggleTeamState(currentState as any) === 'active' ? 'Active' : 'Inactive'}`}
				</Button>
			)}
		</div>
	);
}
