'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getOrganisationWithDetailsAction } from '@src/lib/db/organisation/organisation.actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card';

interface OrganisationPageProps {
	params: Promise<{ id: string }>;
}

export default async function OrganisationPage({
	params,
}: OrganisationPageProps) {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { id } = await params;
	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	const { data: organisation, isSuccess } =
		await getOrganisationWithDetailsAction(id);

	if (!isSuccess || !organisation) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Organization Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label className="text-muted-foreground text-sm font-medium">
							Name
						</label>
						<p className="text-sm">{organisation.name}</p>
					</div>
					<div>
						<label className="text-muted-foreground text-sm font-medium">
							Created
						</label>
						<p className="text-sm">
							{new Date(organisation.createdAt).toLocaleDateString()}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
