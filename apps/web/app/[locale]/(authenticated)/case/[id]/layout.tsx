'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getCaseDetailsAction } from '@src/lib/db/case/case.actions';
import { notFound } from 'next/navigation';
import SectionNavigation from '@src/components/section-navigation/section-navigation';

interface CaseLayoutProps {
	params: Promise<{ id: string }>;
	children: React.ReactNode;
}

// Type for case with included relations
interface CaseWithDetails {
	id: string;
	title: string;
	description: string | null;
	createdAt: Date;
	teamId: string;
	clientId: string;
	team: {
		id: string;
		name: string;
		organisation: {
			id: string;
			name: string;
		};
	};
	client: {
		id: string;
		name: string;
	};
}

export default async function CaseLayout({
	params,
	children,
}: CaseLayoutProps) {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { id: caseId } = await params;
	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	const { data: caseDetails, isSuccess } = await getCaseDetailsAction(caseId);

	if (!isSuccess || !caseDetails) {
		notFound();
	}

	// Cast to the correct type with includes
	const caseWithDetails = caseDetails as unknown as CaseWithDetails;

	// Define navigation sections
	const sections = [
		{
			id: 'information',
			label: 'Case Information',
			href: `/case/${caseId}`,
		},
		{
			id: 'users',
			label: 'Users',
			href: `/case/${caseId}/users`,
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					{caseWithDetails.title}
				</h1>
				<p className="text-muted-foreground">Case details and information</p>
			</div>

			{/* Section Navigation */}
			<SectionNavigation sections={sections} />

			{/* Page Content */}
			{children}
		</div>
	);
}
