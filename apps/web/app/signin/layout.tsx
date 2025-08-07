'use server';

import Header from '@src/components/header';

export default async function SignInLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<Header />
			<main>{children}</main>
		</div>
	);
}
