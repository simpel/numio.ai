import { Plus } from 'lucide-react';
import Link from 'next/link';

import { getOrganisationsForUserAction } from '@src/lib/db/organisation/organisation.actions';
import { Button } from '@shadcn/ui/button';
import OrganisationsTable from '@src/components/tables/organisations-table';
import ErrorBoundary from '@src/components/error-boundary';

interface OrganisationData {
	id: string;
	name: string;
	role: string;
	memberSince: string;
	organisationId: string;
}

export default async function OrganisationsPage() {
	const {
		data: memberships,
		message,
		isSuccess,
	} = await getOrganisationsForUserAction();

	const organisationsData: OrganisationData[] =
		memberships
			?.filter((membership) => membership.organisation)
			.map((membership) => ({
				id: membership.id,
				name: membership.organisation!.name,
				role: membership.role,
				memberSince: new Date(membership.createdAt).toLocaleDateString(),
				organisationId: membership.organisation!.id,
			})) || [];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Your Organizations</h1>
					<p className="text-muted-foreground">
						Organizations you're a member of
					</p>
				</div>
				<Button asChild>
					<Link href="/organisation/create">
						<Plus className="mr-2 h-4 w-4" /> Create Organization
					</Link>
				</Button>
			</div>

			{isSuccess && organisationsData.length > 0 ? (
				<ErrorBoundary>
					<OrganisationsTable
						data={organisationsData}
						title="Organizations"
						description="All organizations you're a member of"
					/>
				</ErrorBoundary>
			) : (
				<div className="py-12 text-center">
					<h3 className="mb-2 text-lg font-semibold">No Organizations Yet</h3>
					<p className="text-muted-foreground mb-6">
						{message ||
							"You're not part of any organizations yet. Create your first organization to get started."}
					</p>
					<Button asChild>
						<Link href="/organisation/create">
							<Plus className="mr-2 h-4 w-4" /> Create Your First Organization
						</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
