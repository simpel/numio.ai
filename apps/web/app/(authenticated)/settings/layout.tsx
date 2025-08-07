'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import SettingsNavigation from '@src/components/settings-navigation/settings-navigation';

interface SettingsLayoutProps {
	children: React.ReactNode;
}

export default async function SettingsLayout({
	children,
}: SettingsLayoutProps) {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

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
