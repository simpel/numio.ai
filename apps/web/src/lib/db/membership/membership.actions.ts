'use server';

import { db } from '@numio/ai-database';
import type { Membership, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';

export async function createMembershipAction(
	input: Prisma.MembershipCreateInput
): Promise<ActionState<Membership>> {
	try {
		const membership = await db.membership.create({ data: input });
		return { isSuccess: true, message: 'Membership created', data: membership };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to create membership' };
	}
}

export async function getMembershipAction(
	id: string
): Promise<ActionState<Membership | null>> {
	try {
		const membership = await db.membership.findUnique({ where: { id } });
		return { isSuccess: true, message: 'Membership fetched', data: membership };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to fetch membership' };
	}
}

export async function updateMembershipAction(
	id: string,
	data: Prisma.MembershipUpdateInput
): Promise<ActionState<Membership>> {
	try {
		const membership = await db.membership.update({ where: { id }, data });
		return { isSuccess: true, message: 'Membership updated', data: membership };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to update membership' };
	}
}

export async function deleteMembershipAction(
	id: string
): Promise<ActionState<null>> {
	try {
		await db.membership.delete({ where: { id } });
		return { isSuccess: true, message: 'Membership deleted', data: null };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to delete membership' };
	}
}

// Define the type for the transformed membership data
type TransformedMembership = {
	id: string;
	role: string;
	createdAt: string;
	organisation?: {
		id: string;
		name: string;
	};
	teamContext?: {
		id: string;
		name: string;
		organisation: {
			id: string;
			name: string;
		};
	};
	team?: {
		id: string;
		name: string;
		organisation: {
			id: string;
			name: string;
		};
	};
	caseItem?: {
		id: string;
		title: string;
		team: {
			id: string;
			name: string;
		};
	};
	client?: {
		id: string;
		name: string;
		organisation: {
			id: string;
			name: string;
		};
	};
	type: 'membership';
};

// Get all memberships for a user with detailed information
export async function getUserMembershipsAction(
	userProfileId: string
): Promise<ActionState<TransformedMembership[]>> {
	try {
		const memberships = await db.membership.findMany({
			where: { userProfileId },
			include: {
				organisation: {
					select: {
						id: true,
						name: true,
					},
				},
				teamContext: {
					select: {
						id: true,
						name: true,
						organisation: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				team: {
					select: {
						id: true,
						name: true,
						organisation: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				caseItem: {
					select: {
						id: true,
						title: true,
						team: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				// TODO: Uncomment after Prisma client is regenerated
				// client: {
				// 	select: {
				// 		id: true,
				// 		name: true,
				// 		organisation: {
				// 			select: {
				// 				id: true,
				// 				name: true,
				// 			},
				// 		},
				// 	},
				// },
			},
			orderBy: { createdAt: 'desc' },
		});

		// Transform the data to match the expected format and handle null values
		const transformedMemberships: TransformedMembership[] = memberships.map(
			(membership: any) => ({
				id: membership.id,
				role: membership.role,
				createdAt: membership.createdAt.toISOString(),
				organisation: membership.organisation || undefined,
				teamContext: membership.teamContext || undefined,
				team: membership.team || undefined,
				caseItem: membership.caseItem || undefined,
				// client: membership.client || undefined, // TODO: Uncomment after Prisma client is regenerated
				type: 'membership' as const,
			})
		);

		return {
			isSuccess: true,
			message: 'User memberships fetched',
			data: transformedMemberships,
		};
	} catch (error) {
		console.error('Error fetching user memberships:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch user memberships',
			data: [],
		};
	}
}

// Remove a membership (alias for deleteMembershipAction)
export async function removeMembershipAction(
	membershipId: string
): Promise<ActionState<null>> {
	try {
		await db.membership.delete({
			where: { id: membershipId },
		});

		return {
			isSuccess: true,
			message: 'Membership removed successfully',
			data: null,
		};
	} catch (error) {
		console.error('Error removing membership:', error);
		return {
			isSuccess: false,
			message: 'Failed to remove membership',
			data: null,
		};
	}
}

// List all memberships for a given context (org, team, case, or client)
export async function listMembershipsForContext(context: {
	organisationId?: string;
	teamContextId?: string;
	caseId?: string;
	clientId?: string;
}): Promise<ActionState<Membership[]>> {
	try {
		const memberships = await db.membership.findMany({
			where: context,
		});
		return {
			isSuccess: true,
			message: 'Memberships fetched',
			data: memberships,
		};
	} catch (error) {
		return {
			isSuccess: false,
			message: 'Failed to fetch memberships',
			data: [],
		};
	}
}

// List all memberships for a user or team
export async function listMembershipsForUserOrTeam(member: {
	userProfileId?: string;
	teamId?: string;
}): Promise<ActionState<Membership[]>> {
	try {
		const memberships = await db.membership.findMany({
			where: member,
		});
		return {
			isSuccess: true,
			message: 'Memberships fetched',
			data: memberships,
		};
	} catch (error) {
		return {
			isSuccess: false,
			message: 'Failed to fetch memberships',
			data: [],
		};
	}
}

export async function getCaseMembershipsAction(
	caseId: string
): Promise<ActionState<any[]>> {
	try {
		const memberships = await db.membership.findMany({
			where: { caseId },
			include: {
				userProfile: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		return {
			isSuccess: true,
			message: 'Case memberships fetched',
			data: memberships,
		};
	} catch (error) {
		console.error('Error fetching case memberships:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch case memberships',
			data: [],
		};
	}
}
