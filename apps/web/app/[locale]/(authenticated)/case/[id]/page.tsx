'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getCaseDetailsAction } from '@src/lib/db/case/case.actions';
import { getEventsByCaseAction } from '@src/lib/db/event/event.actions';
import { notFound } from 'next/navigation';
import { Link } from '@src/i18n/navigation';
import ProgressTimeline from '@src/components/progress-timeline';
import CaseStateManager from './_components/case-state-manager';

interface CaseDetailPageProps {
	params: Promise<{ id: string }>;
}

// Type for case with included relations
interface CaseWithDetails {
	id: string;
	title: string;
	description: string | null;
	state: string;
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

// Type for events
interface Event {
	id: string;
	type: string;
	occurredAt: Date | string;
	actor: {
		id: string;
		firstName?: string;
		lastName?: string;
		email?: string;
	};
	metadata?: {
		description?: string;
		[key: string]: unknown;
	};
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
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

	// Get events for this case
	const { data: eventsData } = await getEventsByCaseAction(caseId);

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			{/* Main Content */}
			<div className="space-y-6 lg:col-span-2">
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">Description</h2>
					{caseWithDetails.description ? (
						<p className="text-muted-foreground">
							{caseWithDetails.description}
						</p>
					) : (
						<p className="text-muted-foreground italic">
							No description provided
						</p>
					)}
				</div>

				<div className="space-y-4">
					<h2 className="text-xl font-semibold">Case Information</h2>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-muted-foreground text-sm font-medium">
								Case ID
							</label>
							<p className="text-sm">{caseWithDetails.id}</p>
						</div>
						<div>
							<label className="text-muted-foreground text-sm font-medium">
								Created
							</label>
							<p className="text-sm">
								{new Date(caseWithDetails.createdAt).toLocaleDateString()}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Sidebar */}
			<div className="space-y-6">
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">State</h3>
					<CaseStateManager
						caseId={caseWithDetails.id}
						currentState={caseWithDetails.state || 'created'}
					/>
				</div>

				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Team</h3>
					<div className="space-y-2">
						<div>
							<label className="text-muted-foreground text-sm font-medium">
								Team Name
							</label>
							<Link
								href={`/team/${caseWithDetails.team?.id}`}
								className="text-primary text-sm font-medium hover:underline"
							>
								{caseWithDetails.team?.name}
							</Link>
						</div>
						<div>
							<label className="text-muted-foreground text-sm font-medium">
								Organization
							</label>
							<Link
								href={`/organisation/${caseWithDetails.team?.organisation?.id}`}
								className="text-primary text-sm hover:underline"
							>
								{caseWithDetails.team?.organisation?.name}
							</Link>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Client</h3>
					<div className="space-y-2">
						<div>
							<label className="text-muted-foreground text-sm font-medium">
								Client Name
							</label>
							<p className="text-sm font-medium">
								{caseWithDetails.client?.name}
							</p>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Progress</h3>
					<ProgressTimeline events={(eventsData || []) as Event[]} />
				</div>
			</div>
		</div>
	);
}
