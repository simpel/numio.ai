export enum CaseState {
	created = 'created',
	active = 'active',
	onHold = 'on_hold',
	completed = 'completed',
	closed = 'closed',
}

export interface CaseStateTransition {
	from: CaseState;
	to: CaseState[];
}

export const CASE_STATE_TRANSITIONS: CaseStateTransition[] = [
	{
		from: CaseState.created,
		to: [CaseState.active],
	},
	{
		from: CaseState.active,
		to: [CaseState.onHold, CaseState.completed],
	},
	{
		from: CaseState.onHold,
		to: [CaseState.active, CaseState.completed],
	},
	{
		from: CaseState.completed,
		to: [CaseState.onHold, CaseState.active, CaseState.closed],
	},
	{
		from: CaseState.closed,
		to: [
			CaseState.created,
			CaseState.active,
			CaseState.onHold,
			CaseState.completed,
		],
	},
];

export function getAvailableTransitions(currentState: CaseState): CaseState[] {
	const transition = CASE_STATE_TRANSITIONS.find(
		(t) => t.from === currentState
	);
	return transition ? transition.to : [];
}

export function canTransitionTo(
	currentState: CaseState,
	targetState: CaseState
): boolean {
	const availableTransitions = getAvailableTransitions(currentState);
	return availableTransitions.includes(targetState);
}

export function getStateDisplayName(state: CaseState): string {
	const displayNames: Record<CaseState, string> = {
		[CaseState.created]: 'Created',
		[CaseState.active]: 'Active',
		[CaseState.onHold]: 'On Hold',
		[CaseState.completed]: 'Completed',
		[CaseState.closed]: 'Closed',
	};
	return displayNames[state];
}

export function getStateColor(state: CaseState): string {
	const colors: Record<CaseState, string> = {
		[CaseState.created]: 'bg-blue-100 text-blue-800',
		[CaseState.active]: 'bg-green-100 text-green-800',
		[CaseState.onHold]: 'bg-yellow-100 text-yellow-800',
		[CaseState.completed]: 'bg-purple-100 text-purple-800',
		[CaseState.closed]: 'bg-gray-100 text-gray-800',
	};
	return colors[state];
}
