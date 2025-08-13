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
import { useTranslations } from 'next-intl';
import { Link } from '@src/i18n/navigation';

interface TeamMembership {
	id: string;
	role: string;
	createdAt: string;
	team: {
		id: string;
		name: string;
		organisation: {
			id: string;
			name: string;
		};
	};
}

interface TeamMembershipsProps {
	memberships: TeamMembership[];
	pending: boolean;
	onRemoveMembership: (id: string, name: string, type: 'team') => void;
}

export default function TeamMemberships({
	memberships,
	pending,
	onRemoveMembership,
}: TeamMembershipsProps) {
	const t = useTranslations('common');

	if (memberships.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-semibold">
					Team Memberships ({memberships.length})
				</h3>
			</div>
			<p className="text-muted-foreground text-sm">Your memberships in teams</p>
			<div className="rounded-md border">
				<div className="bg-muted/50 px-4 py-3 text-sm font-medium">
					<div className="grid grid-cols-4 gap-4">
						<div>Team</div>
						<div>Organization</div>
						<div>Role</div>
						<div className="text-right">Actions</div>
					</div>
				</div>
				<div className="divide-y">
					{memberships.map((membership) => {
						const team = membership.team;
						if (!team) return null;

						return (
							<div key={membership.id} className="px-4 py-3">
								<div className="grid grid-cols-4 items-center gap-4">
									<div className="font-medium">
										<Link
											href={`/teams/${team.id}`}
											className="text-primary hover:text-primary/80 hover:underline"
										>
											{team.name}
										</Link>
									</div>
									<div className="text-muted-foreground text-sm">
										{team.organisation.name}
									</div>
									<div>
										<Badge variant="secondary">{membership.role}</Badge>
									</div>
									<div className="flex justify-end gap-2 text-right">
										<Button variant="outline" size="sm" asChild>
											<Link href={`/teams/${team.id}`}>
												{t('view_details')}
											</Link>
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														onRemoveMembership(membership.id, team.name, 'team')
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
													<AlertDialogTitle>Leave Team</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to leave &quot;
														{team.name}&quot;? This action cannot be undone and
														you will lose access to all team resources.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
													<AlertDialogAction
														onClick={() =>
															onRemoveMembership(
																membership.id,
																team.name,
																'team'
															)
														}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Leave Team
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
