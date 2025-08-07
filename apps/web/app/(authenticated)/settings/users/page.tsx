'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getAllUsersAction } from '@src/lib/db/user/user.actions';
import ErrorBoundary from '@src/components/error-boundary';
import UsersTable from '@src/components/tables/users-table';

interface UserData {
	id: string;
	name: string;
	email: string;
	status: string;
	lastLogin: string;
}

export default async function SettingsUsersPage() {
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

	// Get all users for superadmin
	const { data: allUsers } = await getAllUsersAction();

	const allUsersData: UserData[] =
		allUsers?.map((user: any) => ({
			id: user.profile?.id || user.id, // Use profile ID if available, fallback to user ID
			name:
				`${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() ||
				'Unknown',
			email: user.email || '',
			status: user.profile?.role || 'active',
			lastLogin: user.updatedAt
				? new Date(user.updatedAt).toLocaleDateString()
				: 'Never',
		})) || [];

	return (
		<div className="space-y-6">
			{allUsersData.length > 0 ? (
				<ErrorBoundary>
					<UsersTable
						data={allUsersData}
						title="All Users"
						description="All active users in the system"
					/>
				</ErrorBoundary>
			) : (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No users found.</p>
				</div>
			)}
		</div>
	);
}
