'use server';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { UserDetailContent } from '@src/components/admin/user-detail-content';
import { UserDetailSkeleton } from '@src/components/admin/user-detail-skeleton';
import { getUserProfileByIdAction } from '@src/lib/db/user-profile/user-profile.actions';

interface UserPageProps {
	params: Promise<{ id: string; locale: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
	const { id } = await params;

	// Verify the user exists
	const userResult = await getUserProfileByIdAction(id);
	if (!userResult.isSuccess || !userResult.data) {
		notFound();
	}

	return (
		<Suspense fallback={<UserDetailSkeleton />}>
			<UserDetailContent userId={id} />
		</Suspense>
	);
}
