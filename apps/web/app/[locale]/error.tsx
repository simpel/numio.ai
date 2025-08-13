'use client';

import { useEffect } from 'react';
import { Button } from '@shadcn/ui/button';
import { Bot, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function LocaleError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations('common');
	const router = useRouter();

	useEffect(() => {
		// Safely log error information without circular references
		console.error('Locale Error:', {
			message: error.message,
			name: error.name,
			stack: error.stack,
			digest: error.digest,
		});
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
			<div className="mx-auto max-w-md">
				<div className="mb-6 flex justify-center">
					<div className="bg-destructive rounded-full p-6">
						<Bot className="text-destructive-foreground h-12 w-12" />
					</div>
				</div>

				<h1 className="mb-2 text-4xl font-bold">{t('something_went_wrong')}</h1>
				<p className="text-muted-foreground mb-6 text-xl">
					{t('error_message')}
				</p>

				<div className="flex justify-center gap-4">
					<Button onClick={() => reset()} variant="outline" size="lg">
						{t('retry')}
					</Button>
					<Button onClick={() => router.push('/')} size="lg">
						<Home className="mr-2 h-4 w-4" /> {t('go_home')}
					</Button>
				</div>
			</div>
		</div>
	);
}
