export enum TeamMemberState {
	member = 'member',
	active = 'active',
}

export interface TeamMemberStateTransition {
	from: TeamMemberState;
	to: TeamMemberState[];
}

// Simple two-state machine: member -> active -> member
export const TEAM_MEMBER_STATE_TRANSITIONS: TeamMemberStateTransition[] = [
	{
		from: TeamMemberState.member,
		to: [TeamMemberState.active],
	},
	{
		from: TeamMemberState.active,
		to: [TeamMemberState.member],
	},
];

export function getTeamMemberAvailableTransitions(
	currentState: TeamMemberState
): TeamMemberState[] {
	const transition = TEAM_MEMBER_STATE_TRANSITIONS.find(
		(t) => t.from === currentState
	);
	return transition ? transition.to : [];
}

export function canTeamMemberTransitionTo(
	currentState: TeamMemberState,
	targetState: TeamMemberState
): boolean {
	const availableTransitions = getTeamMemberAvailableTransitions(currentState);
	return availableTransitions.includes(targetState);
}

export function getTeamMemberStateDisplayName(state: TeamMemberState): string {
	const displayNames: Record<TeamMemberState, string> = {
		[TeamMemberState.member]: 'Member',
		[TeamMemberState.active]: 'Active',
	};
	return displayNames[state];
}

export function getTeamMemberStateBadgeVariant(
	state: TeamMemberState
): 'default' | 'outline' | 'secondary' {
	switch (state) {
		case TeamMemberState.active:
			return 'default';
		case TeamMemberState.member:
		default:
			return 'outline';
	}
}
