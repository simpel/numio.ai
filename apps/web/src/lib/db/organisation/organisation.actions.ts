'use server';

import { db } from '@numio/ai-database';
import { Organisation, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import { sendOrganisationRoleEmail } from '@src/mails/organisation';
import { auth } from '@src/lib/auth/auth';

export async function createOrganisationAction(input: {
	name: string;
}): Promise<ActionState<Organisation>> {
	const { name } = input;
	const session = await auth();

	if (!session?.user?.id) {
		return { isSuccess: false, message: 'Not authenticated' };
	}

	const userId = session.user.id;

	try {
		const organisation = await db.$transaction(async (tx) => {
			const userProfile = await tx.userProfile.findUnique({
				where: { userId },
			});

			if (!userProfile) {
				throw new Error('UserProfile not found for the authenticated user');
			}

			const newOrganisation = await tx.organisation.create({
				data: {
					name,
					owner: {
						connect: { id: userProfile.id },
					},
				},
			});

			await tx.membership.create({
				data: {
					userProfileId: userProfile.id,
					organisationId: newOrganisation.id,
					role: 'owner',
				},
			});

			if (userProfile.email) {
				await sendOrganisationRoleEmail(
					userProfile.email,
					newOrganisation.name,
					'owner',
					userProfile.firstName || undefined
				);
			}

			return newOrganisation;
		});

		return {
			isSuccess: true,
			message: 'Organisation created',
			data: organisation,
		};
	} catch (error) {
		console.error('Error creating organisation', error);
		return { isSuccess: false, message: 'Failed to create organisation' };
	}
}

export async function getOrganisationsForUserAction(): Promise<
	ActionState<
		Prisma.MembershipGetPayload<{ include: { organisation: true } }>[]
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

		const memberships = await db.membership.findMany({
			where: { userProfileId: userProfile.id },
			include: {
				organisation: true,
			},
		});

		return {
			isSuccess: true,
			message: 'Organisations fetched',
			data: memberships,
		};
	} catch (error) {
		console.error('Error fetching organisations:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch organisations',
			data: [],
		};
	}
}

export async function getOrganisationAction(
	id: string
): Promise<ActionState<Organisation | null>> {
	try {
		const organisation = await db.organisation.findUnique({ where: { id } });
		return {
			isSuccess: true,
			message: 'Organisation fetched',
			data: organisation,
		};
	} catch (error) {
		return { isSuccess: false, message: 'Failed to fetch organisation' };
	}
}

export async function getOrganisationWithDetailsAction(id: string): Promise<
	ActionState<Prisma.OrganisationGetPayload<{
		include: {
			owner: true;
			teams: {
				include: {
					owner: true;
				};
			};
			memberships: {
				include: {
					userProfile: true;
				};
			};
		};
	}> | null>
> {
	try {
		const organisation = await db.organisation.findUnique({
			where: { id },
			include: {
				owner: true,
				teams: {
					include: {
						owner: true,
					},
				},
				memberships: {
					include: {
						userProfile: true,
					},
				},
			},
		});

		return {
			isSuccess: true,
			message: 'Organisation with details fetched',
			data: organisation,
		};
	} catch (error) {
		console.error('Error fetching organisation with details:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch organisation details',
		};
	}
}

export async function updateOrganisationAction(
	id: string,
	data: Prisma.OrganisationUpdateInput
): Promise<ActionState<Organisation>> {
	try {
		const organisation = await db.organisation.update({ where: { id }, data });
		return {
			isSuccess: true,
			message: 'Organisation updated',
			data: organisation,
		};
	} catch (error) {
		return { isSuccess: false, message: 'Failed to update organisation' };
	}
}

export async function deleteOrganisationAction(
	id: string
): Promise<ActionState<null>> {
	try {
		await db.organisation.delete({ where: { id } });
		return { isSuccess: true, message: 'Organisation deleted', data: null };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to delete organisation' };
	}
}

export async function checkOrgNameAction(
	name: string
): Promise<ActionState<boolean>> {
	console.log(`Checking organisation name: ${name}`);
	try {
		const existing = await db.organisation.findFirst({
			where: { name: { equals: name, mode: 'insensitive' } },
			select: { id: true },
		});
		console.log(
			`Organisation name '${name}' is ${existing ? 'taken' : 'available'}`
		);
		return {
			isSuccess: true,
			message: existing ? 'Name taken' : 'Name available',
			data: !existing,
		};
	} catch (error) {
		console.error('Failed to check organisation name', error);
		return { isSuccess: false, message: 'Failed to check organisation name' };
	}
}

export async function getOrgsWithAdminRightsAction(): Promise<
	ActionState<Organisation[]>
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

		const memberships = await db.membership.findMany({
			where: {
				userProfileId: userProfile.id,
				role: { in: ['owner', 'admin'] },
			},
			include: {
				organisation: true,
			},
		});

		const organisations = memberships
			.map((membership) => membership.organisation)
			.filter((org): org is Organisation => org !== null);

		return {
			isSuccess: true,
			message: 'Organisations with admin rights fetched',
			data: organisations,
		};
	} catch (error) {
		console.error('Error fetching organisations with admin rights:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch organisations with admin rights',
			data: [],
		};
	}
}

export async function getAllOrganisationsAction(): Promise<ActionState<any[]>> {
	try {
		const organisations = await db.organisation.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		});

		return {
			isSuccess: true,
			message: 'All organisations retrieved',
			data: organisations,
		};
	} catch (error) {
		console.error('Error getting all organisations:', error);
		return { isSuccess: false, message: 'Failed to get all organisations' };
	}
}
