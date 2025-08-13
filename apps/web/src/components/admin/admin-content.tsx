'use client';

import { useTranslations } from 'next-intl';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@shadcn/ui/card';
import { UserSearch } from '@src/components/admin/user-search';

export function AdminContent() {
	const t = useTranslations('pages.admin');

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">{t('title')}</h1>
				<p className="text-muted-foreground">{t('description')}</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t('search_user')}</CardTitle>
					<CardDescription>{t('search_description')}</CardDescription>
				</CardHeader>
				<CardContent>
					<UserSearch className="max-w-md" />
				</CardContent>
			</Card>
		</div>
	);
}
