export enum UserState {
	active = 'active',
	inactive = 'inactive',
}

export function getUserStateDisplayName(state: UserState): string {
	const displayNames: Record<UserState, string> = {
		[UserState.active]: 'Active',
		[UserState.inactive]: 'Inactive',
	};
	return displayNames[state];
}

export function getUserStateColor(state: UserState): string {
	const colors: Record<UserState, string> = {
		[UserState.active]: 'bg-green-100 text-green-800',
		[UserState.inactive]: 'bg-gray-100 text-gray-800',
	};
	return colors[state];
}

export function toggleUserState(currentState: UserState): UserState {
	return currentState === UserState.active
		? UserState.inactive
		: UserState.active;
}
