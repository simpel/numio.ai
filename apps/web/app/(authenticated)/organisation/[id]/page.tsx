import { notFound } from 'next/navigation';

import { getOrganisationWithDetailsAction } from '@src/lib/db/organisation/organisation.actions';

interface OrganisationPageProps {
	params: Promise<{ id: string }>;
}

export default async function OrganisationPage({
	params,
}: OrganisationPageProps) {
	const { id } = await params;
	const {
		data: organisation,
		isSuccess,
		message,
	} = await getOrganisationWithDetailsAction(id);

	if (!isSuccess || !organisation) {
		notFound();
	}

	return (
		<div className="space-y-4">
			<div>
				<label className="text-muted-foreground text-sm font-medium">
					Name
				</label>
				<p className="text-lg">{organisation.name}</p>
			</div>
			<div>
				<label className="text-muted-foreground text-sm font-medium">
					Owner
				</label>
				<div className="mt-1 flex items-center gap-2">
					<span>
						{organisation.owner.firstName} {organisation.owner.lastName}
					</span>
				</div>
			</div>
			<div>
				<label className="text-muted-foreground text-sm font-medium">
					Created
				</label>
				<p>{new Date(organisation.createdAt).toLocaleDateString()}</p>
			</div>
		</div>
	);
}
