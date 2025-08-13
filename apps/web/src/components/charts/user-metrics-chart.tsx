'use client';

import MetricsChart from './metrics-chart';

interface UserMetricsData {
	date: string;
	dateLabel: string;
	total: number;
	created: number;
	deleted: number;
}

interface UserMetricsChartProps {
	data: UserMetricsData[];
}

export default function UserMetricsChart({ data }: UserMetricsChartProps) {
	return <MetricsChart data={data} entityType="users" />;
}
