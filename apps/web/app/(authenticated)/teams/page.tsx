import { Plus } from 'lucide-react';
import Link from 'next/link';

import { getTeamsForUserAction } from '@src/lib/db/team/team.actions';
import { Button } from '@shadcn/ui/button';
import TeamsTable from '@src/components/tables/teams-table';
import ErrorBoundary from '@src/components/error-boundary';

interface TeamData {
	id: string;
	name: string;
	organisation: string;
}

export default async function TeamsPage() {
	const {
		data: teamMemberships,
		message,
		isSuccess,
	} = await getTeamsForUserAction();

	const teamsData: TeamData[] =
		teamMemberships
			?.filter(({ teamContext }) => teamContext !== null)
			.map(({ teamContext }) => ({
				id: teamContext!.id,
				name: teamContext!.name,
				organisation: teamContext!.organisation.name,
			})) || [];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Your Teams</h1>
					<p className="text-muted-foreground">Teams you're a member of</p>
				</div>
				<Button asChild>
					<Link href="/teams/create">
						<Plus className="mr-2 h-4 w-4" /> Create Team
					</Link>
				</Button>
			</div>

			{isSuccess && teamsData.length > 0 ? (
				<ErrorBoundary>
					<TeamsTable
						data={teamsData}
						title="Teams"
						description="All teams you're a member of"
						showDescription={false}
						showOwner={false}
					/>
				</ErrorBoundary>
			) : (
				<div className="py-12 text-center">
					<h3 className="mb-2 text-lg font-semibold">No Teams Yet</h3>
					<p className="text-muted-foreground mb-6">
						{message ||
							"You're not part of any teams yet. Create your first team to get started."}
					</p>
					<Button asChild>
						<Link href="/teams/create">
							<Plus className="mr-2 h-4 w-4" /> Create Your First Team
						</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
