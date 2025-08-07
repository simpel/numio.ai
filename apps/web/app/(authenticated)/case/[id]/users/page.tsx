'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getCaseDetailsAction } from '@src/lib/db/case/case.actions';
import { getCaseMembershipsAction } from '@src/lib/db/membership/membership.actions';
import { notFound } from 'next/navigation';
import MembersTable from '@src/components/tables/members-table';

interface CaseUsersPageProps {
	params: Promise<{ id: string }>;
}

interface MemberData {
	id: string;
	name: string;
	email: string;
	role: string;
}

// Type for case with included relations
interface CaseWithDetails {
	id: string;
	title: string;
	description: string | null;
	createdAt: Date;
	teamId: string;
	clientId: string;
	team: {
		id: string;
		name: string;
		organisation: {
			id: string;
			name: string;
		};
	};
	client: {
		id: string;
		name: string;
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

	// Cast to the correct type with includes
	const caseWithDetails = caseDetails as unknown as CaseWithDetails;

	// Get memberships for this case
	const { data: membershipsData } = await getCaseMembershipsAction(caseId);

	const membersData: MemberData[] = (membershipsData || []).map(
		(membership: any) => ({
			id: membership.userProfile?.id || '',
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
