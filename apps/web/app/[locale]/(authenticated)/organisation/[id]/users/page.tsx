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

interface MemberData {
	id: string;
	membershipId: string;
	name: string;
	email: string;
	role: string;
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

	const membersData: MemberData[] =
		organisation.members?.map((membership) => ({
			id: membership.memberUserProfile?.id || '',
			membershipId: membership.id || '',
			name: `${membership.memberUserProfile?.firstName || ''} ${membership.memberUserProfile?.lastName || ''}`.trim(),
			email: membership.memberUserProfile?.email || '',
			role: membership.role,
		})) || [];

	return (
		<div className="space-y-4">
			{membersData.length > 0 ? (
				<MembersTable
					data={membersData}
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
