'use server';

import { getTranslations } from 'next-intl/server';
import { getCasesForUserAction } from '@src/lib/db/case/case.actions';
import CasesTable from '@src/components/tables/cases-table';
import ErrorBoundary from '@src/components/error-boundary';

export default async function CasesPage() {
	const t = await getTranslations('pages.cases');

	const { data: cases, isSuccess, message } = await getCasesForUserAction();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">{t('title')}</h1>
				<p className="text-muted-foreground">{t('subtitle')}</p>
			</div>

			{isSuccess && cases && cases.length > 0 ? (
				<ErrorBoundary>
					<CasesTable
						data={cases}
						title={t('table_title')}
						description={t('table_description')}
						showClient={true}
					/>
				</ErrorBoundary>
			) : (
				<div className="py-12 text-center">
					<h3 className="mb-2 text-lg font-semibold">{t('no_cases_title')}</h3>
					<p className="text-muted-foreground mb-6">
						{message || t('no_cases_message')}
					</p>
				</div>
			)}
		</div>
	);
}
