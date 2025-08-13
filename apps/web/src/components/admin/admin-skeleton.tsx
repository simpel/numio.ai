'use client';

import { Skeleton } from '@shadcn/ui/skeleton';
import { Card, CardContent, CardHeader } from '@shadcn/ui/card';

export function AdminSkeleton() {
	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="space-y-2">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-96" />
			</div>

			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-80" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-10 w-96" />
				</CardContent>
			</Card>
		</div>
	);
}
