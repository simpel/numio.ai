'use server';

import { notFound } from 'next/navigation';

import { getOrganisationWithDetailsAction } from '@src/lib/db/organisation/organisation.actions';
import MembersTable from '@src/components/tables/members-table';

interface OrganisationUsersPageProps {
	params: Promise<{ id: string }>;
}

interface MemberData {
	id: string;
	name: string;
	email: string;
	role: string;
	memberSince: string;
}

export default async function OrganisationUsersPage({
	params,
}: OrganisationUsersPageProps) {
	const { id } = await params;
	const {
		data: organisation,
		isSuccess,
		message,
	} = await getOrganisationWithDetailsAction(id);

	if (!isSuccess || !organisation) {
		notFound();
	}

	const membersData: MemberData[] = organisation.memberships.map(
		(membership) => ({
			id: membership.id,
			name: `${membership.userProfile?.firstName || ''} ${membership.userProfile?.lastName || ''}`.trim(),
			email: membership.userProfile?.email || '',
			role: membership.role,
			memberSince: new Date(membership.createdAt).toLocaleDateString(),
		})
	);

	return (
		<div className="space-y-4">
			{organisation.memberships.length > 0 ? (
				<MembersTable
					data={membersData}
					title="Users"
					description="Users who are members of this organization"
					showMemberSince={true}
					roleVariant="owner"
				/>
			) : (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No users found</p>
				</div>
			)}
		</div>
	);
}
