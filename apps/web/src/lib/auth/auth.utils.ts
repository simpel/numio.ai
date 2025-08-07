// apps/web/src/lib/auth/utils.ts
import 'server-only';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { getUserProfileAction } from './auth.actions';

/**
 * Get the current user session from the server.
 * This is a server-only function.
 * @returns The current user session, or null if not authenticated.
 */
export const getCurrentUser = async () => {
	const session = await auth();
	return session?.user ?? null;
};

export const checkProfile = async ({
	redirectTo,
}: { redirectTo?: string } = {}) => {
	const user = await getCurrentUser();

	if (!user || !user.id) {
		redirect('/signin');
	}

	const { data: profile } = await getUserProfileAction(user.id);

	if (!profile?.hasDoneIntro) {
		redirect('/welcome');
	}

	if (redirectTo) {
		redirect(redirectTo);
	}

	return profile;
};
