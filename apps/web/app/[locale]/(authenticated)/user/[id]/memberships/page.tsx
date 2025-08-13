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

// Type for membership data for table
interface MembershipData {
	id: string;
	name: string;
	type: 'organization' | 'team' | 'case';
	role: string;
	organisation?: string;
	createdAt: string;
	href: string;
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
		redirect('/');
	}

	// Get target user's profile with memberships
	const { data: targetUserProfile } =
		await getUserProfileByIdAction(targetUserId);
	if (!targetUserProfile) {
		redirect('/');
	}

	// Transform memberships data for the table
	const membershipsData: MembershipData[] =
		targetUserProfile.memberships?.map((membership: any) => {
			const name =
				membership.organisation?.name ||
				membership.team?.name ||
				membership.case?.title ||
				'Unknown';

			const type = membership.organisation
				? 'organization'
				: membership.team
					? 'team'
					: 'case';

			const href = membership.organisation
				? `/organisation/${membership.organisation.id}`
				: membership.team
					? `/team/${membership.team.id}`
					: membership.case
						? `/case/${membership.case.id}`
						: '#';

			return {
				id: membership.id,
				name,
				type,
				role: membership.role,
				organisation: membership.team?.organisation?.name || undefined,
				createdAt: membership.createdAt.toISOString(),
				href,
			};
		}) || [];

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
