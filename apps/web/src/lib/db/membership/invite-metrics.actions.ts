'use server';

import { db } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

interface InviteMetricsData {
	date: string;
	created: number;
	deleted?: number;
}

export async function getInviteMetricsAction(
	days: number = 30
): Promise<ActionState<InviteMetricsData[]>> {
	try {
		// Get the latest event date to use as end date instead of current date
		const latestEvent = await db.metricEvent.findFirst({
			where: { type: 'invite_created' },
			orderBy: { timestamp: 'desc' },
		});

		const endDate = latestEvent
			? endOfDay(latestEvent.timestamp)
			: endOfDay(new Date());
		const startDate = startOfDay(subDays(endDate, days));

		console.log('Fetching invite metrics from', startDate, 'to', endDate);

		// Get all invite events in the date range
		const events = await db.metricEvent.findMany({
			where: {
				type: {
					in: ['invite_created', 'invite_expired', 'invite_deleted'],
				},
				timestamp: {
					gte: startDate,
					lte: endDate,
				},
			},
			orderBy: {
				timestamp: 'asc',
			},
		});

		console.log('Found', events.length, 'invite events');

		// Initialize data structure for each day
		const dailyData: Record<string, { created: number; deleted: number }> = {};

		// Initialize all days in range
		for (let i = 0; i <= days; i++) {
			const date = subDays(endDate, days - i);
			const dateKey = format(date, 'yyyy-MM-dd');
			dailyData[dateKey] = { created: 0, deleted: 0 };
		}

		// Count created and deleted invites per day
		events.forEach((event) => {
			const dateKey = format(event.timestamp, 'yyyy-MM-dd');
			if (dailyData[dateKey]) {
				if (event.type === 'invite_created') {
					dailyData[dateKey].created += 1;
				} else if (event.type === 'invite_deleted') {
					dailyData[dateKey].deleted += 1;
				}
			}
		});

		// Convert to array format for chart
		const chartData: InviteMetricsData[] = Object.keys(dailyData)
			.sort()
			.map((dateKey) => {
				const dayData = dailyData[dateKey];
				return {
					date: dateKey,
					created: dayData?.created || 0,
					deleted: dayData?.deleted || 0,
				};
			});

		console.log('Chart data:', chartData.slice(0, 5), '...');

		return {
			isSuccess: true,
			message: 'Invite metrics fetched successfully',
			data: chartData,
		};
	} catch (error) {
		console.error('Error fetching invite metrics:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch invite metrics',
			data: [],
		};
	}
}
