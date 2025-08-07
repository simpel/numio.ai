'use server';

import Header from '@src/components/header';

export default async function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			<Header />
			<div className="container mx-auto px-6 py-8">
				<div className="mx-auto max-w-4xl">
					<main>{children}</main>
				</div>
			</div>
		</div>
	);
}
