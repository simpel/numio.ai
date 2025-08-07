export enum OrganizationState {
	active = 'active',
	inactive = 'inactive',
}

export function getOrganizationStateDisplayName(
	state: OrganizationState
): string {
	const displayNames: Record<OrganizationState, string> = {
		[OrganizationState.active]: 'Active',
		[OrganizationState.inactive]: 'Inactive',
	};
	return displayNames[state];
}

export function getOrganizationStateColor(state: OrganizationState): string {
	const colors: Record<OrganizationState, string> = {
		[OrganizationState.active]: 'bg-green-100 text-green-800',
		[OrganizationState.inactive]: 'bg-gray-100 text-gray-800',
	};
	return colors[state];
}

export function toggleOrganizationState(
	currentState: OrganizationState
): OrganizationState {
	return currentState === OrganizationState.active
		? OrganizationState.inactive
		: OrganizationState.active;
}
