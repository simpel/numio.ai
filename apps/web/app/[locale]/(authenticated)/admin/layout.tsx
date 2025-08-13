'use server';

import { Role } from '@numio/ai-database';
import RoleGuard from '@src/components/auth/role-guard';

interface AdminLayoutProps {
	children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<RoleGuard requiredRoles={[Role.superadmin]} redirectTo="/">
			{children}
		</RoleGuard>
	);
}
