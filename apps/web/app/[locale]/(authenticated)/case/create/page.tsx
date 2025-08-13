'use server';

import { auth } from '@src/lib/auth/auth';
import {
	getCaseCreationDataAction,
	getInitialOrganisationIdAction,
} from '@src/lib/db/case/case.actions';
import CaseCreateForm from '@src/components/forms/case-create-form';

interface CaseCreatePageProps {
	searchParams: Promise<{
		clientId?: string;
		teamId?: string;
		organisationId?: string;
	}>;
}

export default async function CaseCreatePage({
	searchParams,
}: CaseCreatePageProps) {
	const { clientId, teamId, organisationId } = await searchParams;

	// Check authentication
	const session = await auth();
	if (!session?.user?.id) {
		return null;
	}

	// Get case creation data
	const caseDataResult = await getCaseCreationDataAction();
	if (!caseDataResult.isSuccess || !caseDataResult.data) {
		return (
			<div className="space-y-6">
				<div>
					<div className="text-2xl font-semibold">Create case</div>
					<div className="text-muted-foreground">Error loading data.</div>
				</div>
			</div>
		);
	}

	// Get initial organisation ID
	const initialOrgResult = await getInitialOrganisationIdAction({
		organisationId,
		teamId,
		clientId,
	});

	const initialOrganisationId = initialOrgResult.isSuccess
		? initialOrgResult.data
		: undefined;

	return (
		<div className="space-y-6">
			<div>
				<div className="text-2xl font-semibold">Create case</div>
				<div className="text-muted-foreground">Fill in the details below.</div>
			</div>

			<CaseCreateForm
				initialClientId={clientId}
				initialTeamId={teamId}
				initialOrganisationId={initialOrganisationId}
				organisations={caseDataResult.data.organisations}
				clients={caseDataResult.data.clients}
				teams={caseDataResult.data.teams}
			/>
		</div>
	);
}
