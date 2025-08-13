'use server';

import { db, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import { createInviteAction } from '@src/lib/db/membership/invite.actions';
import { sendInviteEmail } from '@src/mails/invite';
import { auth } from '@src/lib/auth/auth';
import {
	getMemberships,
	getTeamMemberships,
	getMembership,
} from '@src/lib/db/membership/membership.utils';

// Helper function to check if user has permission to manage team
async function hasTeamManagementPermission(
	userProfileId: string,
	teamId: string
): Promise<boolean> {
	const userProfile = await db.userProfile.findUnique({
		where: { id: userProfileId },
	});

	// Superadmin has full permissions
	if (userProfile?.role === 'superadmin') {
		return true;
	}

	// Check team membership for admin/owner roles
	const membership = await getMembership({
		type: 'all',
		userProfileId: userProfileId,
		prismaArgs: {
			where: { teamContextId: teamId },
		},
	});

	return membership?.role === 'owner';
}

export async function createTeamAction(input: {
	name: string;
	organisationId: string;
	members: string[];
}): Promise<ActionState<Prisma.TeamGetPayload<Record<string, never>>>> {
	const { name, organisationId, members } = input;
	const session = await auth();

	if (!session?.user?.id) {
		return { isSuccess: false, message: 'Not authenticated' };
	}

	const userId = session.user.id;

	try {
		const team = await db.$transaction(async (tx) => {
			const userProfile = await tx.userProfile.findUnique({
				where: { userId },
			});

			if (!userProfile) {
				throw new Error('UserProfile not found for the authenticated user');
			}

			const newTeam = await tx.team.create({
				data: {
					name,
					organisationId,
					ownerId: userProfile.id,
				},
			});

			// Add current user to the team using Membership model
			await tx.membership.create({
				data: {
					userProfileId: userProfile.id,
					teamContextId: newTeam.id,
					role: 'owner',
				},
			});

			// Invite other members
			for (const email of members) {
				const inviteRes = await createInviteAction({
					email,
					organisationId,
					role: 'member',
				});
				if (inviteRes.isSuccess && inviteRes.data) {
					await sendInviteEmail(
						email,
						name, // Team name as context
						'member',
						inviteRes.data.token,
						'team'
					);
				}
			}

			return newTeam;
		});

		return { isSuccess: true, message: 'Team created', data: team };
	} catch (error) {
		console.error('Error creating team:', error);
		return { isSuccess: false, message: 'Failed to create team' };
	}
}

export async function checkTeamNameAction(input: {
	name: string;
	organisationId: string;
}): Promise<ActionState<boolean>> {
	try {
		const existing = await db.team.findFirst({
			where: {
				name: { equals: input.name, mode: 'insensitive' },
				organisationId: input.organisationId,
			},
			select: { id: true },
		});
		return {
			isSuccess: true,
			message: existing ? 'Name taken' : 'Name available',
			data: !existing,
		};
	} catch (error) {
		console.error('Failed to check team name', error);
		return { isSuccess: false, message: 'Failed to check team name' };
	}
}

// Interface for team data that matches table expectations
export interface TeamData {
	id: string;
	name: string;
	teamId?: string;
	membersCount?: number;
	casesCount?: number;
	description?: string;
	ownerName?: string;
	createdAt?: string;
}

// Get teams for current user
export async function getTeamsForUserAction(): Promise<
	ActionState<TeamData[]>
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

		const memberships = await getTeamMemberships({
			userProfileId: userProfile.id,
			prismaArgs: {
				include: {
					teamContext: {
						include: {
							_count: {
								select: { teamMemberships: true, contextMemberships: true },
							},
							owner: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			},
		});

		const teamData: TeamData[] = memberships
			.map((membership) => {
				const team = membership.teamContext;
				if (!team) {
					return null;
				}
				return {
					id: membership.id,
					name: team.name,
					teamId: team.id,
					membersCount: team._count?.teamMemberships ?? 0,
					casesCount: team._count?.contextMemberships ?? 0,
					description: team.description || undefined,
					ownerName: team.owner?.firstName
						? `${team.owner.firstName} ${team.owner.lastName || ''}`.trim()
						: undefined,
					createdAt: membership.createdAt.toISOString(),
				} as TeamData;
			})
			.filter((team): team is TeamData => team !== null);

		return { isSuccess: true, message: 'Teams fetched', data: teamData };
	} catch (error) {
		console.error('Error fetching teams for user:', error);
		return { isSuccess: false, message: 'Failed to fetch teams', data: [] };
	}
}

// Get teams for a specific user
export async function getTeamsForUserByIdAction(
	userProfileId: string
): Promise<ActionState<TeamData[]>> {
	try {
		const memberships = await getTeamMemberships({
			userProfileId: userProfileId,
			prismaArgs: {
				include: {
					teamContext: {
						include: {
							_count: {
								select: { teamMemberships: true, contextMemberships: true },
							},
							owner: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			},
		});

		const teamData: TeamData[] = memberships
			.map((membership) => {
				const team = membership.teamContext;
				if (!team) {
					return null;
				}
				return {
					id: membership.id,
					name: team.name,
					teamId: team.id,
					membersCount: team._count?.teamMemberships ?? 0,
					casesCount: team._count?.contextMemberships ?? 0,
					description: team.description || undefined,
					ownerName: team.owner?.firstName
						? `${team.owner.firstName} ${team.owner.lastName || ''}`.trim()
						: undefined,
					createdAt: membership.createdAt.toISOString(),
				} as TeamData;
			})
			.filter((team): team is TeamData => team !== null);

		return { isSuccess: true, message: 'Teams fetched', data: teamData };
	} catch (error) {
		console.error('Error fetching teams for user:', error);
		return { isSuccess: false, message: 'Failed to fetch teams', data: [] };
	}
}

// Get teams where user is owner
export async function getTeamsWhereUserIsOwnerAction(): Promise<
	ActionState<TeamData[]>
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

		const memberships = await getMemberships({
			type: 'team',
			userProfileId: userProfile.id,
			prismaArgs: {
				where: {
					role: 'owner',
				},
				include: {
					teamContext: {
						include: {
							_count: {
								select: { teamMemberships: true, contextMemberships: true },
							},
							owner: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			},
		});

		const teamData: TeamData[] = memberships
			.map((membership) => {
				const team = membership.teamContext!;
				return {
					id: membership.id,
					name: team.name,
					teamId: team.id,
					membersCount: team._count?.teamMemberships ?? 0,
					casesCount: team._count?.contextMemberships ?? 0,
					description: team.description || undefined,
					ownerName: team.owner?.firstName
						? `${team.owner.firstName} ${team.owner.lastName || ''}`.trim()
						: undefined,
					createdAt: membership.createdAt.toISOString(),
				} as TeamData;
			})
			.filter((team): team is TeamData => team !== null);

		return { isSuccess: true, message: 'Teams fetched', data: teamData };
	} catch (error) {
		console.error('Error fetching teams for user:', error);
		return { isSuccess: false, message: 'Failed to fetch teams', data: [] };
	}
}

export async function getTeamDetailsAction(teamId: string): Promise<
	ActionState<Prisma.TeamGetPayload<{
		include: {
			contextMemberships: {
				include: {
					userProfile: true;
				};
			};
			organisation: true;
			owner: true;
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

		const team = await db.team.findFirst({
			where: {
				id: teamId,
				contextMemberships: {
					some: {
						userProfileId: userProfile.id,
					},
				},
			},
			include: {
				contextMemberships: {
					include: {
						userProfile: true,
					},
				},
				organisation: true,
				owner: true,
			},
		});
		return { isSuccess: true, message: 'Team details fetched', data: team };
	} catch (error) {
		console.error('Error fetching team details:', error);
		return { isSuccess: false, message: 'Failed to fetch team details' };
	}
}

export async function getTeamDetailsPublicAction(teamId: string): Promise<
	ActionState<Prisma.TeamGetPayload<{
		include: {
			contextMemberships: {
				include: {
					userProfile: true;
				};
			};
			organisation: true;
			owner: true;
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

		const team = await db.team.findFirst({
			where: {
				id: teamId,
			},
			include: {
				contextMemberships: {
					include: {
						userProfile: true,
					},
				},
				organisation: true,
				owner: true,
			},
		});
		return { isSuccess: true, message: 'Team details fetched', data: team };
	} catch (error) {
		console.error('Error fetching team details:', error);
		return { isSuccess: false, message: 'Failed to fetch team details' };
	}
}

// Remove a user from a team (leave team)
export async function leaveTeamAction(
	teamId: string,
	userProfileId: string
): Promise<ActionState<null>> {
	try {
		await db.membership.deleteMany({
			where: {
				teamContextId: teamId,
				userProfileId: userProfileId,
			},
		});
		return { isSuccess: true, message: 'Left team successfully', data: null };
	} catch (error) {
		console.error('Error leaving team:', error);
		return { isSuccess: false, message: 'Failed to leave team' };
	}
}

// Get all team memberships for a user
export async function getUserTeamMembershipsAction(
	userProfileId: string
): Promise<
	ActionState<
		Prisma.MembershipGetPayload<{
			include: {
				teamContext: {
					include: {
						organisation: true;
					};
				};
				team: {
					include: {
						organisation: true;
					};
				};
			};
		}>[]
	>
> {
	try {
		const memberships = await getMemberships({
			type: 'all',
			userProfileId: userProfileId,
			prismaArgs: {
				where: {
					OR: [{ teamContextId: { not: null } }, { teamId: { not: null } }],
				},
				include: {
					teamContext: {
						include: {
							organisation: true,
						},
					},
					team: {
						include: {
							organisation: true,
						},
					},
				},
			},
		});

		return {
			isSuccess: true,
			message: 'Team memberships retrieved',
			data: memberships,
		};
	} catch (error) {
		console.error('Error getting user team memberships:', error);
		return { isSuccess: false, message: 'Failed to get team memberships' };
	}
}

export async function getAllTeamsAction(): Promise<
	ActionState<
		Prisma.TeamGetPayload<{
			include: {
				organisation: true;
				_count: { select: { teamMemberships: true; contextMemberships: true } };
				contextMemberships: {
					include: {
						userProfile: {
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
		}>[]
	>
> {
	try {
		const teams = await db.team.findMany({
			include: {
				organisation: true,
				_count: { select: { teamMemberships: true, contextMemberships: true } },
				contextMemberships: {
					include: {
						userProfile: {
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
			orderBy: {
				createdAt: 'desc',
			},
		});

		return { isSuccess: true, message: 'All teams retrieved', data: teams };
	} catch (error) {
		console.error('Error getting all teams:', error);
		return { isSuccess: false, message: 'Failed to get all teams' };
	}
}

export async function updateTeamStateAction(
	id: string,
	state: 'active' | 'inactive'
): Promise<ActionState<Prisma.TeamGetPayload<Record<string, never>>>> {
	try {
		const team = await db.team.update({
			where: { id },
			data: { state },
		});
		return { isSuccess: true, message: 'Team state updated', data: team };
	} catch {
		return { isSuccess: false, message: 'Failed to update team state' };
	}
}

// Remove a team member (admin/owner only)
export async function removeTeamMemberAction(
	teamId: string,
	membershipId: string
): Promise<ActionState<null>> {
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

		// Check if the current user has permission to manage the team
		const hasPermission = await hasTeamManagementPermission(
			userProfile.id,
			teamId
		);
		if (!hasPermission) {
			return { isSuccess: false, message: 'Insufficient permissions' };
		}

		// Get the membership to be removed
		const membershipToRemove = await db.membership.findUnique({
			where: { id: membershipId },
		});

		if (!membershipToRemove || membershipToRemove.teamContextId !== teamId) {
			return { isSuccess: false, message: 'Membership not found' };
		}

		// Prevent removing the team owner
		const team = await db.team.findUnique({
			where: { id: teamId },
		});

		if (team?.ownerId === membershipToRemove.userProfileId) {
			return { isSuccess: false, message: 'Cannot remove team owner' };
		}

		// Remove the membership
		await db.membership.delete({
			where: { id: membershipId },
		});

		return {
			isSuccess: true,
			message: 'Team member removed successfully',
			data: null,
		};
	} catch (error) {
		console.error('Error removing team member:', error);
		return { isSuccess: false, message: 'Failed to remove team member' };
	}
}

// Change team member role (admin/owner only)
export async function changeTeamMemberRoleAction(
	teamId: string,
	membershipId: string,
	newRole: 'admin' | 'member'
): Promise<ActionState<null>> {
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

		// Check if the current user has permission to manage the team
		const hasPermission = await hasTeamManagementPermission(
			userProfile.id,
			teamId
		);
		if (!hasPermission) {
			return { isSuccess: false, message: 'Insufficient permissions' };
		}

		// Get the membership to be updated
		const membershipToUpdate = await db.membership.findUnique({
			where: { id: membershipId },
		});

		if (!membershipToUpdate || membershipToUpdate.teamContextId !== teamId) {
			return { isSuccess: false, message: 'Membership not found' };
		}

		// Prevent changing the team owner's role
		const team = await db.team.findUnique({
			where: { id: teamId },
		});

		if (team?.ownerId === membershipToUpdate.userProfileId) {
			return { isSuccess: false, message: 'Cannot change team owner role' };
		}

		// Update the membership role
		await db.membership.update({
			where: { id: membershipId },
			data: { role: newRole },
		});

		return {
			isSuccess: true,
			message: 'Team member role updated successfully',
			data: null,
		};
	} catch (error) {
		console.error('Error changing team member role:', error);
		return { isSuccess: false, message: 'Failed to change team member role' };
	}
}

export async function updateTeamAction(
	teamId: string,
	data: { name?: string; description?: string }
): Promise<ActionState<Prisma.TeamGetPayload<Record<string, never>>>> {
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

		// Check if the current user has permission to manage the team
		const hasPermission = await hasTeamManagementPermission(
			userProfile.id,
			teamId
		);
		if (!hasPermission) {
			return { isSuccess: false, message: 'Insufficient permissions' };
		}

		// Update the team
		const updatedTeam = await db.team.update({
			where: { id: teamId },
			data,
		});

		return {
			isSuccess: true,
			message: 'Team updated successfully',
			data: updatedTeam,
		};
	} catch (error) {
		console.error('Error updating team:', error);
		return { isSuccess: false, message: 'Failed to update team' };
	}
}
