import { PrismaClient } from '@prisma/client';

// Event types as constants for type safety
export const METRIC_EVENTS = {
	USER_PROFILE: {
		CREATED: 'user_profile_created',
		DELETED: 'user_profile_deleted',
	},
	ORGANIZATION: {
		CREATED: 'organization_created',
		DELETED: 'organization_deleted',
	},
	TEAM: {
		CREATED: 'team_created',
		DELETED: 'team_deleted',
	},
	INVITE: {
		CREATED: 'invite_created',
		EXPIRED: 'invite_expired',
		ACCEPTED: 'invite_accepted',
		DELETED: 'invite_deleted',
	},
	CASE: {
		CREATED: 'case_created',
		DELETED: 'case_deleted',
	},
} as const;

// Event queue for batching
let eventQueue: Array<{
	type: string;
	entityId?: string;
	metadata?: Record<string, unknown>;
}> = [];

let batchTimeout: NodeJS.Timeout | null = null;
const BATCH_DELAY = 1000; // 1 second

// Generic function to track any metric event
export async function trackMetricEvent(
	type: string,
	entityId?: string,
	metadata?: Record<string, unknown>
) {
	eventQueue.push({ type, entityId, metadata });

	// Schedule batch processing if not already scheduled
	if (!batchTimeout) {
		batchTimeout = setTimeout(async () => {
			await processEventBatch();
		}, BATCH_DELAY);
	}
}

// Process batched events
async function processEventBatch() {
	if (eventQueue.length === 0) return;

	const events = [...eventQueue];
	eventQueue = [];
	batchTimeout = null;

	try {
		// Use a separate Prisma client for metrics to avoid circular dependencies
		const metricsDb = new PrismaClient();

		await metricsDb.metricEvent.createMany({
			data: events.map((event) => ({
				type: event.type,
				entityId: event.entityId,
				metadata: event.metadata || {},
			})),
		});

		await metricsDb.$disconnect();
	} catch (error) {
		console.error('Failed to process metric events batch:', error);
	}
}

// Force process any remaining events (useful for cleanup)
export async function flushEventQueue() {
	if (batchTimeout) {
		clearTimeout(batchTimeout);
		batchTimeout = null;
	}
	await processEventBatch();
}

// Create and configure Prisma client with metrics middleware
export function createPrismaClientWithMetrics(): PrismaClient {
	const client = new PrismaClient();

	// Add middleware for automatic metric tracking
	client.$use(async (params, next) => {
		const result = await next(params);

		try {
			// Track events based on operation type and model
			if (!params.model) return result;

			switch (params.model) {
				case 'UserProfile':
					if (params.action === 'create') {
						const userProfile = result as { id: string };
						await trackMetricEvent(
							METRIC_EVENTS.USER_PROFILE.CREATED,
							userProfile.id
						);
					} else if (params.action === 'delete') {
						const where = params.args.where as { id?: string };
						await trackMetricEvent(
							METRIC_EVENTS.USER_PROFILE.DELETED,
							where?.id
						);
					}
					break;

				case 'Organisation':
					if (params.action === 'create') {
						const org = result as { id: string };
						await trackMetricEvent(METRIC_EVENTS.ORGANIZATION.CREATED, org.id);
					} else if (params.action === 'delete') {
						const where = params.args.where as { id?: string };
						await trackMetricEvent(
							METRIC_EVENTS.ORGANIZATION.DELETED,
							where?.id
						);
					}
					break;

				case 'Team':
					if (params.action === 'create') {
						const team = result as { id: string; organisationId: string };
						await trackMetricEvent(METRIC_EVENTS.TEAM.CREATED, team.id, {
							organisationId: team.organisationId,
						});
					} else if (params.action === 'delete') {
						const where = params.args.where as { id?: string };
						await trackMetricEvent(METRIC_EVENTS.TEAM.DELETED, where?.id);
					}
					break;

				case 'Invite':
					if (params.action === 'create') {
						const invite = result as {
							id: string;
							organisationId?: string;
							teamId?: string;
						};
						await trackMetricEvent(METRIC_EVENTS.INVITE.CREATED, invite.id, {
							organisationId: invite.organisationId,
							teamId: invite.teamId,
						});
					} else if (params.action === 'update') {
						const data = params.args.data as { status?: string };
						const invite = result as {
							id: string;
							organisationId?: string;
							teamId?: string;
						};

						// Check if status changed
						if (data?.status) {
							if (data.status === 'expired') {
								await trackMetricEvent(
									METRIC_EVENTS.INVITE.EXPIRED,
									invite.id,
									{
										organisationId: invite.organisationId,
										teamId: invite.teamId,
									}
								);
							} else if (data.status === 'accepted') {
								await trackMetricEvent(
									METRIC_EVENTS.INVITE.ACCEPTED,
									invite.id,
									{
										organisationId: invite.organisationId,
										teamId: invite.teamId,
									}
								);
							} else if (data.status === 'cancelled') {
								await trackMetricEvent(
									METRIC_EVENTS.INVITE.DELETED,
									invite.id,
									{
										organisationId: invite.organisationId,
										teamId: invite.teamId,
									}
								);
							}
						}
					}
					break;

				case 'Case':
					if (params.action === 'create') {
						const caseItem = result as {
							id: string;
							teamId: string;
							clientId: string;
						};
						await trackMetricEvent(METRIC_EVENTS.CASE.CREATED, caseItem.id, {
							teamId: caseItem.teamId,
							clientId: caseItem.clientId,
						});
					} else if (params.action === 'delete') {
						const where = params.args.where as { id?: string };
						await trackMetricEvent(METRIC_EVENTS.CASE.DELETED, where?.id);
					}
					break;
			}
		} catch (error) {
			// Log error but don't fail the operation
			console.error('Failed to track metric event:', error);
		}

		return result;
	});

	return client;
}
