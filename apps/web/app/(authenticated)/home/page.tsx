'use server';

import { checkProfile } from '@src/lib/auth/auth.utils';

export default async function HomePage() {
	const profile = await checkProfile();

	return 'hello';
}
