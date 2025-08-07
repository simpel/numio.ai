'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { redirect } from 'next/navigation';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getOrganisationsForUserAction } from '@src/lib/db/organisation/organisation.actions';
import { getAllOrganisationsAction } from '@src/lib/db/organisation/organisation.actions';
import ErrorBoundary from '@src/components/error-boundary';
import OrganisationsTable from '@src/components/tables/organisations-table';

interface OrganisationData {
	id: string;
	name: string;
	role: string;
	memberSince: string;
	organisationId: string;
}

export default async function SettingsOrganisationsPage() {
	const user = await getCurrentUser();
	if (!user?.id) {
		redirect('/signin');
	}

	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	// Check if user is superadmin
	const isSuperAdmin = profile.role === ('superadmin' as any);

	// Get user's organizations
	const { data: userOrganisationMemberships } =
		await getOrganisationsForUserAction();

	// Transform user's data
	const userOrganisationsData: OrganisationData[] =
		userOrganisationMemberships
			?.filter((membership) => membership.organisation)
			.map((membership) => ({
				id: membership.id,
				name: membership.organisation!.name,
				role: membership.role,
				memberSince: new Date(membership.createdAt).toLocaleDateString(),
				organisationId: membership.organisation!.id,
			})) || [];

	// Get all organizations for superadmin
	let allOrganisationsData: OrganisationData[] = [];

	if (isSuperAdmin) {
		const { data: allOrganisations } = await getAllOrganisationsAction();

		allOrganisationsData =
			allOrganisations?.map((org: any) => ({
				id: org.id,
				name: org.name,
				role: 'admin', // Superadmin has admin access to all orgs
				memberSince: new Date(org.createdAt).toLocaleDateString(),
				organisationId: org.id,
			})) || [];
	}

	return (
		<div className="space-y-6">
			{/* User's Organizations */}
			{userOrganisationsData.length > 0 && (
				<ErrorBoundary>
					<OrganisationsTable
						data={userOrganisationsData}
						title="Your Organizations"
						description="Organizations you have access to"
						showActions={true}
						showMemberSince={true}
					/>
				</ErrorBoundary>
			)}

			{/* All Organizations (Superadmin only) */}
			{isSuperAdmin && allOrganisationsData.length > 0 && (
				<ErrorBoundary>
					<OrganisationsTable
						data={allOrganisationsData}
						title="All Organizations"
						description="All organizations in the system"
						showActions={true}
						showMemberSince={true}
					/>
				</ErrorBoundary>
			)}

			{userOrganisationsData.length === 0 && !isSuperAdmin && (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No organizations found.</p>
				</div>
			)}
		</div>
	);
}
