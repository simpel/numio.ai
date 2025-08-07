'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import {
	getUserProfileByIdAction,
	canViewUserProfileAction,
} from '@src/lib/db/user-profile/user-profile.actions';
import ErrorBoundary from '@src/components/error-boundary';
import InvitesTable from '@src/components/tables/invites-table';

interface UserInvitesPageParams {
	params: Promise<{ id: string }>;
}

export default async function UserInvitesPage({
	params,
}: UserInvitesPageParams) {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { id: targetUserId } = await params;

	// Get current user's profile
	const { data: currentUserProfile } = await getUserProfileAction(user.id);
	if (!currentUserProfile) {
		redirect('/signin');
	}

	// If current user is viewing their own profile, redirect to /profile
	if (currentUserProfile.id === targetUserId) {
		redirect('/profile');
	}

	// Check if current user can view the target user
	const { data: canView } = await canViewUserProfileAction(targetUserId);
	if (!canView) {
		redirect('/home');
	}

	// Get target user's profile with invites
	const { data: targetUserProfile } =
		await getUserProfileByIdAction(targetUserId);
	if (!targetUserProfile) {
		redirect('/home');
	}

	// Check if there are any active invites
	const hasActiveInvites =
		targetUserProfile.activeInvites &&
		targetUserProfile.activeInvites.length > 0;

	// Check if current user can view sensitive information
	const canViewSensitiveInfo =
		currentUserProfile.role === 'superadmin' ||
		currentUserProfile.id === targetUserId;

	// Only superadmins can view invites
	if (!canViewSensitiveInfo) {
		redirect(`/user/${targetUserId}`);
	}

	// If no active invites, redirect to main user page
	if (!hasActiveInvites) {
		redirect(`/user/${targetUserId}`);
	}

	// Transform active invites to match InvitesTable format
	const activeInvites =
		targetUserProfile.activeInvites?.map((invite: any) => ({
			id: invite.id,
			email: invite.email,
			status: invite.status,
			expiresAt: new Date(invite.expiresAt).toLocaleDateString(),
			createdAt: new Date(invite.createdAt).toLocaleDateString(),
			contextName: invite.organisation?.name || invite.team?.name || 'Unknown',
			contextType: invite.organisation ? 'Organisation' : 'Team',
			role: invite.role,
			hasUser: !!targetUserProfile.userProfile,
			userProfileId: targetUserProfile.userProfile?.id,
			organisationId: invite.organisationId,
			teamId: invite.teamId,
		})) || [];

	// Separate active and expired invites
	const pendingInvites = activeInvites.filter(
		(invite: any) =>
			invite.status === 'PENDING' && new Date(invite.expiresAt) > new Date()
	);
	const expiredInvites = activeInvites.filter(
		(invite: any) =>
			invite.status === 'EXPIRED' || new Date(invite.expiresAt) <= new Date()
	);

	// Check if current user is viewing their own profile
	const isCurrentUser = currentUserProfile.id === targetUserId;

	return (
		<div className="space-y-6">
			<ErrorBoundary>
				{/* Pending Invites */}
				{pendingInvites.length > 0 && (
					<InvitesTable
						data={pendingInvites}
						title="Pending Invites"
						description="Active invitations for this user."
						type="active"
						isCurrentUser={isCurrentUser}
						currentUserProfileId={currentUserProfile.id}
					/>
				)}

				{/* Expired Invites */}
				{expiredInvites.length > 0 && (
					<InvitesTable
						data={expiredInvites}
						title="Expired Invites"
						description="Invitations that have expired and need to be re-sent."
						type="expired"
						isCurrentUser={isCurrentUser}
						currentUserProfileId={currentUserProfile.id}
					/>
				)}

				{/* No invites message */}
				{pendingInvites.length === 0 && expiredInvites.length === 0 && (
					<div className="py-8 text-center">
						<p className="text-muted-foreground">No invites found.</p>
					</div>
				)}
			</ErrorBoundary>
		</div>
	);
}
