'use server';

export default async function SignInLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<main>{children}</main>
		</div>
	);
}
