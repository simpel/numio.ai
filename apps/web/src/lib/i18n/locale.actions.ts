'use server';

import { cookies } from 'next/headers';
import { ActionState } from '@src/types/global';

const SUPPORTED = ['en', 'sv'] as const;

export async function setLocaleAction(
	locale: string
): Promise<ActionState<{ locale: 'en' | 'sv' }>> {
	try {
		// Validate the locale
		const nextLocale = SUPPORTED.includes((locale as 'en' | 'sv') || '')
			? (locale as 'en' | 'sv')
			: 'en';

		// Set the cookie
		const cookieStore = await cookies();
		cookieStore.set('locale', nextLocale, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365,
			httpOnly: false, // Allow client-side access
			sameSite: 'lax',
		});

		return {
			isSuccess: true,
			message: 'Locale updated successfully',
			data: { locale: nextLocale },
		};
	} catch (error) {
		console.error('Error setting locale:', error);
		return {
			isSuccess: false,
			message: 'Failed to update locale',
		};
	}
}
