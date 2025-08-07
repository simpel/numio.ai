'use server';

import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getOrganisationWithDetailsAction } from '@src/lib/db/organisation/organisation.actions';
import { Button } from '@shadcn/ui/button';
import SectionNavigation from '@src/components/section-navigation/section-navigation';

interface OrganisationLayoutProps {
	params: Promise<{ id: string }>;
	children: React.ReactNode;
}

export default async function OrganisationLayout({
	params,
	children,
}: OrganisationLayoutProps) {
	const { id } = await params;
	const {
		data: organisation,
		isSuccess,
		message,
	} = await getOrganisationWithDetailsAction(id);

	if (!isSuccess || !organisation) {
		notFound();
	}

	// Define navigation sections
	const sections = [
		{
			id: 'information',
			label: 'Organization Information',
			href: `/organisation/${id}`,
		},
		{
			id: 'teams',
			label: 'Teams',
			href: `/organisation/${id}/teams`,
		},
		{
			id: 'users',
			label: 'Users',
			href: `/organisation/${id}/users`,
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{organisation.name}</h1>
				</div>
				<Button asChild>
					<Link href="/organisations">
						<Building2 className="mr-2 h-4 w-4" /> Back to Organizations
					</Link>
				</Button>
			</div>

			{/* Section Navigation */}
			<SectionNavigation sections={sections} />

			{/* Page Content */}
			{children}
		</div>
	);
}
