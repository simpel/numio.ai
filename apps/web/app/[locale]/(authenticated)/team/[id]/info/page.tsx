'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getTeamDetailsPublicAction } from '@src/lib/db/team/team.actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card';
import { Link } from '@src/i18n/navigation';

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
	const { data: _profile } = await getUserProfileAction(user.id);
	if (!_profile) {
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
			<Card>
				<CardHeader>
					<CardTitle>Team Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label className="text-muted-foreground text-sm font-medium">
							Name
						</label>
						<p className="text-sm">{teamWithDetails.name}</p>
					</div>
					{teamWithDetails.description && (
						<div>
							<label className="text-muted-foreground text-sm font-medium">
								Description
							</label>
							<p className="text-sm">{teamWithDetails.description}</p>
						</div>
					)}
					<div>
						<label className="text-muted-foreground text-sm font-medium">
							Organization
						</label>
						<Link
							href={`/organisation/${teamWithDetails.organisation.id}`}
							className="text-primary text-sm hover:underline"
						>
							{teamWithDetails.organisation.name}
						</Link>
					</div>
					<div>
						<label className="text-muted-foreground text-sm font-medium">
							Owner
						</label>
						<p className="text-sm">
							{teamWithDetails.owner.firstName} {teamWithDetails.owner.lastName}
						</p>
					</div>
					<div>
						<label className="text-muted-foreground text-sm font-medium">
							Created
						</label>
						<p className="text-sm">
							{new Date(teamWithDetails.createdAt).toLocaleDateString()}
						</p>
					</div>
					<div>
						<label className="text-muted-foreground text-sm font-medium">
							Members
						</label>
						<p className="text-sm">{teamWithDetails.contextMemberships.length}</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
