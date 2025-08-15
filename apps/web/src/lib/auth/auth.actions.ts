'use server';

import { z } from 'zod';
import { signIn, signOut } from './auth';
import { db, UserProfile, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import { redirect } from 'next/navigation';

// Create a schema for validating form inputs
const signInSchema = z.object({
	provider: z.string().min(1),
	callbackUrl: z.string().default('/'),
});

/**
 * Server action to initiate the Microsoft sign-in flow
 */
export async function signInWithMicrosoft(formData: FormData) {
	// Extract and validate form data
	const provider = formData.get('provider') as string;
	const redirectTo = formData.get('redirectTo') as string;

	// Validate the input
	const result = signInSchema.safeParse({ provider, redirectTo });

	if (!result.success) {
		// Handle validation errors in a real app
		throw new Error('Invalid sign-in request');
	}

	// AUTH.JS SPECIAL HANDLING:
	// Don't use try/catch here because Auth.js needs to throw special
	// redirect errors for the OAuth flow to work correctly
	return await signIn(provider, { redirectTo });
}

/**
 * Server action to sign out and redirect
 */
export async function signOutAction(
	redirectTo?: string
): Promise<ActionState<null>> {
	try {
		// Sign out using NextAuth (this handles cookie cleanup automatically)
		await signOut({ redirect: false });

		// Redirect to signin page or specified URL
		redirect(redirectTo || '/signin');
	} catch (error) {
		console.error('Error during sign out:', error);
		return { isSuccess: false, message: 'Failed to sign out' };
	}
}

/**
 * Server action to get a user profile by userId
 */
export async function getUserProfileAction(
	userId: string
): Promise<ActionState<UserProfile | null>> {
	try {
		const profile = await db.userProfile.findUnique({ where: { userId } });
		return { isSuccess: true, message: 'Profile fetched', data: profile };
	} catch {
		return { isSuccess: false, message: 'Failed to fetch profile' };
	}
}

/**
 * Server action to create a user profile
 */
export async function createUserProfileAction(
	input: Prisma.UserProfileCreateInput
): Promise<ActionState<UserProfile>> {
	console.log('createUserProfileAction', input);

	try {
		const profile = await db.userProfile.create({
			data: {
				...input,
				hasDoneIntro: true,
			},
		});

		return { isSuccess: true, message: 'Profile created', data: profile };
	} catch {
		return { isSuccess: false, message: 'Failed to create profile' };
	}
}

/**
 * Server action to update a user profile
 */
export async function updateUserProfileAction(
	userId: string,
	data: Partial<UserProfile>
): Promise<ActionState<UserProfile>> {
	try {
		const profile = await db.userProfile.update({
			where: { userId },
			data: {
				...data,
				hasDoneIntro: true,
			},
		});
		return { isSuccess: true, message: 'Profile updated', data: profile };
	} catch (error) {
		console.error('Error updating profile:', error);
		return { isSuccess: false, message: 'Failed to update profile' };
	}
}
