'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getUserProfileByIdAction } from '@src/lib/db/user-profile/user-profile.actions';
import ErrorBoundary from '@src/components/error-boundary';
import UserDetailView from '@src/components/user-detail-view';

export default async function SettingsPage() {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	// Get current user's profile
	const { data: currentUserProfile } = await getUserProfileAction(user.id);
	if (!currentUserProfile) {
		redirect('/signin');
	}

	// Get current user's profile with all details (same as target user since it's their own profile)
	const { data: userProfileWithDetails } = await getUserProfileByIdAction(
		currentUserProfile.id
	);
	if (!userProfileWithDetails) {
		redirect('/signin');
	}

	return (
		<div className="space-y-6">
			<ErrorBoundary>
				<UserDetailView
					targetUser={userProfileWithDetails as any}
					currentUser={currentUserProfile as any}
				/>
			</ErrorBoundary>
		</div>
	);
}
