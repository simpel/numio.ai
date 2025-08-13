'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getTranslations } from 'next-intl/server';

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

	const t = await getTranslations('pages.settings');

	return (
		<div className="container mx-auto px-6 py-8">
			<div className="mx-auto max-w-4xl">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
					<p className="text-muted-foreground mb-6">{t('description')}</p>
				</div>

				{children}
			</div>
		</div>
	);
}
