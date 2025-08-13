'use server';

import { getCurrentUser } from '@/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@/lib/auth/auth.actions';
import { getCaseDetailsAction } from '@/lib/db/case/case.actions';
import { getCaseMembershipsAction } from '@/lib/db/membership/membership.actions';
import { notFound } from 'next/navigation';
import MembersTable from '@/components/tables/members-table';

interface CaseUsersPageProps {
	params: Promise<{ id: string }>;
}

interface MemberData {
	id: string;
	membershipId: string;
	name: string;
	email: string;
	role: string;
}

// Type for membership with user profile
interface MembershipWithUser {
	id: string;
	role: string;
	userProfile?: {
		id: string;
		firstName?: string;
		lastName?: string;
		email?: string;
	};
}

export default async function CaseUsersPage({ params }: CaseUsersPageProps) {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { id: caseId } = await params;
	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	const { data: caseDetails, isSuccess } = await getCaseDetailsAction(caseId);

	if (!isSuccess || !caseDetails) {
		notFound();
	}

	// Get memberships for this case
	const { data: membershipsData } = await getCaseMembershipsAction(caseId);

	const membersData: MemberData[] = (membershipsData || []).map(
		(membership: MembershipWithUser) => ({
			id: membership.userProfile?.id || '',
			membershipId: membership.id || '',
			name: `${membership.userProfile?.firstName || ''} ${membership.userProfile?.lastName || ''}`.trim(),
			email: membership.userProfile?.email || '',
			role: membership.role,
		})
	);

	return (
		<div className="space-y-4">
			{membersData.length > 0 ? (
				<MembersTable
					data={membersData}
					title="Case Members"
					description="Users assigned to this case"
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
