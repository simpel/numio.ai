'use server';

import { getAllTeamsAction } from '@src/lib/db/team/team.actions';
import { getTeamMetricsAction } from '@src/lib/db/team/team-metrics.actions';
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
	members?: any[];
	_count?: {
		members?: number;
		memberships?: number;
	};
}

export default async function AdminTeamsPage() {
	// Get all teams (no role filtering in admin)
	const { data: allTeams } = await getAllTeamsAction();

	// Get team metrics for chart
	const { data: teamMetrics } = await getTeamMetricsAction(30);

	const allTeamsData: TeamData[] =
		allTeams?.map((team: any) => {
			const memberships = team.members || [];

			// Map all members with their roles
			const members = memberships.map((m: any) => ({
				id: m.memberUserProfile?.id || '',
				name: `${m.memberUserProfile?.firstName || ''} ${m.memberUserProfile?.lastName || ''}`.trim(),
				role: m.role,
				image: m.memberUserProfile?.image,
			}));

			return {
				id: team.id,
				name: team.name,
				organisation: team.organisation.name,
				usersCount: team._count?.members ?? 0,
				members,
				createdAt: team.createdAt?.toString(),
			};
		}) || [];

	return (
		<div className="space-y-6">
			{/* Team Metrics Chart */}
			{teamMetrics && teamMetrics.length > 0 && (
				<ErrorBoundary>
					<TeamMetricsChart data={teamMetrics} />
				</ErrorBoundary>
			)}

			{/* All Teams */}
			{allTeamsData.length > 0 && (
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
			{allTeamsData.length === 0 && (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No teams found.</p>
				</div>
			)}
		</div>
	);
}
