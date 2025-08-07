'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getAllInvitesAction } from '@src/lib/db/membership/invite.actions';
import ErrorBoundary from '@src/components/error-boundary';
import InvitesTable from '@src/components/tables/invites-table';

interface InviteData {
	id: string;
	email: string;
	status: string;
	expiresAt: string;
	createdAt: string;
	// Context data for hover card
	contextName: string;
	contextType: string;
	role: string;
	// User data for conditional button
	hasUser: boolean;
	userProfileId?: string;
	// Context IDs for re-invite
	organisationId?: string;
	teamId?: string;
}

export default async function SettingsInvitesPage() {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	// Check if user is superadmin
	const isSuperAdmin = profile.role === ('superadmin' as any);

	if (!isSuperAdmin) {
		redirect('/settings');
	}

	// Get all invites
	const { data: allInvites } = await getAllInvitesAction();

	const activeInvites: InviteData[] = [];
	const expiredInvites: InviteData[] = [];

	allInvites?.forEach((invite: any) => {
		const isExpired =
			invite.status === 'EXPIRED' || new Date(invite.expiresAt) < new Date();
		const contextName =
			invite.organisation?.name || invite.team?.name || 'Unknown';
		const contextType = invite.organisation ? 'Organisation' : 'Team';

		// Check if user exists for this email
		const hasUser = !!invite.userProfile;
		const userProfileId = invite.userProfile?.id;

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
		<div className="space-y-8">
			{/* Active Invites */}
			<div>
				{activeInvites.length > 0 ? (
					<ErrorBoundary>
						<InvitesTable
							data={activeInvites}
							title="Pending Invites"
							description="Invites that are still valid and waiting for acceptance"
							type="active"
						/>
					</ErrorBoundary>
				) : (
					<div className="py-8 text-center">
						<p className="text-muted-foreground">No active invites found.</p>
					</div>
				)}
			</div>

			{/* Expired Invites */}
			<div>
				{expiredInvites.length > 0 ? (
					<ErrorBoundary>
						<InvitesTable
							data={expiredInvites}
							title="Expired Invites"
							description="Invites that have expired and need to be re-sent"
							type="expired"
						/>
					</ErrorBoundary>
				) : (
					<div className="py-8 text-center">
						<p className="text-muted-foreground">No expired invites found.</p>
					</div>
				)}
			</div>
		</div>
	);
}
