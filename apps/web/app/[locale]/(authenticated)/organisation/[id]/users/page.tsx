'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getOrganisationWithDetailsAction } from '@src/lib/db/organisation/organisation.actions';
import { notFound } from 'next/navigation';
import MembersTable from '@src/components/tables/members-table';

interface OrganisationUsersPageProps {
	params: Promise<{ id: string }>;
}

export default async function OrganisationUsersPage({
	params,
}: OrganisationUsersPageProps) {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { id } = await params;
	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	const { data: organisation, isSuccess } =
		await getOrganisationWithDetailsAction(id);

	if (!isSuccess || !organisation) {
		notFound();
	}

	return (
		<div className="space-y-4">
			{organisation.members && organisation.members.length > 0 ? (
				<MembersTable
					data={organisation.members}
					title="Organization Members"
					description={`Members of ${organisation.name}`}
					roleVariant="admin"
				/>
			) : (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No members found</p>
				</div>
			)}
		</div>
	);
}
