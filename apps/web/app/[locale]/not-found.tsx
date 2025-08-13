'use client';

import { Button } from '@shadcn/ui/button';
import { Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function LocaleNotFound() {
	const t = useTranslations('common');
	const router = useRouter();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
			<div className="mx-auto max-w-md">
				<h1 className="mb-2 text-4xl font-bold">404 - {t('page_not_found')}</h1>
				<p className="text-muted-foreground mb-6 text-xl">
					{t('page_not_found_message')}
				</p>

				<div className="flex justify-center">
					<Button onClick={() => router.push('/')} size="lg">
						<Home className="mr-2" />
						{t('go_home')}
					</Button>
				</div>
			</div>
		</div>
	);
}
