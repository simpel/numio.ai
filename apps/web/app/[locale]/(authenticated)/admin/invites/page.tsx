'use server';

import { getAllInvitesAction } from '@src/lib/db/membership/invite.actions';
import { getInviteMetricsAction } from '@src/lib/db/membership/invite-metrics.actions';
import InvitesTable from '@src/components/tables/invites-table';
import MetricsChart from '@src/components/charts/metrics-chart';
import ErrorBoundary from '@src/components/error-boundary';
import { Role } from '@numio/ai-database';

interface InviteData {
	id: string;
	email: string;
	status: string;
	expiresAt: string;
	createdAt: string;
	contextName: string;
	contextType: string;
	role: Role;
	hasUser: boolean;
	userProfileId?: string;
	userName?: string;
	organisationId?: string;
	teamId?: string;
}

// Type for invite with relations
interface InviteWithRelations {
	id: string;
	email: string;
	status: string;
	expiresAt: string;
	createdAt: string;
	role: string;
	organisationId?: string;
	teamId?: string;
	organisation?: {
		name: string;
	};
	team?: {
		name: string;
	};
	userProfile?: {
		id: string;
		firstName?: string;
		lastName?: string;
	};
}

export default async function AdminInvitesPage() {
	// Get all invites (no role filtering in admin)
	const { data: allInvites } = await getAllInvitesAction();

	// Get invite metrics for the last 30 days
	const { data: inviteMetrics } = await getInviteMetricsAction(30);

	const activeInvites: InviteData[] = [];
	const expiredInvites: InviteData[] = [];

	allInvites?.forEach((invite: any) => {
		const isExpired =
			invite.status === 'expired' || new Date(invite.expiresAt) < new Date();
		const contextName =
			invite.organisation?.name || invite.team?.name || 'Unknown';
		const contextType = invite.organisation ? 'Organisation' : 'Team';

		// Check if user exists for this email
		const hasUser = !!invite.userProfile;
		const userProfileId = invite.userProfile?.id;
		const userName = invite.userProfile
			? `${invite.userProfile.firstName || ''} ${invite.userProfile.lastName || ''}`.trim()
			: undefined;

		const inviteData: InviteData = {
			id: invite.id,
			email: invite.email,
			status: invite.status,
			expiresAt: new Date(invite.expiresAt).toLocaleDateString(),
			createdAt: new Date(invite.createdAt).toLocaleDateString(),
			contextName,
			contextType,
			role: invite.role,
			hasUser,
			userProfileId,
			userName,
			organisationId: invite.organisationId,
			teamId: invite.teamId,
		};

		if (isExpired) {
			expiredInvites.push(inviteData);
		} else {
			activeInvites.push(inviteData);
		}
	});

	return (
		<div className="space-y-6">
			{/* Invite Metrics Chart */}
			{inviteMetrics && inviteMetrics.length > 0 && (
				<ErrorBoundary>
					<MetricsChart
						data={inviteMetrics}
						title="Invite Metrics"
						entityType="invites"
					/>
				</ErrorBoundary>
			)}

			{/* Active Invites */}
			{activeInvites.length > 0 && (
				<ErrorBoundary>
					<InvitesTable
						data={activeInvites}
						title="Active Invites"
						description="Pending and accepted invites"
						state={'pending'}
					/>
				</ErrorBoundary>
			)}

			{/* Expired Invites */}
			{expiredInvites.length > 0 && (
				<ErrorBoundary>
					<InvitesTable
						data={expiredInvites}
						title="Expired Invites"
						description="Expired and cancelled invites"
						state={'expired'}
					/>
				</ErrorBoundary>
			)}

			{/* Empty state */}
			{activeInvites.length === 0 && expiredInvites.length === 0 && (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No invites found.</p>
				</div>
			)}
		</div>
	);
}
