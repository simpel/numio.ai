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
}

// Type for invite data for table
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
	organisationId?: string;
	teamId?: string;
}

export default async function UserInvitesPage({ params }: UserInvitesPageProps) {
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

	// Transform active invites to match InvitesTable format
	const activeInvites: InviteData[] =
		targetUserProfile.activeInvites?.map((invite: InviteWithRelations) => ({
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
		(invite: InviteData) =>
			invite.status === 'pending' && new Date(invite.expiresAt) > new Date()
	);
	const expiredInvites = activeInvites.filter(
		(invite: InviteData) =>
			invite.status === 'expired' || new Date(invite.expiresAt) <= new Date()
	);

	// Check if current user is viewing their own profile
	const isCurrentUser = currentUserProfile.id === targetUserId;

	return (
		<div className="space-y-6">
			<ErrorBoundary>
				{/* pending Invites */}
				{pendingInvites.length > 0 && (
					<InvitesTable
						data={pendingInvites}
						title="pending Invites"
						description="Active invitations for this user."
						type="active"
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
