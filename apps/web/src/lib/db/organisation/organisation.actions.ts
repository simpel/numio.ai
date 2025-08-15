'use server';

import { db, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import { sendOrganisationRoleEmail } from '@src/mails/organisation';
import { auth } from '@src/lib/auth/auth';

// Interface for organisation data that matches table expectations
export interface OrganisationData {
	id: string;
	name: string;
	organisationId?: string;
	teamsCount?: number;
	usersCount?: number;
	activeCasesCount?: number;
	description?: string;
	ownerName?: string;
	createdAt?: string;
}

export async function createOrganisationAction(input: {
	name: string;
}): Promise<ActionState<Prisma.OrganisationGetPayload<Record<string, never>>>> {
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
				},
			});

			await tx.membership.create({
				data: {
					memberUserProfileId: userProfile.id,
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
	ActionState<OrganisationData[]>
> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { isSuccess: false, message: 'Not authenticated', data: [] };
		}

		const userProfile = await db.userProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!userProfile) {
			return { isSuccess: false, message: 'User profile not found', data: [] };
		}

		const memberships = await db.membership.findMany({
			where: {
				memberUserProfileId: userProfile.id,
				organisationId: { not: null },
			},
			include: {
				organisation: {
					include: {
						 
						_count: { select: { teams: true, members: true } },
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		const organisationData: OrganisationData[] = memberships.map(
			(membership) => {
				const org = membership.organisation!;
				return {
					id: membership.id,
					name: org.name,
					organisationId: org.id,
					teamsCount: org._count?.teams ?? 0,
					usersCount: org._count?.members ?? 0,
					ownerName: undefined, // No owner field in new schema
					createdAt: membership.createdAt.toISOString(),
				};
			}
		);

		return {
			isSuccess: true,
			message: 'Organisations fetched',
			data: organisationData,
		};
	} catch (error) {
		console.error('Error fetching organisations for user:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch organisations',
			data: [],
		};
	}
}

export async function getOrganisationAction(
	id: string
): Promise<
	ActionState<Prisma.OrganisationGetPayload<Record<string, never>> | null>
> {
	try {
		const organisation = await db.organisation.findUnique({ where: { id } });
		return {
			isSuccess: true,
			message: 'Organisation fetched',
			data: organisation,
		};
	} catch {
		return { isSuccess: false, message: 'Failed to fetch organisation' };
	}
}

export async function getOrganisationWithDetailsAction(id: string): Promise<
	ActionState<Prisma.OrganisationGetPayload<{
		include: {
			teams: {
				include: {
					 
					_count: {
						select: { memberships: true; members: true };
					};
					members: {
						include: {
							memberUserProfile: {
								select: {
									id: true;
									firstName: true;
									lastName: true;
									image: true;
								};
							};
						};
					};
				};
			};
			members: {
				include: {
					memberUserProfile: true;
				};
			};
		};
	}> | null>
> {
	try {
		const organisation = await db.organisation.findUnique({
			where: { id },
			include: {
				teams: {
					include: {
						 
						_count: {
							select: { memberships: true, members: true },
						},
						members: {
							include: {
								memberUserProfile: {
									select: {
										id: true,
										firstName: true,
										lastName: true,
										image: true,
									},
								},
							},
						},
					},
				},
				members: {
					include: {
						memberUserProfile: true,
					},
				},
			},
		});

		return {
			isSuccess: true,
			message: 'Organisation with details fetched',
			data: organisation,
		};
	} catch {
		return {
			isSuccess: false,
			message: 'Failed to fetch organisation details',
		};
	}
}

export async function updateOrganisationAction(
	id: string,
	data: Prisma.OrganisationUpdateInput
): Promise<ActionState<Prisma.OrganisationGetPayload<Record<string, never>>>> {
	try {
		const organisation = await db.organisation.update({ where: { id }, data });
		return {
			isSuccess: true,
			message: 'Organisation updated',
			data: organisation,
		};
	} catch {
		return { isSuccess: false, message: 'Failed to update organisation' };
	}
}

export async function deleteOrganisationAction(
	id: string
): Promise<ActionState<null>> {
	try {
		await db.organisation.delete({ where: { id } });
		return { isSuccess: true, message: 'Organisation deleted', data: null };
	} catch {
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
	ActionState<Prisma.OrganisationGetPayload<Record<string, never>>[]>
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
				memberUserProfileId: userProfile.id,
				organisationId: { not: null },
				role: { in: ['owner', 'member'] },
			},
			include: {
				organisation: true,
			},
		});

		const organisations = memberships
			.map((membership) => membership.organisation)
			.filter(
				(org): org is Prisma.OrganisationGetPayload<Record<string, never>> =>
					org !== null
			);

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

export async function getAllOrganisationsAction(): Promise<
	ActionState<
		(Prisma.OrganisationGetPayload<{
			include: {
				 
				_count: {
					select: { teams: true; members: true };
				};
			};
		}> & {
			owner?: {
				id: string;
				firstName: string | null;
				lastName: string | null;
				email: string | null;
			};
		})[]
	>
> {
	try {
		const organisations = await db.organisation.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				 
				_count: {
					select: { teams: true, members: true },
				},
			},
		});

		// Get owner information for each organisation
		const organisationsWithOwners = await Promise.all(
			organisations.map(async (org) => {
				const ownerMembership = await db.membership.findFirst({
					where: {
						organisationId: org.id,
						role: 'owner',
					},
					include: {
						memberUserProfile: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
								email: true,
							},
						},
					},
				});

				return {
					...org,
					owner: ownerMembership?.memberUserProfile || undefined,
				};
			})
		);

		return {
			isSuccess: true,
			message: 'All organisations retrieved',
			data: organisationsWithOwners,
		};
	} catch (error) {
		console.error('Error getting all organisations:', error);
		return { isSuccess: false, message: 'Failed to get all organisations' };
	}
}
