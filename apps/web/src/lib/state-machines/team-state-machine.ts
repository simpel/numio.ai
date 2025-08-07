export enum TeamState {
	active = 'active',
	inactive = 'inactive',
}

export function getTeamStateDisplayName(state: TeamState): string {
	const displayNames: Record<TeamState, string> = {
		[TeamState.active]: 'Active',
		[TeamState.inactive]: 'Inactive',
	};
	return displayNames[state];
}

export function getTeamStateColor(state: TeamState): string {
	const colors: Record<TeamState, string> = {
		[TeamState.active]: 'bg-green-100 text-green-800',
		[TeamState.inactive]: 'bg-gray-100 text-gray-800',
	};
	return colors[state];
}

export function toggleTeamState(currentState: TeamState): TeamState {
	return currentState === TeamState.active
		? TeamState.inactive
		: TeamState.active;
}
