'use server';

import { db, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import { getMemberships, getMembership } from './membership.utils';

export async function createMembershipAction(
	input: Prisma.MembershipCreateInput
): Promise<ActionState<Prisma.MembershipGetPayload<Record<string, never>>>> {
	try {
		const membership = await db.membership.create({ data: input });
		return { isSuccess: true, message: 'Membership created', data: membership };
	} catch {
		return { isSuccess: false, message: 'Failed to create membership' };
	}
}

export async function getMembershipAction(
	id: string
): Promise<
	ActionState<Prisma.MembershipGetPayload<Record<string, never>> | null>
> {
	try {
		const membership = await getMembership({
			type: 'all',
			prismaArgs: { where: { id } },
		});
		return { isSuccess: true, message: 'Membership fetched', data: membership };
	} catch {
		return { isSuccess: false, message: 'Failed to fetch membership' };
	}
}

export async function updateMembershipAction(
	id: string,
	data: Prisma.MembershipUpdateInput
): Promise<ActionState<Prisma.MembershipGetPayload<Record<string, never>>>> {
	try {
		const membership = await db.membership.update({ where: { id }, data });
		return { isSuccess: true, message: 'Membership updated', data: membership };
	} catch {
		return { isSuccess: false, message: 'Failed to update membership' };
	}
}

export async function deleteMembershipAction(
	id: string
): Promise<ActionState<null>> {
	try {
		await db.membership.delete({ where: { id } });
		return { isSuccess: true, message: 'Membership deleted', data: null };
	} catch {
		return { isSuccess: false, message: 'Failed to delete membership' };
	}
}

// Get all memberships for a user with detailed information
export async function getUserMembershipsAction(userProfileId: string): Promise<
	ActionState<
		Prisma.MembershipGetPayload<{
			include: {
				organisation: {
					select: {
						id: true;
						name: true;
					};
				};
				teamContext: {
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
				caseItem: {
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
			userProfileId: userProfileId,
			prismaArgs: {
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
}): Promise<ActionState<Prisma.MembershipGetPayload<Record<string, never>>[]>> {
	try {
		const memberships = await getMemberships({
			type: 'all',
			prismaArgs: {
				where: context,
			},
		});
		return {
			isSuccess: true,
			message: 'Memberships fetched',
			data: memberships,
		};
	} catch {
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
}): Promise<ActionState<Prisma.MembershipGetPayload<Record<string, never>>[]>> {
	try {
		const memberships = await getMemberships({
			type: 'all',
			userProfileId: member.userProfileId,
			prismaArgs: {
				where: member,
			},
		});
		return {
			isSuccess: true,
			message: 'Memberships fetched',
			data: memberships,
		};
	} catch {
		return {
			isSuccess: false,
			message: 'Failed to fetch memberships',
			data: [],
		};
	}
}

export async function getCaseMembershipsAction(caseId: string): Promise<
	ActionState<
		Prisma.MembershipGetPayload<{
			include: {
				userProfile: {
					select: {
						id: true;
						firstName: true;
						lastName: true;
						email: true;
					};
				};
			};
		}>[]
	>
> {
	try {
		const memberships = await getMemberships({
			type: 'case',
			prismaArgs: {
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
			},
		});
		return {
			isSuccess: true,
			message: 'Case memberships fetched',
			data: memberships,
		};
	} catch {
		return {
			isSuccess: false,
			message: 'Failed to fetch case memberships',
			data: [],
		};
	}
}

// Get team memberships for a user
export async function getUserTeamMembershipsAction(
	userProfileId: string
): Promise<
	ActionState<
		Prisma.MembershipGetPayload<{
			include: {
				teamContext: {
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
			};
		}>[]
	>
> {
	try {
		const memberships = await getMemberships({
			type: 'team',
			userProfileId: userProfileId,
			prismaArgs: {
				include: {
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
				},
			},
		});
		return {
			isSuccess: true,
			message: 'Team memberships fetched',
			data: memberships,
		};
	} catch {
		return {
			isSuccess: false,
			message: 'Failed to fetch team memberships',
			data: [],
		};
	}
}
