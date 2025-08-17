'use server';

import { Plus } from 'lucide-react';
import { notFound } from 'next/navigation';

import { getOrganisationWithDetailsAction } from '@src/lib/db/organisation/organisation.actions';
import { Button } from '@shadcn/ui/button';
import TeamsTable from '@src/components/tables/teams-table';

interface OrganisationTeamsPageProps {
	params: Promise<{ id: string }>;
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

	return (
		<div className="space-y-4">
			{organisation.teams && organisation.teams.length > 0 ? (
				<TeamsTable
					data={organisation.teams}
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
