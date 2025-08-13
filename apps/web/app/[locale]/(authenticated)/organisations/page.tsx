import { Plus } from 'lucide-react';
import { Link } from '@src/i18n/navigation';
import { getTranslations } from 'next-intl/server';

import { getOrganisationsForUserAction } from '@src/lib/db/organisation/organisation.actions';
import { Button } from '@shadcn/ui/button';
import OrganisationsTable from '@src/components/tables/organisations-table';
import ErrorBoundary from '@src/components/error-boundary';

export default async function OrganisationsPage() {
	const t = await getTranslations('pages.organisations');

	const {
		data: organizations,
		message,
		isSuccess,
	} = await getOrganisationsForUserAction();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t('title')}</h1>
					<p className="text-muted-foreground">{t('subtitle')}</p>
				</div>
				<Button asChild>
					<Link href="/organisation/create">
						<Plus className="mr-2 h-4 w-4" /> {t('create_organization')}
					</Link>
				</Button>
			</div>

			{isSuccess && organizations && organizations.length > 0 ? (
				<ErrorBoundary>
					<OrganisationsTable
						data={organizations}
						title={t('table_title')}
						description={t('table_description')}
					/>
				</ErrorBoundary>
			) : (
				<div className="py-12 text-center">
					<h3 className="mb-2 text-lg font-semibold">
						{t('no_organizations_title')}
					</h3>
					<p className="text-muted-foreground mb-6">
						{message || t('no_organizations_message')}
					</p>
					<Button asChild>
						<Link href="/organisation/create">
							<Plus className="mr-2 h-4 w-4" /> {t('create_first_organization')}
						</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
