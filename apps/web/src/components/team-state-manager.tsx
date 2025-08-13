'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@shadcn/ui/badge';
import { Button } from '@shadcn/ui/button';
import {
	getTeamStateDisplayName,
	getTeamStateColor,
	toggleTeamState,
	TeamState,
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
	const router = useRouter();
	const [isUpdating, setIsUpdating] = useState(false);

	const handleStateToggle = async () => {
		if (!canEdit) return;

		setIsUpdating(true);
		try {
			const newState = toggleTeamState(currentState as TeamState);
			const result = await updateTeamStateAction(teamId, newState);
			if (result.isSuccess) {
				toast.success('Team state updated successfully');
				// Refresh the current route to re-fetch data
				router.refresh();
			} else {
				toast.error(result.message || 'Failed to update team state');
			}
		} catch {
			toast.error('Failed to update team state');
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<Badge
					className={getTeamStateColor(currentState as TeamState)}
				>
					{getTeamStateDisplayName(currentState as TeamState)}
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
						: `Toggle to ${toggleTeamState(currentState as TeamState) === TeamState.active ? 'Active' : 'Inactive'}`}
				</Button>
			)}
		</div>
	);
}
