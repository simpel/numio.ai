'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getUserProfileByIdAction } from '@src/lib/db/user-profile/user-profile.actions';
import SectionNavigation from '@src/components/section-navigation/section-navigation';

interface UserLayoutProps {
	children: React.ReactNode;
	params: Promise<{ id: string }>;
}

export default async function UserLayout({
	children,
	params,
}: UserLayoutProps) {
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

	// Get target user's profile to check for active invites
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

	// Define sections with proper routing
	const sections = [
		{
			id: 'profile',
			label: 'Profile Information',
			href: `/user/${targetUserId}`,
		},
		{
			id: 'memberships',
			label: 'Memberships',
			href: `/user/${targetUserId}/memberships`,
		},
		...(canViewSensitiveInfo && hasActiveInvites
			? [
					{
						id: 'invites',
						label: 'Invites',
						href: `/user/${targetUserId}/invites`,
					},
				]
			: []),
	];

	return (
		<div className="container mx-auto">
			<SectionNavigation sections={sections} className="mb-8" />

			{children}
		</div>
	);
}
