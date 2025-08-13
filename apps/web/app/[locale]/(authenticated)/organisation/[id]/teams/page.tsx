'use server';

import { Plus } from 'lucide-react';
import { notFound } from 'next/navigation';

import { getOrganisationWithDetailsAction } from '@src/lib/db/organisation/organisation.actions';
import { Button } from '@shadcn/ui/button';
import TeamsTable from '@src/components/tables/teams-table';

interface OrganisationTeamsPageProps {
	params: Promise<{ id: string }>;
}

interface TeamData {
	id: string;
	name: string;
	description?: string;
	organisation?: string;
	organisationId?: string;
	owner?: string;
	usersCount?: number;
	members?: { id: string; name: string; role: string; image?: string }[];
	createdAt?: string;
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

export default async function OrganisationTeamsPage({
	params,
}: OrganisationTeamsPageProps) {
	const { id } = await params;
	const { data: organisation, isSuccess } =
		await getOrganisationWithDetailsAction(id);

	if (!isSuccess || !organisation) {
		notFound();
	}

	const teamsData: TeamData[] =
		organisation.teams?.map((team) => {
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
				description: team.description || undefined,
				organisation: organisation.name,
				organisationId: organisation.id,
				owner: undefined, // Teams don't have owners in new schema
				usersCount: team._count?.members ?? 0,
				members,
				createdAt: team.createdAt?.toISOString(),
			};
		}) || [];

	return (
		<div className="space-y-4">
			{organisation.teams.length > 0 ? (
				<TeamsTable
					data={teamsData}
					title="Teams"
					description={`Teams in ${organisation?.name}`}
					showDescription={true}
					showOrganisation={false}
					showOwner={true}
					showCreatedAt={true}
				/>
			) : (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No teams created yet</p>
					<Button className="mt-4" variant="outline">
						<Plus className="mr-2 h-4 w-4" />
						Create Team
					</Button>
				</div>
			)}
		</div>
	);
}
