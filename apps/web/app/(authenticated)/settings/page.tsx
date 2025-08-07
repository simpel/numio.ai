'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';

export default async function SettingsPage() {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold tracking-tight">
					General Settings
				</h2>
				<p className="text-muted-foreground">
					Configure system-wide settings and preferences.
				</p>
			</div>

			<div className="py-8 text-center">
				<p className="text-muted-foreground">
					Settings configuration coming soon...
				</p>
			</div>
		</div>
	);
}
