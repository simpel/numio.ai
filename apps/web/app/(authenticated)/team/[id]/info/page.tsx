'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getTeamDetailsPublicAction } from '@src/lib/db/team/team.actions';
import { notFound } from 'next/navigation';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@shadcn/ui/card';
import DeleteTeamDialog from '@src/components/dialogs/delete-team-dialog';

interface TeamInfoPageProps {
	params: Promise<{ id: string }>;
}

// Type for team with included relations
interface TeamWithDetails {
	id: string;
	name: string;
	description: string | null;
	createdAt: Date;
	organisationId: string;
	ownerId: string;
	organisation: {
		id: string;
		name: string;
	};
	owner: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string | null;
	};
	contextMemberships: Array<{
		id: string;
		role: string;
		userProfile: {
			id: string;
			firstName: string | null;
			lastName: string | null;
			email: string | null;
		};
	}>;
}

export default async function TeamInfoPage({ params }: TeamInfoPageProps) {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { id: teamId } = await params;
	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	const { data: teamDetails, isSuccess } =
		await getTeamDetailsPublicAction(teamId);

	if (!isSuccess || !teamDetails) {
		notFound();
	}

	// Cast to the correct type with includes
	const teamWithDetails = teamDetails as unknown as TeamWithDetails;

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="text-muted-foreground text-sm font-medium">
							Created
						</label>
						<p className="text-sm">
							{new Date(teamWithDetails.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>
				{teamWithDetails.description && (
					<div>
						<label className="text-muted-foreground text-sm font-medium">
							Description
						</label>
						<p className="text-muted-foreground text-sm">
							{teamWithDetails.description}
						</p>
					</div>
				)}
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<div>
						<label className="text-muted-foreground text-sm font-medium">
							Organization Name
						</label>
						<p className="text-sm font-medium">
							{teamWithDetails.organisation.name}
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Owner</h3>
				<div className="space-y-2">
					<div>
						<label className="text-muted-foreground text-sm font-medium">
							Owner Name
						</label>
						<p className="text-sm font-medium">
							{teamWithDetails.owner.firstName && teamWithDetails.owner.lastName
								? `${teamWithDetails.owner.firstName} ${teamWithDetails.owner.lastName}`
								: teamWithDetails.owner.email || 'Unknown'}
						</p>
					</div>
				</div>
			</div>

			{/* Admin Options */}
			<Card className="border-destructive">
				<CardHeader>
					<CardTitle className="text-destructive">Danger Zone</CardTitle>
					<CardDescription>
						Dangerous actions that cannot be undone.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="border-destructive/20 bg-destructive/5 flex items-center justify-between rounded-lg border p-4">
						<div>
							<p className="text-sm font-medium">Delete Team</p>
							<p className="text-muted-foreground text-sm">
								Permanently delete this team and all associated data.
							</p>
						</div>
						<DeleteTeamDialog
							teamId={teamWithDetails.id}
							teamName={teamWithDetails.name}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
