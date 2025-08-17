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

export function AdminMetricsSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{[1, 2, 3, 4].map((i) => (
				<Card key={i}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-4 w-4" />
					</CardHeader>
					<CardContent>
						<Skeleton className="mb-2 h-8 w-16" />
						<div className="space-y-1">
							<div className="flex items-center justify-between">
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-3 w-12" />
							</div>
							<div className="flex items-center justify-between">
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-3 w-12" />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
