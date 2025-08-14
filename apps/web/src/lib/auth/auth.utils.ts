// apps/web/src/lib/auth/utils.ts
import 'server-only';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { getUserProfileAction } from './auth.actions';
import { Role } from '@numio/ai-database';

/**
 * Get the current user session from the server.
 * This is a server-only function.
 * @returns The current user session, or null if not authenticated.
 */
export const getCurrentUser = async () => {
	const session = await auth();
	return session?.user ?? null;
};

/**
 * Get the current user profile with role information.
 * This is a server-only function.
 * @returns The current user profile with role, or null if not authenticated.
 */
export const getUserProfileWithRole = async () => {
	const user = await getCurrentUser();

	if (!user || !user.id) {
		return null;
	}

	const { data: profile } = await getUserProfileAction(user.id);
	return profile;
};

/**
 * Require authentication and return the current user.
 * This is a server-only function that will redirect to signin if not authenticated.
 * @returns The current user.
 */
export const requireAuth = async () => {
	const user = await getCurrentUser();

	if (!user || !user.id) {
		redirect('/signin');
	}

	return user;
};

// Re-export Role enum for convenience
export { Role };
