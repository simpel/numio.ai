'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getTeamDetailsPublicAction } from '@src/lib/db/team/team.actions';
import { notFound } from 'next/navigation';
import SectionNavigation from '@src/components/section-navigation/section-navigation';
import { Button } from '@shadcn/ui/button';
import { Plus, UserPlus } from 'lucide-react';
import Link from 'next/link';
import TeamActionsMenu from '@src/components/team-actions-menu';

interface TeamLayoutProps {
	params: Promise<{ id: string }>;
	children: React.ReactNode;
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

export default async function TeamLayout({
	params,
	children,
}: TeamLayoutProps) {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { id } = await params;
	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	const { data: teamDetails, isSuccess } = await getTeamDetailsPublicAction(id);

	if (!isSuccess || !teamDetails) {
		notFound();
	}

	// Cast to the correct type with includes
	const teamWithDetails = teamDetails as unknown as TeamWithDetails;

	// Define navigation sections
	const sections = [
		{
			id: 'cases',
			label: 'Cases',
			href: `/team/${id}/cases`,
		},
		{
			id: 'members',
			label: 'Members',
			href: `/team/${id}/members`,
		},
		{
			id: 'info',
			label: 'Team Information',
			href: `/team/${id}/info`,
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold tracking-tight">
					{teamWithDetails.name}
				</h1>

				{/* Action Buttons */}
				<div className="flex items-center space-x-2">
					<Button asChild variant="outline">
						<Link href={`/team/${id}/members`}>
							<UserPlus className="mr-2 h-4 w-4" />
							Add Member
						</Link>
					</Button>
					<Button asChild>
						<Link href={`/case/create?teamId=${id}`}>
							<Plus className="mr-2 h-4 w-4" />
							Create Case
						</Link>
					</Button>
					<TeamActionsMenu
						teamId={id}
						teamName={teamWithDetails.name}
						teamDescription={teamWithDetails.description}
					/>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<p className="text-muted-foreground">{teamWithDetails.description}</p>
			</div>

			{/* Section Navigation */}
			<SectionNavigation sections={sections} />

			{/* Page Content */}
			{children}
		</div>
	);
}
