'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getUserTeamMembershipsAction } from '@src/lib/db/membership/membership.actions';
import { getAllTeamsAction } from '@src/lib/db/team/team.actions';
import { getTeamMetricsAction } from '@src/lib/db/team/team-metrics.actions';
import { Role } from '@src/lib/auth/auth.utils';
import TeamsTable from '@src/components/tables/teams-table';
import TeamMetricsChart from '@src/components/charts/team-metrics-chart';
import ErrorBoundary from '@src/components/error-boundary';

interface TeamData {
	id: string;
	name: string;
	description?: string;
	organisation: string;
	organisationId?: string;
	owner?: string;
	usersCount?: number;
	members?: { id: string; name: string; role: string; image?: string }[];
	createdAt?: string;
}

// Type for team context with memberships
interface TeamContext {
	id: string;
	name: string;
	createdAt?: string;
	organisation: {
		name: string;
	};
	contextMemberships?: TeamMembership[];
	_count?: {
		contextMemberships?: number;
		teamMemberships?: number;
	};
}

// Type for team membership with user profile
interface TeamMembership {
	userProfile: {
		id: string;
		firstName?: string;
		lastName?: string;
		image?: string;
	};
	role: string;
}

// Type for team with relations
interface TeamWithRelations {
	id: string;
	name: string;
	createdAt?: string;
	organisation: {
		name: string;
	};
	contextMemberships?: TeamMembership[];
	_count?: {
		contextMemberships?: number;
		teamMemberships?: number;
	};
}

export default async function SettingsTeamsPage() {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	// Get user's team memberships
	const { data: userTeamMemberships } = await getUserTeamMembershipsAction(
		profile.id
	);

	const userTeamsData: TeamData[] =
		userTeamMemberships
			?.filter(({ teamContext }) => teamContext !== null)
			.map(({ teamContext }) => {
				const contextMemberships =
					(teamContext as TeamContext)?.contextMemberships || [];

				// Map all members with their roles
				const members = contextMemberships.map((m: TeamMembership) => ({
					id: m.userProfile.id,
					name: `${m.userProfile.firstName || ''} ${m.userProfile.lastName || ''}`.trim(),
					role: m.role,
					image: m.userProfile.image,
				}));

				return {
					id: teamContext!.id,
					name: teamContext!.name,
					organisation: teamContext!.organisation.name,
					usersCount:
						// Prefer context memberships count if available, fall back to team memberships
						(teamContext as TeamContext)?._count?.contextMemberships ??
						(teamContext as TeamContext)?._count?.teamMemberships ??
						0,
					members,
					createdAt: (teamContext as TeamContext)?.createdAt?.toISOString(),
				};
			}) || [];

	// Get all teams for superadmin
	let allTeamsData: TeamData[] = [];

	// Get team metrics for chart (only for superadmin)
	let teamMetrics = null;
	if (profile?.role === Role.superadmin) {
		const { data: metrics } = await getTeamMetricsAction(30);
		teamMetrics = metrics;
	}

	if (profile?.role === Role.superadmin) {
		const { data: allTeams } = await getAllTeamsAction();

		allTeamsData =
			allTeams?.map((team: TeamWithRelations) => {
				const contextMemberships = team.contextMemberships || [];

				// Map all members with their roles
				const members = contextMemberships.map((m: TeamMembership) => ({
					id: m.userProfile.id,
					name: `${m.userProfile.firstName || ''} ${m.userProfile.lastName || ''}`.trim(),
					role: m.role,
					image: m.userProfile.image,
				}));

				return {
					id: team.id,
					name: team.name,
					organisation: team.organisation.name,
					usersCount:
						team._count?.contextMemberships ??
						team._count?.teamMemberships ??
						0,
					members,
					createdAt: team.createdAt?.toISOString(),
				};
			}) || [];
	}

	return (
		<div className="space-y-6">
			{/* Team Metrics Chart (Superadmin only) */}
			{profile?.role === Role.superadmin &&
				teamMetrics &&
				teamMetrics.length > 0 && <TeamMetricsChart data={teamMetrics} />}

			{/* User's Teams */}
			{userTeamsData.length > 0 && (
				<ErrorBoundary>
					<TeamsTable
						data={userTeamsData}
						title="Your Teams"
						description="Teams you have access to"
						showDescription={false}
						showOwner={false}
						showCreatedAt={true}
					/>
				</ErrorBoundary>
			)}

			{/* All Teams (Superadmin only) */}
			{profile?.role === Role.superadmin && allTeamsData.length > 0 && (
				<ErrorBoundary>
					<TeamsTable
						data={allTeamsData}
						title="All Teams"
						description="All teams in the system"
						showDescription={false}
						showOwner={false}
						showCreatedAt={true}
					/>
				</ErrorBoundary>
			)}

			{/* Empty state */}
			{userTeamsData.length === 0 &&
				(profile?.role !== Role.superadmin || allTeamsData.length === 0) && (
					<div className="py-8 text-center">
						<p className="text-muted-foreground">No teams found.</p>
					</div>
				)}
		</div>
	);
}
