'use server';

import RoleGuard from '@src/components/auth/role-guard';
import { Role } from '@src/lib/auth/auth.utils';
import { getAllUsersAction } from '@src/lib/db/user/user.actions';
import { getUserMetricsAction } from '@src/lib/db/user/user-metrics.actions';
import ErrorBoundary from '@src/components/error-boundary';
import UserMetricsChart from '@src/components/charts/user-metrics-chart';
import UsersTable from '@src/components/tables/users-table';

interface UserData {
	id: string;
	name: string;
	email: string;
	status: string;
	lastLogin: string;
}

// Type for user with profile
interface UserWithProfile {
	id: string;
	email: string;
	updatedAt?: string;
	profile?: {
		id: string;
		firstName?: string;
		lastName?: string;
		role?: string;
	};
}

export default async function SettingsUsersPage() {
	return (
		<RoleGuard requiredRoles={[Role.superadmin]}>
			<SettingsUsersContent />
		</RoleGuard>
	);
}

async function SettingsUsersContent() {
	// Get all users for superadmin
	const { data: allUsers } = await getAllUsersAction();

	// Get user metrics for chart
	const { data: userMetrics } = await getUserMetricsAction(30);

	const allUsersData: UserData[] =
		allUsers?.map((user: UserWithProfile) => ({
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
			{userMetrics && userMetrics.length > 0 && (
				<UserMetricsChart data={userMetrics} />
			)}

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
