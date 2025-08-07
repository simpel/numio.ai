import { Alert, AlertDescription, AlertTitle } from '@shadcn/ui/alert';

import { db } from '@numio/ai-database';
import { Info } from 'lucide-react';
import { redirect } from 'next/navigation';
import SignInForm from '@src/components/forms/signin-form';
import { getCurrentUser } from '@src/lib/auth/auth.utils';

export default async function SignInPage({
	searchParams,
}: {
	searchParams: Promise<{
		message?: string;
		title?: string;
		cta?: string;
		ctaLabel?: string;
	}>;
}) {
	const user = await getCurrentUser();

	const { message, title } = await searchParams;

	if (user?.id) {
		const profile = await db.userProfile.findUnique({
			where: { userId: user.id },
			select: {
				hasDoneIntro: true,
			},
		});

		if (profile?.hasDoneIntro) {
			redirect('/home');
		}

		redirect('/welcome');
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center py-12">
			<div className="w-full max-w-md">
				{(message || title) && (
					<Alert className="mb-4">
						<Info className="h-4 w-4" />
						{title && <AlertTitle>{title}</AlertTitle>}
						{message && <AlertDescription>{message}</AlertDescription>}
					</Alert>
				)}
				<SignInForm />
			</div>
		</div>
	);
}
