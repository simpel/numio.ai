'use server';

import { db, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import { auth } from '@src/lib/auth/auth';
import { getMemberships } from '@src/lib/db/membership/membership.utils';

export async function createClientAction(input: {
	name: string;
	orgNumber: string;
	description?: string;
	organisationId: string;
}): Promise<ActionState<Prisma.ClientGetPayload<Record<string, never>>>> {
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

export async function getClientsForUserAction(): Promise<
	ActionState<
		Prisma.MembershipGetPayload<{
			include: {
				client: {
					include: {
						organisation: true;
					};
				};
			};
		}>[]
	>
> {
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

		const clientMemberships = await getMemberships({
			type: 'client',
			userProfileId: userProfile.id,
			prismaArgs: {
				include: {
					client: true,
				},
			},
		});
		return {
			isSuccess: true,
			message: 'Clients fetched',
			data: clientMemberships,
		};
	} catch (error) {
		console.error('Error fetching clients:', error);
		return { isSuccess: false, message: 'Failed to fetch clients', data: [] };
	}
}

export async function getClientDetailsAction(clientId: string): Promise<
	ActionState<Prisma.ClientGetPayload<{
		include: {
			memberships: {
				include: {
					userProfile: true;
				};
			};
			cases: {
				include: {
					team: true;
				};
			};
		};
	}> | null>
> {
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

		const client = await db.client.findFirst({
			where: {
				id: clientId,
				memberships: {
					some: {
						userProfileId: userProfile.id,
					},
				},
			},
			include: {
				memberships: {
					include: {
						userProfile: true,
					},
				},
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
): Promise<ActionState<Prisma.MembershipGetPayload<Record<string, never>>[]>> {
	try {
		const clientMemberships = await getMemberships({
			type: 'client',
			userProfileId: userProfileId,
			prismaArgs: {
				include: {
					client: true,
				},
				orderBy: { createdAt: 'desc' },
			},
		});

		return {
			isSuccess: true,
			message: 'User client memberships fetched',
			data: clientMemberships,
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
