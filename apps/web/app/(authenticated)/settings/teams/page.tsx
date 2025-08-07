'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getTeamsForUserAction } from '@src/lib/db/team/team.actions';
import { getAllTeamsAction } from '@src/lib/db/team/team.actions';
import ErrorBoundary from '@src/components/error-boundary';
import TeamsTable from '@src/components/tables/teams-table';

interface TeamData {
	id: string;
	name: string;
	organisation: string;
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

	// Check if user is superadmin
	const isSuperAdmin = profile.role === ('superadmin' as any);

	// Get user's teams
	const { data: userTeamMemberships } = await getTeamsForUserAction();

	// Transform user's data
	const userTeamsData: TeamData[] =
		userTeamMemberships
			?.filter(({ teamContext }) => teamContext !== null)
			.map(({ teamContext }) => ({
				id: teamContext!.id,
				name: teamContext!.name,
				organisation: teamContext!.organisation.name,
			})) || [];

	// Get all teams for superadmin
	let allTeamsData: TeamData[] = [];

	if (isSuperAdmin) {
		const { data: allTeams } = await getAllTeamsAction();

		allTeamsData =
			allTeams?.map((team: any) => ({
				id: team.id,
				name: team.name,
				organisation: team.organisation.name,
			})) || [];
	}

	return (
		<div className="space-y-6">
			{/* User's Teams */}
			{userTeamsData.length > 0 && (
				<ErrorBoundary>
					<TeamsTable
						data={userTeamsData}
						title="Your Teams"
						description="Teams you have access to"
						showDescription={false}
						showOwner={false}
						showActions={true}
					/>
				</ErrorBoundary>
			)}

			{/* All Teams (Superadmin only) */}
			{isSuperAdmin && allTeamsData.length > 0 && (
				<ErrorBoundary>
					<TeamsTable
						data={allTeamsData}
						title="All Teams"
						description="All teams in the system"
						showDescription={false}
						showOwner={false}
						showActions={true}
					/>
				</ErrorBoundary>
			)}

			{userTeamsData.length === 0 && !isSuperAdmin && (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No teams found.</p>
				</div>
			)}
		</div>
	);
}
