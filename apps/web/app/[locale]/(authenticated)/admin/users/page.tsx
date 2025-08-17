'use server';

import { getAllUsersAction } from '@src/lib/db/user/user.actions';
import { getUserMetricsAction } from '@src/lib/db/user/user-metrics.actions';
import ErrorBoundary from '@src/components/error-boundary';
import UserMetricsChart from '@src/components/charts/user-metrics-chart';
import UsersTable from '@src/components/tables/users-table';

export default async function AdminUsersPage() {
	// Get all users (no role filtering in admin)
	const { data: allUsers } = await getAllUsersAction();

	// Get user metrics for chart
	const { data: userMetrics } = await getUserMetricsAction(30);

	return (
		<div className="space-y-6">
			{/* User Metrics Chart */}
			{userMetrics && userMetrics.length > 0 && (
				<ErrorBoundary>
					<UserMetricsChart data={userMetrics} />
				</ErrorBoundary>
			)}

			{/* All Users */}
			{allUsers && allUsers.length > 0 ? (
				<ErrorBoundary>
					<UsersTable
						data={allUsers}
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
