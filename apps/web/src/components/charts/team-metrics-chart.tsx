'use client';

import MetricsChart from './metrics-chart';

interface TeamMetricsData {
	date: string;
	dateLabel: string;
	total: number;
	created: number;
	deleted: number;
}

interface TeamMetricsChartProps {
	data: TeamMetricsData[];
}

export default function TeamMetricsChart({ data }: TeamMetricsChartProps) {
	return <MetricsChart data={data} entityType="teams" />;
}
