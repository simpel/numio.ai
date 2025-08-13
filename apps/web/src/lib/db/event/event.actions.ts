'use server';

import { db, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';

export async function createEventAction(
	input: Prisma.EventCreateInput
): Promise<ActionState<Prisma.EventGetPayload<Record<string, never>>>> {
	try {
		const event = await db.event.create({ data: input });
		return { isSuccess: true, message: 'Event created', data: event };
	} catch (error) {
		console.error('Error creating event:', error);
		return { isSuccess: false, message: 'Failed to create event' };
	}
}

export async function getEventAction(
	id: string
): Promise<ActionState<Prisma.EventGetPayload<Record<string, never>> | null>> {
	try {
		const event = await db.event.findUnique({ where: { id } });
		return { isSuccess: true, message: 'Event fetched', data: event };
	} catch (error) {
		console.error('Error fetching event:', error);
		return { isSuccess: false, message: 'Failed to fetch event' };
	}
}

export async function updateEventAction(
	id: string,
	data: Prisma.EventUpdateInput
): Promise<ActionState<Prisma.EventGetPayload<Record<string, never>>>> {
	try {
		const event = await db.event.update({ where: { id }, data });
		return { isSuccess: true, message: 'Event updated', data: event };
	} catch (error) {
		console.error('Error updating event:', error);
		return { isSuccess: false, message: 'Failed to update event' };
	}
}

export async function deleteEventAction(
	id: string
): Promise<ActionState<null>> {
	try {
		await db.event.delete({ where: { id } });
		return { isSuccess: true, message: 'Event deleted', data: null };
	} catch (error) {
		console.error('Error deleting event:', error);
		return { isSuccess: false, message: 'Failed to delete event' };
	}
}

export async function getEventsByCaseAction(caseId: string): Promise<
	ActionState<
		Prisma.EventGetPayload<{
			include: {
				actor: true;
			};
		}>[]
	>
> {
	try {
		const events = await db.event.findMany({
			where: { caseId },
			orderBy: { occurredAt: 'desc' },
			include: {
				actor: true,
			},
		});
		return { isSuccess: true, message: 'Events fetched', data: events };
	} catch (error) {
		console.error('Error fetching events by case:', error);
		return { isSuccess: false, message: 'Failed to fetch events', data: [] };
	}
}
