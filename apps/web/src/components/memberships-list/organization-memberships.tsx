'use client';

import { Button } from '@shadcn/ui/button';
import { Badge } from '@shadcn/ui/badge';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@shadcn/ui/alert-dialog';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

interface OrganizationMembership {
	id: string;
	role: string;
	createdAt: string;
	organisation?: {
		id: string;
		name: string;
	};
}

interface OrganizationMembershipsProps {
	memberships: OrganizationMembership[];
	pending: boolean;
	onRemoveMembership: (id: string, name: string, type: 'organisation') => void;
}

export default function OrganizationMemberships({
	memberships,
	pending,
	onRemoveMembership,
}: OrganizationMembershipsProps) {
	if (memberships.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-semibold">
					Organization Memberships ({memberships.length})
				</h3>
			</div>
			<p className="text-muted-foreground text-sm">
				Your memberships in organizations
			</p>
			<div className="rounded-md border">
				<div className="bg-muted/50 px-4 py-3 text-sm font-medium">
					<div className="grid grid-cols-4 gap-4">
						<div>Organization</div>
						<div>Role</div>
						<div>Member Since</div>
						<div className="text-right">Actions</div>
					</div>
				</div>
				<div className="divide-y">
					{memberships.map((membership) => (
						<div key={membership.id} className="px-4 py-3">
							<div className="grid grid-cols-4 items-center gap-4">
								<div className="font-medium">
									<Link
										href={`/organisation/${membership.organisation?.id}`}
										className="text-primary hover:text-primary/80 hover:underline"
									>
										{membership.organisation?.name}
									</Link>
								</div>
								<div>
									<Badge variant="secondary">{membership.role}</Badge>
								</div>
								<div className="text-muted-foreground text-sm">
									{new Date(membership.createdAt).toLocaleDateString()}
								</div>
								<div className="flex justify-end gap-2 text-right">
									<Button variant="outline" size="sm" asChild>
										<Link href={`/organisation/${membership.organisation?.id}`}>
											View Details
										</Link>
									</Button>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													onRemoveMembership(
														membership.id,
														membership.organisation?.name || 'Organization',
														'organisation'
													)
												}
												disabled={pending}
												className="text-destructive hover:text-destructive"
											>
												<LogOut className="mr-2 h-4 w-4" />
												Leave
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Leave Organization</AlertDialogTitle>
												<AlertDialogDescription>
													Are you sure you want to leave &quot;
													{membership.organisation?.name}&quot;? This action
													cannot be undone and you will lose access to all
													organization resources.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={() =>
														onRemoveMembership(
															membership.id,
															membership.organisation?.name || 'Organization',
															'organisation'
														)
													}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
												>
													Leave Organization
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
