'use server';

import { redirect } from 'next/navigation';
import { Role } from '@numio/ai-database';
import { getCurrentUserProfileAction } from '@src/lib/db/user-profile/user-profile.actions';

interface RoleGuardProps {
	children: React.ReactNode;
	requiredRoles: Role[];
	redirectTo?: string;
	fallback?: React.ReactNode;
	userProfile?: { role: Role };
}

export default async function RoleGuard({
	children,
	requiredRoles,
	redirectTo,
	fallback,
	userProfile,
}: RoleGuardProps) {
	// If userProfile is provided, use it directly
	if (userProfile) {
		if (!requiredRoles.includes(userProfile.role)) {
			if (redirectTo) {
				redirect(redirectTo);
			}
			if (fallback) {
				return <>{fallback}</>;
			}
			redirect('/');
		}
		return <>{children}</>;
	}

	// Otherwise, get the current authenticated user's profile
	const result = await getCurrentUserProfileAction();

	if (!result.isSuccess || !result.data) {
		redirect('/signin');
	}

	// Check if user has required role
	if (!requiredRoles.includes(result.data.role as Role)) {
		// If redirectTo is provided, redirect
		if (redirectTo) {
			redirect(redirectTo);
		}

		// If fallback is provided, show fallback UI
		if (fallback) {
			return <>{fallback}</>;
		}

		// Default: redirect to home
		redirect('/');
	}

	return <>{children}</>;
}
