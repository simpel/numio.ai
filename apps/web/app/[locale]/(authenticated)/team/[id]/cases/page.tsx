'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getTeamDetailsPublicAction } from '@src/lib/db/team/team.actions';
import { getCasesByTeamAction } from '@src/lib/db/case/case.actions';
import { notFound } from 'next/navigation';
import CasesTable from '@src/components/tables/cases-table';

interface TeamCasesPageProps {
	params: Promise<{ id: string }>;
}

export default async function TeamCasesPage({ params }: TeamCasesPageProps) {
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

	// Get cases for this team
	const {
		data: casesData,
		isSuccess: casesSuccess,
		message: casesMessage,
	} = await getCasesByTeamAction(teamId);

	// Handle error case
	if (!casesSuccess || !casesData) {
		return (
			<div className="space-y-4">
				<div className="py-12 text-center">
					<h3 className="mb-2 text-lg font-semibold">Error Loading Cases</h3>
					<p className="text-muted-foreground mb-6">
						{casesMessage || 'Failed to load cases for this team.'}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{casesData && casesData.length > 0 ? (
				<CasesTable
					data={casesData}
					title="Team Cases"
					description="Cases assigned to this team"
					showClient={true}
				/>
			) : (
				<div className="py-12 text-center">
					<h3 className="mb-2 text-lg font-semibold">No Cases Yet</h3>
					<p className="text-muted-foreground mb-6">
						This team doesn&apos;t have any cases assigned yet.
					</p>
				</div>
			)}
		</div>
	);
}
