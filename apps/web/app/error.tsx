'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@shadcn/ui/button';
import { Bot, Home } from 'lucide-react';

export default function GlobalError({ error }: { error: Error }) {
	useEffect(() => {
		// Safely log error information without circular references
		console.error('App Error:', {
			message: error.message,
			name: error.name,
			stack: error.stack,
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

				<h1 className="mb-2 text-4xl font-bold">Something went wrong</h1>
				<p className="text-muted-foreground mb-6 text-xl">
					Uh Oh! Numio AI experienced a brain freeze. <br />
					Please try again later or return to the home page.
				</p>

				<div className="flex justify-center gap-4">
					<Button asChild size="lg">
						<Link href="/">
							<Home className="mr-2 h-4 w-4" /> Go Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
