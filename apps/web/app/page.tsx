import { checkProfile } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';

export default async function Page() {
	const profile = await checkProfile({ redirectTo: '/home' });
	if (profile) redirect('/home');
}
