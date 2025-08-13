'use server';

import RoleGuard from '@src/components/auth/role-guard';
import { Role } from '@src/lib/auth/auth.utils';
import { getAllInvitesAction } from '@src/lib/db/membership/invite.actions';
import { getInviteMetricsAction } from '@src/lib/db/membership/invite-metrics.actions';
import InvitesTable from '@src/components/tables/invites-table';
import MetricsChart from '@src/components/charts/metrics-chart';
import ErrorBoundary from '@src/components/error-boundary';

interface InviteData {
	id: string;
	email: string;
	status: string;
	expiresAt: string;
	createdAt: string;
	contextName: string;
	contextType: string;
	role: string;
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

export default async function SettingsInvitesPage() {
	return (
		<RoleGuard requiredRoles={[Role.superadmin]}>
			<SettingsInvitesContent />
		</RoleGuard>
	);
}

async function SettingsInvitesContent() {
	// Get all invites
	const { data: allInvites } = await getAllInvitesAction();

	// Get invite metrics for the last 30 days
	const { data: inviteMetrics } = await getInviteMetricsAction(30);

	const activeInvites: InviteData[] = [];
	const expiredInvites: InviteData[] = [];

	allInvites?.forEach((invite: InviteWithRelations) => {
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
			{inviteMetrics && inviteMetrics.length > 0 && (
				<MetricsChart
					data={inviteMetrics}
					title="Invite Metrics"
					entityType="invites"
				/>
			)}

			{activeInvites.length > 0 && (
				<ErrorBoundary>
					<InvitesTable
						data={activeInvites}
						title="Active Invites"
						description="Pending and accepted invites"
						type={'active'}
					/>
				</ErrorBoundary>
			)}

			{expiredInvites.length > 0 && (
				<ErrorBoundary>
					<InvitesTable
						data={expiredInvites}
						title="Expired Invites"
						description="Expired and cancelled invites"
						type={'expired'}
					/>
				</ErrorBoundary>
			)}

			{activeInvites.length === 0 && expiredInvites.length === 0 && (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No invites found.</p>
				</div>
			)}
		</div>
	);
}
