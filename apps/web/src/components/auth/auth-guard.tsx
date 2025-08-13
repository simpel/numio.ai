'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@shadcn/ui/button';
import Link from 'next/link';

interface AuthGuardProps {
	children: React.ReactNode;
	requiredRoles?: string[];
	errorConfig?: {
		title?: string;
		message?: string;
	};
}

export default function AuthGuard({ children }: AuthGuardProps) {
	const { data: session, status } = useSession();
	const t = useTranslations('auth.errors');
	const common = useTranslations('common');

	// Show loading spinner while session is loading
	if (status === 'loading') {
		return (
			<div className="flex min-h-screen items-center justify-center space-x-2">
				<Loader2 className="h-8 w-8 animate-spin" />
				<p>{common('loading')}</p>
			</div>
		);
	}

	// Redirect to signin if not authenticated
	if (status === 'unauthenticated') {
		redirect('/signin');
	}

	// If authenticated and user exists, render children
	if (status === 'authenticated' && session?.user) {
		return <>{children}</>;
	}

	// Fallback error state (should rarely be reached)
	return (
		<div className="flex min-h-screen flex-col items-center justify-center space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="mb-2 text-2xl font-bold">{t('access_denied')}</h1>
				<p className="text-muted-foreground">{t('insufficient_permissions')}</p>
			</div>
			<Link href="/">
				<Button>{common('go_home')}</Button>
			</Link>
		</div>
	);
}
