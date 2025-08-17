'use server';

import { getAllInvitesAction } from '@src/lib/db/membership/invite.actions';
import { getInviteMetricsAction } from '@src/lib/db/membership/invite-metrics.actions';
import InvitesTable from '@src/components/tables/invites-table';
import MetricsChart from '@src/components/charts/metrics-chart';
import ErrorBoundary from '@src/components/error-boundary';
import { InviteWithRelations } from '@src/lib/db/membership/invite.types';

export default async function AdminInvitesPage() {
	// Get all invites (no role filtering in admin)
	const { data: allInvites } = await getAllInvitesAction();

	// Get invite metrics for the last 30 days
	const { data: inviteMetrics } = await getInviteMetricsAction(30);

	const activeInvites: InviteWithRelations[] = [];
	const expiredInvites: InviteWithRelations[] = [];

	allInvites?.forEach((invite: InviteWithRelations) => {
		const isExpired =
			invite.status === 'expired' || new Date(invite.expiresAt) < new Date();

		if (isExpired) {
			expiredInvites.push(invite);
		} else {
			activeInvites.push(invite);
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
