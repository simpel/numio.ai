'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getUserProfileByIdAction } from '@src/lib/db/user-profile/user-profile.actions';
import { canViewUserProfileAction } from '@src/lib/db/user-profile/user-profile.actions';
import ErrorBoundary from '@src/components/error-boundary';
import InvitesTable from '@src/components/tables/invites-table';

interface UserInvitesPageProps {
	params: Promise<{ id: string }>;
}

export default async function UserInvitesPage({
	params,
}: UserInvitesPageProps) {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { id: targetUserId } = await params;
	const { data: currentUserProfile } = await getUserProfileAction(user.id);
	if (!currentUserProfile) {
		redirect('/signin');
	}

	// Check if current user can view this user's profile
	const { data: canView } = await canViewUserProfileAction(targetUserId);
	if (!canView) {
		redirect('/');
	}

	// Get target user's profile with invites
	const { data: targetUserProfile } =
		await getUserProfileByIdAction(targetUserId);
	if (!targetUserProfile) {
		redirect('/');
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

	// Check if current user is viewing their own profile
	const isCurrentUser = currentUserProfile.id === targetUserId;

	// Separate active and expired invites
	const pendingInvites =
		targetUserProfile.activeInvites?.filter(
			(invite) =>
				invite.status === 'pending' && new Date(invite.expiresAt) > new Date()
		) || [];
	const expiredInvites =
		targetUserProfile.activeInvites?.filter(
			(invite) =>
				invite.status === 'expired' || new Date(invite.expiresAt) <= new Date()
		) || [];

	return (
		<div className="space-y-6">
			<ErrorBoundary>
				{/* pending Invites */}
				{pendingInvites.length > 0 && (
					<InvitesTable
						data={pendingInvites}
						title="pending Invites"
						description="Active invitations for this user."
						state="pending"
						isCurrentUser={isCurrentUser}
						currentUserProfileId={currentUserProfile.id}
					/>
				)}

				{/* expired Invites */}
				{expiredInvites.length > 0 && (
					<InvitesTable
						data={expiredInvites}
						title="expired Invites"
						description="Invitations that have expired and need to be re-sent."
						state="expired"
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
