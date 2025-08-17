'use server';

import { Suspense } from 'react';
import { Role } from '@numio/ai-database';
import { Building2, Users2, Briefcase, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card';
import RoleGuard from '@src/components/auth/role-guard';
import AdminNavigation from '@src/components/admin-navigation/admin-navigation';
import { getOrganisationMetricsAction } from '@src/lib/db/organisation/organisation-metrics.actions';
import { getTeamMetricsAction } from '@src/lib/db/team/team-metrics.actions';
import { getUserMetricsAction } from '@src/lib/db/user/user-metrics.actions';
import { getCaseMetricsAction } from '@src/lib/db/case/case-metrics.actions';
import { calculateMetricSummary } from '@src/lib/db/metrics-utils';
import { AdminMetricsSkeleton } from '@src/components/admin/admin-skeleton';

interface AdminLayoutProps {
	children: React.ReactNode;
}

interface MetricCardProps {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	summary: {
		currentTotal: number;
		weekOverWeekChange: number;
		fourWeekTrend: number;
	};
}

function MetricCard({ title, icon, summary }: MetricCardProps) {
	const IconComponent = icon;
	const formatPercentage = (value: number) => {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(1)}%`;
	};

	const getChangeColor = (value: number) => {
		if (value > 0) return 'text-green-600';
		if (value < 0) return 'text-red-600';
		return 'text-muted-foreground';
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<IconComponent className="text-muted-foreground h-4 w-4" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{summary.currentTotal}</div>

				<div className="mt-2 space-y-1">
					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">This week:</span>
						<span className={getChangeColor(summary.weekOverWeekChange)}>
							{formatPercentage(summary.weekOverWeekChange)}
						</span>
					</div>

					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">4-week trend:</span>
						<span className={getChangeColor(summary.fourWeekTrend)}>
							{formatPercentage(summary.fourWeekTrend)}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<RoleGuard requiredRoles={[Role.superadmin]} redirectTo="/">
			<div className="container mx-auto px-6 py-8">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8 space-y-6">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Admin</h1>
							<p className="text-muted-foreground mb-6">
								Overview of system metrics and trends.
							</p>
						</div>
						<Suspense fallback={<AdminMetricsSkeleton />}>
							<AdminMetricsGrid />
						</Suspense>
						<AdminNavigation />
					</div>

					<div className="mt-8">{children}</div>
				</div>
			</div>
		</RoleGuard>
	);
}

async function AdminMetricsGrid() {
	const [
		{ data: orgMetrics },
		{ data: teamMetrics },
		{ data: userMetrics },
		{ data: caseMetrics },
	] = await Promise.all([
		getOrganisationMetricsAction(30),
		getTeamMetricsAction(30),
		getUserMetricsAction(30),
		getCaseMetricsAction(30),
	]);

	const orgSummary = calculateMetricSummary(orgMetrics || []);
	const teamSummary = calculateMetricSummary(teamMetrics || []);
	const userSummary = calculateMetricSummary(userMetrics || []);
	const caseSummary = calculateMetricSummary(caseMetrics || []);

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<MetricCard title="Organizations" icon={Building2} summary={orgSummary} />

			<MetricCard title="Teams" icon={Users2} summary={teamSummary} />

			<MetricCard title="Users" icon={User} summary={userSummary} />

			<MetricCard title="Cases" icon={Briefcase} summary={caseSummary} />
		</div>
	);
}
