'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import {
	getUserProfileByIdAction,
	canViewUserProfileAction,
} from '@src/lib/db/user-profile/user-profile.actions';
import ErrorBoundary from '@src/components/error-boundary';
import UserProfileCard from '@src/components/user-profile-card';

interface UserPageParams {
	params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageParams) {
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

	// Get target user's profile with basic details (no memberships or invites)
	const { data: targetUserProfile } =
		await getUserProfileByIdAction(targetUserId);
	if (!targetUserProfile) {
		redirect('/home');
	}

	// Check if current user is viewing their own profile
	const isCurrentUser = currentUserProfile.id === targetUserId;

	return (
		<ErrorBoundary>
			{/* Profile Information */}
			<UserProfileCard
				user={targetUserProfile}
				isCurrentUser={isCurrentUser}
				isSuperAdmin={currentUserProfile.role === 'superadmin'}
			/>
		</ErrorBoundary>
	);
}
