import { Plus } from 'lucide-react';
import { Link } from '@src/i18n/navigation';
import { getTranslations } from 'next-intl/server';

import { getTeamsForUserAction } from '@src/lib/db/team/team.actions';
import { Button } from '@shadcn/ui/button';
import TeamsTable from '@src/components/tables/teams-table';
import ErrorBoundary from '@src/components/error-boundary';

export default async function TeamsPage() {
	const t = await getTranslations('pages.teams');

	const { data: teams, message, isSuccess } = await getTeamsForUserAction();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{t('title')}</h1>
					<p className="text-muted-foreground">{t('subtitle')}</p>
				</div>
				<Button asChild>
					<Link href="/teams/create">
						<Plus className="mr-2 h-4 w-4" /> {t('create_team')}
					</Link>
				</Button>
			</div>

			{isSuccess && teams && teams.length > 0 ? (
				<ErrorBoundary>
					<TeamsTable
						data={teams}
						title={t('table_title')}
						description={t('table_description')}
						showDescription={false}
						showOwner={false}
						showAdmin={true}
						showCreatedAt={true}
					/>
				</ErrorBoundary>
			) : (
				<div className="py-12 text-center">
					<h3 className="mb-2 text-lg font-semibold">{t('no_teams_title')}</h3>
					<p className="text-muted-foreground mb-6">
						{message || t('no_teams_message')}
					</p>
					<Button asChild>
						<Link href="/teams/create">
							<Plus className="mr-2 h-4 w-4" /> {t('create_first_team')}
						</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
