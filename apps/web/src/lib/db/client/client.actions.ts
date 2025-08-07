'use server';

import { db } from '@numio/ai-database';
import { Client } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import { auth } from '@src/lib/auth/auth';

export async function createClientAction(input: {
	name: string;
	orgNumber: string;
	description?: string;
	organisationId: string;
}): Promise<ActionState<Client>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { isSuccess: false, message: 'Not authenticated' };
	}

	try {
		const client = await db.client.create({
			data: input,
		});
		return { isSuccess: true, message: 'Client created', data: client };
	} catch (error) {
		console.error('Error creating client:', error);
		return { isSuccess: false, message: 'Failed to create client' };
	}
}

export async function getClientsForUserAction(): Promise<ActionState<any[]>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { isSuccess: false, message: 'Not authenticated', data: [] };
	}

	try {
		const userProfile = await db.userProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!userProfile) {
			return { isSuccess: false, message: 'User profile not found', data: [] };
		}

		// TODO: Uncomment after Prisma client is regenerated
		// const clientMemberships = await db.membership.findMany({
		// 	where: {
		// 		userProfileId: userProfile.id,
		// 		clientId: { not: null }
		// 	},
		// 	include: {
		// 		client: {
		// 			include: {
		// 				organisation: true,
		// 			},
		// 		},
		// 	},
		// });
		// return { isSuccess: true, message: 'Clients fetched', data: clientMemberships };

		// Temporary: return empty array until Prisma client is regenerated
		return { isSuccess: true, message: 'Clients fetched', data: [] };
	} catch (error) {
		console.error('Error fetching clients:', error);
		return { isSuccess: false, message: 'Failed to fetch clients', data: [] };
	}
}

export async function getClientDetailsAction(
	clientId: string
): Promise<ActionState<Client | null>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { isSuccess: false, message: 'Not authenticated' };
	}

	try {
		const userProfile = await db.userProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!userProfile) {
			return { isSuccess: false, message: 'User profile not found' };
		}

		// TODO: Update after Prisma client is regenerated
		const client = await db.client.findFirst({
			where: {
				id: clientId,
				// memberships: {
				// 	some: {
				// 		userProfileId: userProfile.id,
				// 	},
				// },
			},
			include: {
				// memberships: {
				// 	include: {
				// 		userProfile: true,
				// 	},
				// },
				organisation: true,
				cases: {
					include: {
						team: true,
					},
				},
			},
		});
		return { isSuccess: true, message: 'Client details fetched', data: client };
	} catch (error) {
		console.error('Error fetching client details:', error);
		return { isSuccess: false, message: 'Failed to fetch client details' };
	}
}

// Get all client memberships for a user
export async function getUserClientMembershipsAction(
	userProfileId: string
): Promise<ActionState<any[]>> {
	try {
		// TODO: Uncomment after Prisma client is regenerated
		// const clientMemberships = await db.membership.findMany({
		// 	where: {
		// 		userProfileId: userProfileId,
		// 		clientId: { not: null }
		// 	},
		// 	include: {
		// 		client: {
		// 			include: {
		// 				organisation: {
		// 					select: {
		// 						id: true,
		// 						name: true,
		// 					},
		// 				},
		// 			},
		// 		},
		// 	},
		// 	orderBy: { client: { createdAt: 'desc' } },
		// });

		// // Transform the data to match the expected format
		// const transformedClientMemberships = clientMemberships.map(
		// 	(membership: any) => ({
		// 		id: membership.id,
		// 		role: membership.role,
		// 		createdAt: membership.createdAt.toISOString(),
		// 		client: {
		// 			id: membership.client.id,
		// 			name: membership.client.name,
		// 			organisation: membership.client.organisation,
		// 		},
		// 		type: 'clientMembership',
		// 	})
		// );

		// return {
		// 	isSuccess: true,
		// 	message: 'User client memberships fetched',
		// 	data: transformedClientMemberships,
		// };

		// Temporary: return empty array until Prisma client is regenerated
		return {
			isSuccess: true,
			message: 'User client memberships fetched',
			data: [],
		};
	} catch (error) {
		console.error('Error fetching user client memberships:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch user client memberships',
			data: [],
		};
	}
}
