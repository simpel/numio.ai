'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { getTranslations } from 'next-intl/server';
import { Button } from '@shadcn/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@shadcn/ui/card';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { Link } from '@src/i18n/navigation';
import Header from '@src/components/header';

export default async function LocalePage() {
	const t = await getTranslations('common');

	const user = await getCurrentUser();

	if (user?.id) {
		// User is authenticated - show authenticated content

		return (
			<div>
				<Header />
				<div className="container mx-auto px-6 py-8">
					<div className="mx-auto max-w-4xl">
						<main>
							<div className="space-y-6">
								<div>
									<h1 className="text-3xl font-bold">{t('welcome_title')}</h1>
									<p className="text-muted-foreground mt-2">
										{t('welcome_subtitle')}
									</p>
								</div>

								<Card>
									<CardHeader>
										<CardTitle>{t('getting_started')}</CardTitle>
										<CardDescription>
											{t('start_exploring_workspace')}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
											<Link href="/cases" className="block">
												<Card className="hover:bg-muted/50 transition-colors">
													<CardContent className="pt-6">
														<h3 className="font-semibold">{t('cases')}</h3>
														<p className="text-muted-foreground text-sm">
															{t('view_and_manage_cases')}
														</p>
													</CardContent>
												</Card>
											</Link>

											<Link href="/teams" className="block">
												<Card className="hover:bg-muted/50 transition-colors">
													<CardContent className="pt-6">
														<h3 className="font-semibold">{t('teams')}</h3>
														<p className="text-muted-foreground text-sm">
															{t('manage_your_teams')}
														</p>
													</CardContent>
												</Card>
											</Link>

											<Link href="/organisations" className="block">
												<Card className="hover:bg-muted/50 transition-colors">
													<CardContent className="pt-6">
														<h3 className="font-semibold">
															{t('organizations')}
														</h3>
														<p className="text-muted-foreground text-sm">
															{t('view_your_organizations')}
														</p>
													</CardContent>
												</Card>
											</Link>
										</div>
									</CardContent>
								</Card>
							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}

	// User is not authenticated - show welcome page
	return (
		<div className="flex min-h-screen flex-col items-center justify-center py-12">
			<div className="w-full max-w-md text-center">
				<div className="mb-8">
					<h1 className="mb-4 text-4xl font-bold">{t('welcome_title')}</h1>
					<p className="text-muted-foreground text-lg">
						{t('welcome_subtitle')}
					</p>
				</div>

				<div className="space-y-4">
					<Button asChild size="lg" className="w-full">
						<Link href="/signin">
							<UserPlus className="mr-2 h-4 w-4" />
							{t('get_started')}
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>

					<Button asChild variant="outline" size="lg" className="w-full">
						<Link href="/signin">
							<LogIn className="mr-2 h-4 w-4" />
							{t('sign_in')}
						</Link>
					</Button>
				</div>

				<div className="text-muted-foreground mt-8 text-sm">
					<p>{t('already_have_account')}</p>
				</div>
			</div>
		</div>
	);
}
