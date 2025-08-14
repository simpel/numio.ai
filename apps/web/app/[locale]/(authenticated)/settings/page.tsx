'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
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

	return (
		<div className="space-y-6">
			<ErrorBoundary>
				<UserDetailView user={currentUserProfile} isEditable={true} />
			</ErrorBoundary>
		</div>
	);
}
