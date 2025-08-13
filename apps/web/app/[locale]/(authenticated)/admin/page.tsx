'use server';

import { Suspense } from 'react';

import { AdminContent } from '@src/components/admin/admin-content';
import { AdminSkeleton } from '@src/components/admin/admin-skeleton';

export default async function AdminPage() {
	return (
		<Suspense fallback={<AdminSkeleton />}>
			<AdminContent />
		</Suspense>
	);
}
