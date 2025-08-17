'use server';

import { getAllTeamsAction } from '@src/lib/db/team/team.actions';
import { getTeamMetricsAction } from '@src/lib/db/team/team-metrics.actions';
import TeamsTable from '@src/components/tables/teams-table';
import TeamMetricsChart from '@src/components/charts/team-metrics-chart';
import ErrorBoundary from '@src/components/error-boundary';

export default async function AdminTeamsPage() {
	// Get all teams (no role filtering in admin)
	const { data: allTeams } = await getAllTeamsAction();

	// Get team metrics for chart
	const { data: teamMetrics } = await getTeamMetricsAction(30);

	return (
		<div className="space-y-6">
			{/* Team Metrics Chart */}
			{teamMetrics && teamMetrics.length > 0 && (
				<ErrorBoundary>
					<TeamMetricsChart data={teamMetrics} />
				</ErrorBoundary>
			)}

			{/* All Teams */}
			{allTeams && allTeams.length > 0 && (
				<ErrorBoundary>
					<TeamsTable
						data={allTeams}
						title="All Teams"
						description="All teams in the system"
						showDescription={false}
						showOwner={false}
						showCreatedAt={true}
					/>
				</ErrorBoundary>
			)}

			{/* Empty state */}
			{(!allTeams || allTeams.length === 0) && (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No teams found.</p>
				</div>
			)}
		</div>
	);
}
