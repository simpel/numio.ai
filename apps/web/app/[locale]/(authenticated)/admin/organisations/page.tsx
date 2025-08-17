'use server';

import { getAllOrganisationsAction } from '@src/lib/db/organisation/organisation.actions';
import { getOrganisationMetricsAction } from '@src/lib/db/organisation/organisation-metrics.actions';
import ErrorBoundary from '@src/components/error-boundary';
import OrganisationMetricsChart from '@src/components/charts/organisation-metrics-chart';
import OrganisationsTable from '@src/components/tables/organisations-table';

export default async function AdminOrganisationsPage() {
	// Get all organizations (no role filtering in admin)
	const { data: allOrganisations } = await getAllOrganisationsAction();

	// Get organization metrics for chart
	const { data: organisationMetrics } = await getOrganisationMetricsAction(30);

	return (
		<div className="space-y-6">
			{/* Organization Metrics Chart */}
			{organisationMetrics && organisationMetrics.length > 0 && (
				<ErrorBoundary>
					<OrganisationMetricsChart data={organisationMetrics} />
				</ErrorBoundary>
			)}

			{/* All Organizations */}
			{allOrganisations && allOrganisations.length > 0 && (
				<ErrorBoundary>
					<OrganisationsTable
						data={allOrganisations}
						title="All Organizations"
						description="All organizations in the system"
						showOwner={true}
						showCreatedAt={true}
					/>
				</ErrorBoundary>
			)}

			{/* Empty state */}
			{(!allOrganisations || allOrganisations.length === 0) && (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No organizations found.</p>
				</div>
			)}
		</div>
	);
}
