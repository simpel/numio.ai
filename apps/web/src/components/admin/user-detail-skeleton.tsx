'use client';

import { Skeleton } from '@shadcn/ui/skeleton';
import { Card, CardContent, CardHeader } from '@shadcn/ui/card';

export function UserDetailSkeleton() {
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
				<CardContent className="space-y-4">
					<div className="flex items-center space-x-4">
						<Skeleton className="h-10 w-10 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-48" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-4 w-72" />
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-24" />
								</div>
								<Skeleton className="h-6 w-16" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
