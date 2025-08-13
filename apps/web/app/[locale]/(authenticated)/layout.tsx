'use server';

import Header from '@src/components/header';
import AuthGuard from '@src/components/auth/auth-guard';
import ProtectedRoute from '@src/components/auth/protected-route';

interface AuthenticatedLayoutProps {
	children: React.ReactNode;
	searchParams?: Promise<{ error?: string }>;
}

export default async function AuthenticatedLayout({
	children,
	searchParams,
}: AuthenticatedLayoutProps) {
	let initialErrorCode: string | undefined;
	let initialErrorVariables: Record<string, string | number> | undefined;

	// Check for error in search params and translate it server-side
	if (searchParams) {
		const params = await searchParams;
		if (params.error) {
			initialErrorCode = params.error;
			// You can add logic here to determine variables based on the error code
			// For example, if it's an insufficient permissions error, you might want
			// to include the user's role or the required role
		}
	}

	return (
		<AuthGuard>
			<ProtectedRoute
				initialErrorCode={initialErrorCode}
				initialErrorVariables={initialErrorVariables}
			>
				<div>
					<Header />
					<div className="container mx-auto px-6 py-8">
						<div className="mx-auto max-w-4xl">
							<main>{children}</main>
						</div>
					</div>
				</div>
			</ProtectedRoute>
		</AuthGuard>
	);
}
