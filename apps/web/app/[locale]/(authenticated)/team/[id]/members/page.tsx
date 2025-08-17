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

	return (
		<div className="space-y-4">
			{teamDetails.members && teamDetails.members.length > 0 ? (
				<MembersTable
					data={teamDetails.members}
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
