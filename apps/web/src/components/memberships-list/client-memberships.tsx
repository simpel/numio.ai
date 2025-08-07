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

interface ClientMembership {
	id: string;
	role: string;
	createdAt: string;
	client?: {
		id: string;
		name: string;
		organisation: {
			id: string;
			name: string;
		};
	};
}

interface ClientMembershipsProps {
	memberships: ClientMembership[];
	pending: boolean;
	onRemoveMembership: (id: string, name: string, type: 'client') => void;
}

export default function ClientMemberships({
	memberships,
	pending,
	onRemoveMembership,
}: ClientMembershipsProps) {
	if (memberships.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-semibold">
					Client Memberships ({memberships.length})
				</h3>
			</div>
			<p className="text-muted-foreground text-sm">
				Your memberships with clients
			</p>
			<div className="rounded-md border">
				<div className="bg-muted/50 px-4 py-3 text-sm font-medium">
					<div className="grid grid-cols-4 gap-4">
						<div>Client</div>
						<div>Organization</div>
						<div>Role</div>
						<div className="text-right">Actions</div>
					</div>
				</div>
				<div className="divide-y">
					{memberships.map((membership) => {
						const client = membership.client;
						if (!client) return null;

						return (
							<div key={membership.id} className="px-4 py-3">
								<div className="grid grid-cols-4 items-center gap-4">
									<div className="font-medium">
										<Link
											href={`/client/${client.id}`}
											className="text-primary hover:text-primary/80 hover:underline"
										>
											{client.name}
										</Link>
									</div>
									<div className="text-muted-foreground text-sm">
										{client.organisation.name}
									</div>
									<div>
										<Badge variant="secondary">{membership.role}</Badge>
									</div>
									<div className="flex justify-end gap-2 text-right">
										<Button variant="outline" size="sm" asChild>
											<Link href={`/client/${client.id}`}>View Details</Link>
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														onRemoveMembership(
															membership.id,
															client.name,
															'client'
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
													<AlertDialogTitle>Leave Client</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to leave &quot;
														{client.name}&quot;? This action cannot be undone
														and you will lose access to all client resources.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() =>
															onRemoveMembership(
																membership.id,
																client.name,
																'client'
															)
														}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Leave Client
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
