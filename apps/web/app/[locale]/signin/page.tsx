'use client';

import { useSearchParams } from 'next/navigation';

import SignInForm from '@src/components/forms/signin-form';

export default function SignInPage() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl') || '/';

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md">
				<SignInForm callbackUrl={callbackUrl} />
			</div>
		</div>
	);
}
