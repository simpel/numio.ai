'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@shadcn/ui/button';

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
			<div className="mx-auto max-w-md">
				<h1 className="mb-2 text-4xl font-bold">404 - Page Not Found</h1>

				<div className="flex justify-center">
					<Button asChild size="lg">
						<Link href="/">
							<Home className="mr-2" />
							Go Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
