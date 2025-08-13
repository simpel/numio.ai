'use server';

import { Role } from '@numio/ai-database';
import RoleGuard from '@src/components/auth/role-guard';
import AdminNavigation from '@src/components/admin-navigation/admin-navigation';

interface AdminLayoutProps {
	children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<RoleGuard requiredRoles={[Role.superadmin]} redirectTo="/">
			<div className="container mx-auto px-6 py-8">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8">
						<h1 className="text-3xl font-bold tracking-tight">Admin</h1>
						<p className="text-muted-foreground mb-6">
							Manage all teams, organizations, users, and invites.
						</p>
						<AdminNavigation />
					</div>

					{children}
				</div>
			</div>
		</RoleGuard>
	);
}
