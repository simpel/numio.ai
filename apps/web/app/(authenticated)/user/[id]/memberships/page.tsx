'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import {
	getUserProfileByIdAction,
	canViewUserProfileAction,
} from '@src/lib/db/user-profile/user-profile.actions';
import ErrorBoundary from '@src/components/error-boundary';
import MembershipsTable from '@src/components/tables/memberships-table';

interface UserMembershipsPageParams {
	params: Promise<{ id: string }>;
}

export default async function UserMembershipsPage({
	params,
}: UserMembershipsPageParams) {
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

	// Get target user's profile with memberships
	const { data: targetUserProfile } =
		await getUserProfileByIdAction(targetUserId);
	if (!targetUserProfile) {
		redirect('/home');
	}

	// Transform memberships data for the table
	const membershipsData =
		targetUserProfile.memberships?.map((membership: any) => ({
			id: membership.id,
			name:
				membership.organisation?.name ||
				membership.teamContext?.name ||
				membership.caseItem?.title ||
				'Unknown',
			type: membership.organisation
				? 'Organisation'
				: membership.teamContext
					? 'Team'
					: 'Case',
			role: membership.role,
			organisation:
				membership.teamContext?.organisation?.name ||
				membership.team?.organisation?.name ||
				undefined,
			createdAt: membership.createdAt,
		})) || [];

	return (
		<div className="space-y-6">
			<ErrorBoundary>
				{/* Memberships */}
				{membershipsData.length > 0 ? (
					<MembershipsTable
						data={membershipsData}
						title="Active Memberships"
						description="Organizations, teams, and cases this user is part of."
					/>
				) : (
					<div className="py-8 text-center">
						<p className="text-muted-foreground">No memberships found.</p>
					</div>
				)}
			</ErrorBoundary>
		</div>
	);
}
