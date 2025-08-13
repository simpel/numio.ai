'use server';

import { getUserProfileWithRole } from '@src/lib/auth/auth.utils';
import { getOrganisationsForUserAction } from '@src/lib/db/organisation/organisation.actions';
import { getAllOrganisationsAction } from '@src/lib/db/organisation/organisation.actions';
import { getOrganisationMetricsAction } from '@src/lib/db/organisation/organisation-metrics.actions';

import ErrorBoundary from '@src/components/error-boundary';
import { Role } from '@numio/ai-database';
import OrganisationMetricsChart from '@src/components/charts/organisation-metrics-chart';
import OrganisationsTable from '@src/components/tables/organisations-table';

interface OrganisationWithDetails {
	id: string;
	name: string;
	createdAt: Date;
	owner: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string | null;
	};
	_count: {
		teams: number;
		memberships: number;
	};
}

export default async function SettingsOrganisationsPage() {
	// Get user profile - authentication is handled by the layout
	const profile = await getUserProfileWithRole();

	// Get user's organizations
	const { data: userOrganisationMemberships } =
		await getOrganisationsForUserAction();

	// Transform user's data
	const userOrganisationsData =
		userOrganisationMemberships
			?.filter((membership) => membership.organisation !== null)
			.map((membership) => {
				const org = membership.organisation!;
				return {
					id: membership.id,
					name: org.name,
					organisationId: org.id,
					teamsCount: 0, // Will be populated by the table component
					usersCount: 0, // Will be populated by the table component
					ownerName: undefined, // Will be populated by the table component
					createdAt: org.createdAt.toISOString(),
				};
			}) || [];

	// Get all organizations for superadmin
	let allOrganisationsData: Array<{
		id: string;
		name: string;
		organisationId: string;
		teamsCount: number;
		usersCount: number;
		ownerName?: string;
		createdAt: string;
	}> = [];

	// Get organization metrics for chart (only for superadmin)
	let organisationMetrics = null;
	if (profile?.role === Role.superadmin) {
		const { data: metrics } = await getOrganisationMetricsAction(30);
		organisationMetrics = metrics;
	}

	if (profile?.role === Role.superadmin) {
		const { data: allOrganisations } = await getAllOrganisationsAction();

		allOrganisationsData =
			allOrganisations?.map((org: OrganisationWithDetails) => ({
				id: org.id,
				name: org.name,
				organisationId: org.id,
				teamsCount: org._count.teams,
				usersCount: org._count.memberships,
				ownerName: org.owner
					? `${org.owner.firstName || ''} ${org.owner.lastName || ''}`.trim()
					: undefined,
				createdAt: org.createdAt.toISOString(),
			})) || [];
	}

	return (
		<div className="space-y-6">
			{/* Organization Metrics Chart (Superadmin only) */}
			{profile?.role === Role.superadmin &&
				organisationMetrics &&
				organisationMetrics.length > 0 && (
					<OrganisationMetricsChart data={organisationMetrics} />
				)}

			{/* User's Organizations */}
			{userOrganisationsData.length > 0 && (
				<ErrorBoundary>
					<OrganisationsTable
						data={userOrganisationsData}
						title="Your Organizations"
						description="Organizations you have access to"
						showOwner={true}
						showCreatedAt={true}
					/>
				</ErrorBoundary>
			)}

			{/* All Organizations (Superadmin only) */}
			{profile?.role === Role.superadmin && allOrganisationsData.length > 0 && (
				<ErrorBoundary>
					<OrganisationsTable
						data={allOrganisationsData}
						title="All Organizations"
						description="All organizations in the system"
						showOwner={true}
						showCreatedAt={true}
					/>
				</ErrorBoundary>
			)}

			{userOrganisationsData.length === 0 &&
				profile?.role !== Role.superadmin && (
					<div className="py-8 text-center">
						<p className="text-muted-foreground">No organizations found.</p>
					</div>
				)}
		</div>
	);
}
