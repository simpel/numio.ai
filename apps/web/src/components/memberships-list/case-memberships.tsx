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

interface CaseMembership {
	id: string;
	role: string;
	createdAt: string;
	case: {
		id: string;
		title: string;
		team: {
			id: string;
			name: string;
		};
	};
}

interface CaseMembershipsProps {
	memberships: CaseMembership[];
	pending: boolean;
	onRemoveMembership: (id: string, name: string, type: 'case') => void;
}

export default function CaseMemberships({
	memberships,
	pending,
	onRemoveMembership,
}: CaseMembershipsProps) {
	const t = useTranslations('common');

	if (memberships.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-semibold">
					Case Memberships ({memberships.length})
				</h3>
			</div>
			<p className="text-muted-foreground text-sm">Your memberships in cases</p>
			<div className="rounded-md border">
				<div className="bg-muted/50 px-4 py-3 text-sm font-medium">
					<div className="grid grid-cols-4 gap-4">
						<div>Case</div>
						<div>Team</div>
						<div>Role</div>
						<div className="text-right">Actions</div>
					</div>
				</div>
				<div className="divide-y">
					{memberships.map((membership) => {
						const caseItem = membership.case;
						if (!caseItem) return null;

						return (
							<div key={membership.id} className="px-4 py-3">
								<div className="grid grid-cols-4 items-center gap-4">
									<div className="font-medium">
										<Link
											href={`/case/${caseItem.id}`}
											className="text-primary hover:text-primary/80 hover:underline"
										>
											{caseItem.title}
										</Link>
									</div>
									<div className="text-muted-foreground text-sm">
										{caseItem.team.name}
									</div>
									<div>
										<Badge variant="secondary">{membership.role}</Badge>
									</div>
									<div className="flex justify-end gap-2 text-right">
										<Button variant="outline" size="sm" asChild>
											<Link href={`/case/${caseItem.id}`}>
												{t('view_details')}
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
															caseItem.title,
															'case'
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
													<AlertDialogTitle>Leave Case</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to leave &quot;
														{caseItem.title}&quot;? This action cannot be undone
														and you will lose access to all case resources.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
													<AlertDialogAction
														onClick={() =>
															onRemoveMembership(
																membership.id,
																caseItem.title,
																'case'
															)
														}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Leave Case
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
