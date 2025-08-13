'use server';

import { getUserProfileWithRole } from '@src/lib/auth/auth.utils';

export default async function SettingsPage() {
	// Get user profile - authentication is handled by the layout
	await getUserProfileWithRole();

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
