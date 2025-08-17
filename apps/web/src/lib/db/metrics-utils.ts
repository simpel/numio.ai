import { subDays } from 'date-fns';

export interface MetricSummary {
	currentTotal: number;
	weekOverWeekChange: number;
	fourWeekTrend: number;
}

export interface MetricsDataPoint {
	date: string;
	dateLabel: string;
	total: number;
	created: number;
	deleted: number;
}

export function calculateMetricSummary(
	data: MetricsDataPoint[],
	_days: number = 30
): MetricSummary {
	if (data.length === 0) {
		return {
			currentTotal: 0,
			weekOverWeekChange: 0,
			fourWeekTrend: 0,
		};
	}

	// Get current total (last data point)
	const currentTotal = data[data.length - 1]?.total || 0;

	// Calculate week-over-week change
	const oneWeekAgo = subDays(new Date(), 7).toISOString().split('T')[0]!;
	const twoWeeksAgo = subDays(new Date(), 14).toISOString().split('T')[0]!;

	const currentWeekData = data.find((d) => d.date >= oneWeekAgo);
	const previousWeekData = data.find(
		(d) => d.date >= twoWeeksAgo && d.date < oneWeekAgo
	);

	const currentWeekTotal = currentWeekData?.total || currentTotal;
	const previousWeekTotal = previousWeekData?.total || 0;

	const weekOverWeekChange =
		previousWeekTotal === 0
			? currentWeekTotal > 0
				? 100
				: 0
			: ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;

	// Calculate 4-week trend
	const fourWeeksAgo = subDays(new Date(), 28).toISOString().split('T')[0]!;
	const fourWeeksAgoData = data.find((d) => d.date >= fourWeeksAgo);

	const fourWeeksAgoTotal = fourWeeksAgoData?.total || 0;
	const fourWeekTrend =
		fourWeeksAgoTotal === 0
			? currentTotal > 0
				? 100
				: 0
			: ((currentTotal - fourWeeksAgoTotal) / fourWeeksAgoTotal) * 100;

	return {
		currentTotal,
		weekOverWeekChange,
		fourWeekTrend,
	};
}
