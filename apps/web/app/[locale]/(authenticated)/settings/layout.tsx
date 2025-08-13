'use server';

import { getUserProfileWithRole } from '@src/lib/auth/auth.utils';
import SettingsNavigation from '@src/components/settings-navigation/settings-navigation';

interface SettingsLayoutProps {
	children: React.ReactNode;
}

export default async function SettingsLayout({
	children,
}: SettingsLayoutProps) {
	// Get user profile - authentication is handled by the parent layout
	await getUserProfileWithRole();

	return (
		<div className="container mx-auto px-6 py-8">
			<div className="mx-auto max-w-4xl">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
					<p className="text-muted-foreground mb-6">
						Manage system-wide settings, teams, organizations, and users.
					</p>
					<SettingsNavigation />
				</div>

				{children}
			</div>
		</div>
	);
}
