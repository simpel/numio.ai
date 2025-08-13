'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getTeamDetailsPublicAction } from '@src/lib/db/team/team.actions';
import { notFound } from 'next/navigation';
import MembersTable from '@src/components/tables/members-table';

interface TeamUsersPageProps {
	params: Promise<{ id: string }>;
}

interface MemberData {
	id: string;
	membershipId: string;
	name: string;
	email: string;
	role: string;
	memberSince?: string;
}

// Type for team with included relations
interface TeamWithDetails {
	id: string;
	name: string;
	description: string | null;
	createdAt: Date;
	organisationId: string;
	ownerId: string;
	organisation: {
		id: string;
		name: string;
	};
	owner: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string | null;
	};
	contextMemberships: Array<{
		id: string;
		role: string;
		createdAt: Date;
		userProfile: {
			id: string;
			firstName: string | null;
			lastName: string | null;
			email: string | null;
		};
	}>;
}

export default async function TeamUsersPage({ params }: TeamUsersPageProps) {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { id: teamId } = await params;
	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	const { data: teamDetails, isSuccess } =
		await getTeamDetailsPublicAction(teamId);

	if (!isSuccess || !teamDetails) {
		notFound();
	}

	// Cast to the correct type with includes
	const teamWithDetails = teamDetails as unknown as TeamWithDetails;

	const membersData: MemberData[] =
		teamWithDetails.contextMemberships?.map((membership) => ({
			id: membership.userProfile.id,
			membershipId: membership.id,
			name: `${membership.userProfile.firstName || ''} ${membership.userProfile.lastName || ''}`.trim(),
			email: membership.userProfile.email || '',
			role: membership.role,
			memberSince: membership.createdAt
				? new Date(membership.createdAt).toISOString()
				: undefined,
		})) || [];

	return (
		<div className="space-y-4">
			{teamWithDetails.contextMemberships &&
			teamWithDetails.contextMemberships.length > 0 ? (
				<MembersTable
					data={membersData}
					title="Team Members"
					description="Members of this team"
					roleVariant="admin"
					teamId={teamId}
				/>
			) : (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No members found</p>
				</div>
			)}
		</div>
	);
}
