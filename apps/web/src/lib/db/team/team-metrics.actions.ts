'use server';

import { ActionState } from '@/types/global';
import { db } from '@numio/ai-database';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export async function getTeamMetricsAction(
	days: number = 30
): Promise<
	ActionState<
		Array<{ date: string; total: number; created: number; deleted: number }>
	>
> {
	try {
		// Get the latest event date to use as end date instead of current date
		const latestEvent = await db.metricEvent.findFirst({
			where: { type: 'team_created' },
			orderBy: { timestamp: 'desc' },
		});

		const endDate = latestEvent ? latestEvent.timestamp : new Date();
		const startDate = subDays(endDate, days - 1);

		// Get all team events within the date range
		const createdEvents = await db.metricEvent.findMany({
			where: {
				type: 'team_created',
				timestamp: {
					gte: startOfDay(startDate),
					lte: endOfDay(endDate),
				},
			},
			orderBy: {
				timestamp: 'asc',
			},
		});

		const deletedEvents = await db.metricEvent.findMany({
			where: {
				type: 'team_deleted',
				timestamp: {
					gte: startOfDay(startDate),
					lte: endOfDay(endDate),
				},
			},
			orderBy: {
				timestamp: 'asc',
			},
		});

		// Group events by date and count
		const dailyData: {
			[key: string]: { total: number; created: number; deleted: number };
		} = {};

		// Count created teams per day
		createdEvents.forEach((event) => {
			const dateKey = event.timestamp.toISOString().split('T')[0];
			if (dateKey && !dailyData[dateKey]) {
				dailyData[dateKey] = { total: 0, created: 0, deleted: 0 };
			}
			if (dateKey && dailyData[dateKey]) {
				dailyData[dateKey]!.created += 1;
			}
		});

		// Count deleted teams per day
		deletedEvents.forEach((event) => {
			const dateKey = event.timestamp.toISOString().split('T')[0];
			if (dateKey && !dailyData[dateKey]) {
				dailyData[dateKey] = { total: 0, created: 0, deleted: 0 };
			}
			if (dateKey && dailyData[dateKey]) {
				dailyData[dateKey]!.deleted += 1;
			}
		});

		// Calculate cumulative totals
		let runningTotal = 0;
		const sortedDates = Object.keys(dailyData).sort();

		sortedDates.forEach((dateKey) => {
			const dayData = dailyData[dateKey];
			if (dayData) {
				runningTotal += dayData.created - dayData.deleted;
				dayData.total = runningTotal;
			}
		});

		// Convert to array format - only include days with activity
		const result = sortedDates.map((dateKey) => {
			const dayData = dailyData[dateKey];
			if (!dayData) {
				return {
					date: dateKey,
					total: 0,
					created: 0,
					deleted: 0,
				};
			}
			return {
				date: dateKey,
				total: dayData.total,
				created: dayData.created,
				deleted: dayData.deleted,
			};
		});

		return {
			isSuccess: true,
			message: 'Team metrics fetched successfully',
			data: result,
		};
	} catch (error) {
		console.error('Error fetching team metrics:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch team metrics',
		};
	}
}
