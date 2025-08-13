'use client';

import { Card } from '@shadcn/ui/card';
import {
	Area,
	ResponsiveContainer,
	Tooltip,
	ComposedChart,
	ReferenceLine,
	XAxis,
	YAxis,
} from 'recharts';
import {
	format,
	parseISO,
	subDays,
	subMonths,
	eachDayOfInterval,
	eachYearOfInterval,
} from 'date-fns';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@shadcn/ui/dropdown-menu';
import { Button } from '@shadcn/ui/button';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface MetricsData {
	date: string | number;
	dateLabel: string;
	total?: number;
	created: number;
	deleted?: number;
	runningTotal?: number;
	netChange?: number;
}

type Timeframe = '7d' | '30d' | '6m' | 'all';

interface MetricsChartProps {
	data: MetricsData[];
	title?: string;
	entityType?: 'teams' | 'organizations' | 'users' | 'invites';
	onTimeframeChange?: (timeframe: Timeframe) => void;
	selectedTimeframe?: Timeframe;
}

export default function MetricsChart({
	data,
	entityType = 'teams',
	onTimeframeChange,
	selectedTimeframe,
}: MetricsChartProps) {
	const [timeframe, setTimeframe] = useState<string>(
		selectedTimeframe || '30d'
	);

	// Get the date range for the selected timeframe
	const getDateRange = (timeframe: string) => {
		const now = new Date();
		let startDate: Date;

		switch (timeframe) {
			case '7d':
				startDate = subDays(now, 7);
				break;
			case '30d':
				startDate = subDays(now, 30);
				break;
			case '6m':
				startDate = subMonths(now, 6);
				break;
			case 'all': {
						// For all time, use the earliest data point or 1 year ago
		const earliestDate =
			data.length > 0 ? parseISO(String(data[0]!.date)) : subDays(now, 365);
				startDate = earliestDate;
				break;
			}
			default:
				startDate = subDays(now, 30);
		}

		return { startDate, endDate: now };
	};

	// Generate grid lines based on timeframe
	const generateGridLines = (timeframe: string) => {
		const { startDate, endDate } = getDateRange(timeframe);

		switch (timeframe) {
			case '7d':
			case '30d':
				return eachDayOfInterval({ start: startDate, end: endDate });
			case '6m': {
				// Always generate exactly 6 lines for 6 months
				const lines = [];
				for (let i = 0; i <= 6; i++) {
					const date = new Date(startDate);
					date.setMonth(date.getMonth() + i);
					// Ensure we don't exceed the end date
					if (date <= endDate) {
						lines.push(date);
					}
				}
				return lines;
			}
			case 'all':
				return eachYearOfInterval({ start: startDate, end: endDate });
			default:
				return eachDayOfInterval({ start: startDate, end: endDate });
		}
	};

	// Filter and prepare chart data
	const prepareChartData = () => {
		const { startDate, endDate } = getDateRange(timeframe);

		// Filter data to the selected timeframe
		const filteredData = data.filter((item) => {
			const itemDate = parseISO(String(item.date));
			return itemDate >= startDate && itemDate <= endDate;
		});

		// Sort data by date to ensure proper progression
		const sortedData = filteredData		.sort(
			(a, b) => parseISO(String(a.date)).getTime() - parseISO(String(b.date)).getTime()
		);

		// Calculate the baseline total (total before any changes in this timeframe)
		// We need to work backwards from the first data point
		let baselineTotal = 0;
		if (sortedData.length > 0) {
			// Start from the first data point and subtract all changes to get the baseline
			const firstItem = sortedData[0]!;
			baselineTotal =
				(firstItem.total || 0) - (firstItem.created - (firstItem.deleted || 0));
		}

		// Calculate running total based on created/deleted values, starting from baseline
		let runningTotal = baselineTotal;
		const transformedData = sortedData.map((item) => {
			const netChange = item.created - (item.deleted || 0);
			runningTotal += netChange;

			return {
				...item,
						date: parseISO(String(item.date)).getTime(), // Use timestamp for x-axis
		dateLabel: format(parseISO(String(item.date)), 'MMM d'),
				netChange,
				runningTotal, // This will be used for the chart line
			};
		});

		// Ensure we have data points at the start and end of the timeframe
		const result = [...transformedData];

		// Add start point if no data exists at the start of the timeframe
		const hasStartPoint = transformedData.some((item) => {
			const itemDate = new Date(item.date);
			return itemDate.getTime() === startDate.getTime();
		});

		if (!hasStartPoint && transformedData.length > 0) {
			// Use the baseline total for the artificial start point
			result.unshift({
				...transformedData[0]!,
				date: startDate.getTime(),
				dateLabel: format(startDate, 'MMM d'),
				netChange: 0,
				created: 0,
				deleted: 0,
				runningTotal: baselineTotal,
			});
		}

		// Add end point if no data exists at the end of the timeframe
		const hasEndPoint = transformedData.some((item) => {
			const itemDate = new Date(item.date);
			return itemDate.getTime() === endDate.getTime();
		});

		if (!hasEndPoint && transformedData.length > 0) {
			const lastDataPoint = transformedData[transformedData.length - 1]!;
			result.push({
				...lastDataPoint,
				date: endDate.getTime(),
				dateLabel: format(endDate, 'MMM d'),
				netChange: 0,
				created: 0,
				deleted: 0,
				runningTotal: lastDataPoint.runningTotal,
			});
		}

		return result;
	};

	const chartData = prepareChartData();
	const gridLines = generateGridLines(timeframe);

	// Calculate normalized domain for Y-axis
	const calculateYDomain = () => {
		if (chartData.length === 0) return [0, 10];

		const values = chartData.map((item) =>
			entityType === 'invites' ? item.created : item.runningTotal || 0
		);

		const minValue = Math.min(...values);
		const maxValue = Math.max(...values);

		// If all values are the same, create a range around that value
		if (minValue === maxValue) {
			const centerValue = minValue;
			const range = Math.max(centerValue * 0.2, 1); // 20% of the value or at least 1
			return [centerValue - range, centerValue + range];
		}

		// If values are different, add some padding to the range
		const range = maxValue - minValue;
		const padding = range * 0.1; // 10% padding
		return [Math.max(0, minValue - padding), maxValue + padding];
	};

	// Calculate trend for color
	const calculateTrend = (data: MetricsData[]) => {
		if (data.length < 2) return { isPositive: true };

		const firstValue =
			entityType === 'invites'
				? data[0]?.created || 0
				: data[0]?.runningTotal || 0;
		const lastValue =
			entityType === 'invites'
				? data[data.length - 1]?.created || 0
				: data[data.length - 1]?.runningTotal || 0;

		return { isPositive: lastValue >= firstValue };
	};

	const trend = calculateTrend(chartData);
	const chartColor = trend.isPositive
		? 'hsl(var(--success))'
		: 'hsl(var(--destructive))';

	const yDomain = calculateYDomain();

	return (
		<Card className="relative p-0">
			{/* Timeframe Selector */}
			<div className="absolute right-2 top-2 z-10">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="h-7 text-xs">
							{timeframe === '7d' && '7 days'}
							{timeframe === '30d' && '30 days'}
							{timeframe === '6m' && '6 months'}
							{timeframe === 'all' && 'All time'}
							<ChevronDown className="ml-1 h-3 w-3 opacity-50" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-40">
						<DropdownMenuLabel>Timeframe</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuRadioGroup
							value={timeframe}
							onValueChange={(value) => {
								setTimeframe(value);
								onTimeframeChange?.(value as Timeframe);
							}}
						>
							<DropdownMenuRadioItem value="7d">
								Past 7 days
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="30d">
								Past 30 days
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="6m">
								Past 6 months
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="all">
								All time
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<ResponsiveContainer width="100%" height={200}>
				<ComposedChart
					data={chartData}
					margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
				>
					<XAxis
						dataKey="date"
						type="number"
						domain={['dataMin', 'dataMax']}
						hide={true}
					/>

					<YAxis domain={yDomain} hide={true} />

					{/* Grid lines for time progression */}
					{gridLines.map((date, index) => (
						<ReferenceLine
							key={index}
							x={date.getTime()}
							stroke="hsl(var(--muted-foreground))"
							strokeDasharray="3 3"
							strokeWidth={1}
							strokeOpacity={0.3}
						/>
					))}

					<Tooltip
						content={({ active, payload }) => {
							if (active && payload && payload.length) {
								const dateLabel = payload[0]?.payload?.dateLabel;
								const runningTotal = payload[0]?.value as number;
								const created = payload[0]?.payload?.created as number;
								const deleted = payload[0]?.payload?.deleted as number;

								let tooltipText = '';
								if (entityType === 'invites') {
									tooltipText = `${created} invites created`;
								} else {
									tooltipText = `${runningTotal} ${entityType}`;
									// Only show creation/deletion info if there were actual changes
									if (created > 0 || (deleted && deleted > 0)) {
										if (created > 0 && (!deleted || deleted === 0)) {
											tooltipText = `${runningTotal} ${entityType} (${created} created)`;
										} else if (deleted && deleted > 0 && created === 0) {
											tooltipText = `${runningTotal} ${entityType} (${deleted} deleted)`;
										} else {
											tooltipText = `${runningTotal} ${entityType} (${created} created, ${deleted || 0} deleted)`;
										}
									}
								}

								return (
									<div className="bg-background rounded-lg border p-2 shadow-lg">
										<p className="text-sm font-medium">{dateLabel}</p>
										<p className="text-muted-foreground text-xs">
											{tooltipText}
										</p>
									</div>
								);
							}
							return null;
						}}
					/>

					<defs>
						<linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
							<stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
						</linearGradient>
					</defs>

					<Area
						type="monotone"
						dataKey={entityType === 'invites' ? 'created' : 'runningTotal'}
						stroke={chartColor}
						fill="url(#fillTotal)"
						fillOpacity={1}
						strokeWidth={2}
						dot={{ fill: 'white', stroke: chartColor, strokeWidth: 2, r: 3 }}
						activeDot={{
							fill: 'white',
							stroke: chartColor,
							strokeWidth: 2,
							r: 4,
						}}
						isAnimationActive={false}
					/>
				</ComposedChart>
			</ResponsiveContainer>
		</Card>
	);
}
