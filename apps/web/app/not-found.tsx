'use client';

import Link from 'next/link';
import { Button } from '@shadcn/ui/button';

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<div className="text-center">
				<h1 className="mb-4 text-6xl font-bold text-muted-foreground">404</h1>
				<h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
				<p className="mb-8 text-muted-foreground">
					Sorry, we couldn&apos;t find the page you&apos;re looking for.
				</p>
				<Button asChild>
					<Link href="/">Go Home</Link>
				</Button>
			</div>
		</div>
	);
}
