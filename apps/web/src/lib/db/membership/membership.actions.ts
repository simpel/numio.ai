'use server';

import { db, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import { getMemberships } from './membership.utils';

// Type for membership with all relations
type MembershipWithAllRelations = Prisma.MembershipGetPayload<{
	include: {
		organisation: {
			select: {
				id: true;
				name: true;
			};
		};
		team: {
			select: {
				id: true;
				name: true;
				organisation: {
					select: {
						id: true;
						name: true;
					};
				};
			};
		};
		case: {
			select: {
				id: true;
				title: true;
				team: {
					select: {
						id: true;
						name: true;
					};
				};
			};
		};
	};
}>;

// Get all memberships for a user with detailed information
export async function getUserMembershipsAction(
	memberUserProfileId: string
): Promise<
	ActionState<
		Prisma.MembershipGetPayload<{
			include: {
				organisation: {
					select: {
						id: true;
						name: true;
					};
				};
				team: {
					select: {
						id: true;
						name: true;
						organisation: {
							select: {
								id: true;
								name: true;
							};
						};
					};
				};
				case: {
					select: {
						id: true;
						title: true;
						team: {
							select: {
								id: true;
								name: true;
							};
						};
					};
				};
			};
		}>[]
	>
> {
	try {
		const memberships = await getMemberships<MembershipWithAllRelations>({
			type: 'all',
			userProfileId: memberUserProfileId,
			prismaArgs: {
				include: {
					organisation: {
						select: {
							id: true,
							name: true,
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
					case: {
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
				},
				orderBy: { createdAt: 'desc' },
			},
		});

		return {
			isSuccess: true,
			message: 'User memberships fetched',
			data: memberships,
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
		};
	} catch (error) {
		console.error('Error removing membership:', error);
		return {
			isSuccess: false,
			message: 'Failed to remove membership',
		};
	}
}

// Delete a membership
export async function deleteMembershipAction(
	membershipId: string
): Promise<ActionState<null>> {
	return removeMembershipAction(membershipId);
}

// Get memberships for a specific organisation
export async function getOrganisationMembershipsAction(
	organisationId: string
): Promise<ActionState<Prisma.MembershipGetPayload<Record<string, never>>[]>> {
	try {
		const memberships = await db.membership.findMany({
			where: { organisationId },
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
			orderBy: { createdAt: 'desc' },
		});

		return {
			isSuccess: true,
			message: 'Organisation memberships fetched',
			data: memberships,
		};
	} catch (error) {
		console.error('Error fetching organisation memberships:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch organisation memberships',
			data: [],
		};
	}
}

// Get memberships for a specific team
export async function getTeamMembershipsAction(
	teamId: string
): Promise<ActionState<Prisma.MembershipGetPayload<Record<string, never>>[]>> {
	try {
		const memberships = await db.membership.findMany({
			where: { teamId },
			include: {
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
			},
			orderBy: { createdAt: 'desc' },
		});

		return {
			isSuccess: true,
			message: 'Team memberships fetched',
			data: memberships,
		};
	} catch (error) {
		console.error('Error fetching team memberships:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch team memberships',
			data: [],
		};
	}
}

// Get memberships for a specific case
export async function getCaseMembershipsAction(caseId: string): Promise<
	ActionState<
		Prisma.MembershipGetPayload<{
			include: {
				case: {
					select: {
						id: true;
						title: true;
						team: {
							select: {
								id: true;
								name: true;
							};
						};
					};
				};
				memberUserProfile: true;
			};
		}>[]
	>
> {
	try {
		const memberships = await db.membership.findMany({
			where: { caseId },
			include: {
				case: {
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
				memberUserProfile: true,
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

// Get memberships for a specific client
export async function getClientMembershipsAction(
	clientId: string
): Promise<ActionState<Prisma.MembershipGetPayload<Record<string, never>>[]>> {
	try {
		const memberships = await db.membership.findMany({
			where: { clientId },
			include: {
				client: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		return {
			isSuccess: true,
			message: 'Client memberships fetched',
			data: memberships,
		};
	} catch (error) {
		console.error('Error fetching client memberships:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch client memberships',
			data: [],
		};
	}
}

// Create a new membership
export async function createMembershipAction(
	data: Prisma.MembershipCreateInput
): Promise<ActionState<Prisma.MembershipGetPayload<Record<string, never>>>> {
	try {
		const membership = await db.membership.create({
			data,
		});

		return {
			isSuccess: true,
			message: 'Membership created successfully',
			data: membership,
		};
	} catch (error) {
		console.error('Error creating membership:', error);
		return {
			isSuccess: false,
			message: 'Failed to create membership',
		};
	}
}

// Update a membership
export async function updateMembershipAction(
	id: string,
	data: Prisma.MembershipUpdateInput
): Promise<ActionState<Prisma.MembershipGetPayload<Record<string, never>>>> {
	try {
		const membership = await db.membership.update({
			where: { id },
			data,
		});

		return {
			isSuccess: true,
			message: 'Membership updated successfully',
			data: membership,
		};
	} catch (error) {
		console.error('Error updating membership:', error);
		return {
			isSuccess: false,
			message: 'Failed to update membership',
		};
	}
}
