'use client';

import MetricsChart from './metrics-chart';

interface OrganisationMetricsData {
	date: string;
	dateLabel: string;
	total: number;
	created: number;
	deleted: number;
}

interface OrganisationMetricsChartProps {
	data: OrganisationMetricsData[];
	title?: string;
}

export default function OrganisationMetricsChart({
	data,
	title,
}: OrganisationMetricsChartProps) {
	return <MetricsChart data={data} entityType="organizations" title={title} />;
}
