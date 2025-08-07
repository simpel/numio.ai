'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getCasesForUserAction } from '@src/lib/db/case/case.actions';
import CasesTable from '@src/components/tables/cases-table';
import ErrorBoundary from '@src/components/error-boundary';

interface CaseData {
	id: string;
	title: string;
	description?: string;
	client?: string;
	clientId?: string;
	team?: string;
	teamId?: string;
	organisation?: string;
	organisationId?: string;
	status?: string;
	state?: string;
	createdAt: string;
}

export default async function CasesPage() {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	// Get cases for this user
	const {
		data: casesData,
		isSuccess,
		message,
	} = await getCasesForUserAction(profile.id);

	const casesTableData: CaseData[] = (casesData || []).map((caseItem: any) => ({
		id: caseItem.id,
		title: caseItem.title,
		description: caseItem.description,
		client: caseItem.client?.name,
		clientId: caseItem.client?.id,
		team: caseItem.team?.name,
		teamId: caseItem.team?.id,
		organisation: caseItem.team?.organisation?.name,
		organisationId: caseItem.team?.organisation?.id,
		status: caseItem.state || 'created',
		state: caseItem.state || 'created',
		createdAt: caseItem.createdAt,
		updatedAt: caseItem.updatedAt,
	}));

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Your Cases</h1>
				<p className="text-muted-foreground">
					Cases you're assigned to or have access to
				</p>
			</div>

			{isSuccess && casesTableData.length > 0 ? (
				<ErrorBoundary>
					<CasesTable
						data={casesTableData}
						title="Cases"
						description="All cases you have access to"
						showClient={true}
					/>
				</ErrorBoundary>
			) : (
				<div className="py-12 text-center">
					<h3 className="mb-2 text-lg font-semibold">No Cases Yet</h3>
					<p className="text-muted-foreground mb-6">
						{message ||
							"You're not assigned to any cases yet. Cases will appear here when you're added to them."}
					</p>
				</div>
			)}
		</div>
	);
}
