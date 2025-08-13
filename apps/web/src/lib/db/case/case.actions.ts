'use server';

import { db, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import { auth } from '@src/lib/auth/auth';
import { getMemberships } from '@src/lib/db/membership/membership.utils';

// Interface for case data that matches table expectations
export interface CaseData {
	id: string;
	title: string;
	description?: string;
	client?: string;
	clientId?: string;
	team?: string;
	teamId?: string;
	organisation?: string;
	organisationId?: string;
	status?: string;
	state?: string;
	createdAt: string;
	updatedAt?: string;
}

export async function createCaseAction(
	input: Prisma.CaseCreateInput
): Promise<ActionState<Prisma.CaseGetPayload<Record<string, never>>>> {
	try {
		const caseItem = await db.case.create({ data: input });
		return { isSuccess: true, message: 'Case created', data: caseItem };
	} catch (error) {
		console.error('Error creating case:', error);
		return { isSuccess: false, message: 'Failed to create case' };
	}
}

export async function getCaseAction(
	id: string
): Promise<ActionState<Prisma.CaseGetPayload<Record<string, never>> | null>> {
	try {
		const caseItem = await db.case.findUnique({ where: { id } });
		return { isSuccess: true, message: 'Case fetched', data: caseItem };
	} catch (error) {
		console.error('Error fetching case:', error);
		return { isSuccess: false, message: 'Failed to fetch case' };
	}
}

export async function getCaseDetailsAction(id: string): Promise<
	ActionState<Prisma.CaseGetPayload<{
		include: {
			team: {
				include: {
					organisation: {
						select: {
							id: true;
							name: true;
						};
					};
				};
			};
			client: {
				select: {
					id: true;
					name: true;
				};
			};
		};
	}> | null>
> {
	try {
		const caseItem = await db.case.findUnique({
			where: { id },
			include: {
				team: {
					include: {
						organisation: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				client: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
		return { isSuccess: true, message: 'Case details fetched', data: caseItem };
	} catch (error) {
		console.error('Error fetching case details:', error);
		return { isSuccess: false, message: 'Failed to fetch case details' };
	}
}

export async function updateCaseAction(
	id: string,
	data: Prisma.CaseUpdateInput
): Promise<ActionState<Prisma.CaseGetPayload<Record<string, never>>>> {
	try {
		const caseItem = await db.case.update({ where: { id }, data });
		return { isSuccess: true, message: 'Case updated', data: caseItem };
	} catch (error) {
		console.error('Error updating case:', error);
		return { isSuccess: false, message: 'Failed to update case' };
	}
}

export async function updateCaseStateAction(
	id: string,
	state: 'created' | 'active' | 'on_hold' | 'completed' | 'closed'
): Promise<ActionState<Prisma.CaseGetPayload<Record<string, never>>>> {
	try {
		const caseItem = await db.case.update({
			where: { id },
			data: { state },
		});
		return { isSuccess: true, message: 'Case state updated', data: caseItem };
	} catch (error) {
		console.error('Error updating case state:', error);
		return { isSuccess: false, message: 'Failed to update case state' };
	}
}

export async function deleteCaseAction(id: string): Promise<ActionState<null>> {
	try {
		await db.case.delete({ where: { id } });
		return { isSuccess: true, message: 'Case deleted', data: null };
	} catch (error) {
		console.error('Error deleting case:', error);
		return { isSuccess: false, message: 'Failed to delete case' };
	}
}

export async function getCasesByTeamAction(teamId: string): Promise<
	ActionState<
		Prisma.CaseGetPayload<{
			include: {
				client: {
					select: {
						id: true;
						name: true;
					};
				};
			};
		}>[]
	>
> {
	try {
		// First check if the team exists
		const team = await db.team.findUnique({
			where: { id: teamId },
		});

		if (!team) {
			return { isSuccess: false, message: 'Team not found', data: [] };
		}

		const cases = await db.case.findMany({
			where: { teamId },
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

		return { isSuccess: true, message: 'Cases fetched', data: cases };
	} catch (error) {
		console.error('Error fetching cases by team:', error);
		return { isSuccess: false, message: 'Failed to fetch cases', data: [] };
	}
}

// Get cases for current user
export async function getCasesForUserAction(): Promise<
	ActionState<CaseData[]>
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

		const memberships = await getMemberships<
			Prisma.MembershipGetPayload<{
				include: {
					case: {
						include: {
							client: {
								select: { id: true; name: true };
							};
							team: {
								include: {
									organisation: {
										select: { id: true; name: true };
									};
								};
								select: { id: true; name: true };
							};
						};
					};
				};
			}>
		>({
			type: 'case',
			userProfileId: userProfile.id,
			prismaArgs: {
				include: {
					case: {
						include: {
							client: {
								select: {
									id: true,
									name: true,
								},
							},
							team: {
								include: {
									organisation: {
										select: {
											id: true,
											name: true,
										},
									},
								},
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

		const caseData: CaseData[] = memberships.map((membership) => {
			const caseItem = membership.case!;
			return {
				id: caseItem.id,
				title: caseItem.title,
				description: caseItem.description || undefined,
				client: caseItem.client?.name,
				clientId: caseItem.client?.id,
				team: caseItem.team?.name,
				teamId: caseItem.team?.id,
				organisation: caseItem.team?.organisation?.name,
				organisationId: caseItem.team?.organisation?.id,
				status: caseItem.state,
				state: caseItem.state,
				createdAt: caseItem.createdAt.toISOString(),
				updatedAt: caseItem.updatedAt.toISOString(),
			};
		});

		return { isSuccess: true, message: 'Cases fetched', data: caseData };
	} catch (error) {
		console.error('Error fetching cases for user:', error);
		return { isSuccess: false, message: 'Failed to fetch cases', data: [] };
	}
}

// Get cases for a specific user
export async function getCasesForUserByIdAction(
	userProfileId: string
): Promise<ActionState<CaseData[]>> {
	try {
		const memberships = await getMemberships<
			Prisma.MembershipGetPayload<{
				include: {
					case: {
						include: {
							client: {
								select: { id: true; name: true };
							};
							team: {
								include: {
									organisation: {
										select: { id: true; name: true };
									};
								};
								select: { id: true; name: true };
							};
						};
					};
				};
			}>
		>({
			type: 'case',
			userProfileId: userProfileId,
			prismaArgs: {
				include: {
					case: {
						include: {
							client: {
								select: {
									id: true,
									name: true,
								},
							},
							team: {
								include: {
									organisation: {
										select: {
											id: true,
											name: true,
										},
									},
								},
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

		const caseData: CaseData[] = memberships.map((membership) => {
			const caseItem = membership.case!;
			return {
				id: caseItem.id,
				title: caseItem.title,
				description: caseItem.description || undefined,
				client: caseItem.client?.name,
				clientId: caseItem.client?.id,
				team: caseItem.team?.name,
				teamId: caseItem.team?.id,
				organisation: caseItem.team?.organisation?.name,
				organisationId: caseItem.team?.organisation?.id,
				status: caseItem.state,
				state: caseItem.state,
				createdAt: caseItem.createdAt.toISOString(),
				updatedAt: caseItem.updatedAt.toISOString(),
			};
		});

		return { isSuccess: true, message: 'Cases fetched', data: caseData };
	} catch (error) {
		console.error('Error fetching cases for user:', error);
		return { isSuccess: false, message: 'Failed to fetch cases', data: [] };
	}
}

// Get case creation data for a user
export async function getCaseCreationDataAction(): Promise<
	ActionState<{
		organisations: Array<{ id: string; name: string }>;
		teams: Array<{
			id: string;
			name: string;
			organisationId: string;
			organisation: { name: string };
		}>;
		clients: Array<{
			id: string;
			name: string;
			organisationIds: string[];
		}>;
	}>
> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { isSuccess: false, message: 'Not authenticated' };
		}

		const userProfile = await db.userProfile.findUnique({
			where: { userId: session.user.id },
			select: { id: true },
		});
		if (!userProfile) {
			return { isSuccess: false, message: 'User profile not found' };
		}

		// Get organisation memberships with organisation data
		const orgMemberships = await getMemberships<
			Prisma.MembershipGetPayload<{
				include: {
					organisation: {
						select: { id: true; name: true };
					};
				};
			}>
		>({
			type: 'organisation',
			userProfileId: userProfile.id,
			prismaArgs: {
				include: {
					organisation: {
						select: { id: true, name: true },
					},
				},
			},
		});

		// Extract organisations
		const organisations = orgMemberships
			.map((m) => m.organisation)
			.filter((o): o is { id: string; name: string } => !!o);
		const organisationIds = Array.from(new Set(organisations.map((o) => o.id)));

		// Get teams for all user's organisations
		const teams = await db.team.findMany({
			where: { organisationId: { in: organisationIds } },
			select: {
				id: true,
				name: true,
				organisationId: true,
				organisation: { select: { name: true } },
			},
			orderBy: { name: 'asc' },
		});

		// Get clients that belong to the user's organisations via membership links
		const rawClients = await db.client.findMany({
			where: {
				members: { some: { organisationId: { in: organisationIds } } },
			},
			select: {
				id: true,
				name: true,
				members: {
					where: { organisationId: { in: organisationIds } },
					select: { organisationId: true },
				},
			},
			orderBy: { name: 'asc' },
		});

		const clients = rawClients.map((c) => ({
			id: c.id,
			name: c.name,
			organisationIds: c.members
				.map((m) => m.organisationId)
				.filter((id): id is string => !!id),
		}));

		return {
			isSuccess: true,
			message: 'Case creation data fetched',
			data: { organisations, teams, clients },
		};
	} catch (error) {
		console.error('Error fetching case creation data:', error);
		return { isSuccess: false, message: 'Failed to fetch case creation data' };
	}
}

// Get initial organisation ID based on context parameters
export async function getInitialOrganisationIdAction(params: {
	organisationId?: string;
	teamId?: string;
	clientId?: string;
}): Promise<ActionState<string | undefined>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { isSuccess: false, message: 'Not authenticated' };
		}

		const userProfile = await db.userProfile.findUnique({
			where: { userId: session.user.id },
			select: { id: true },
		});
		if (!userProfile) {
			return { isSuccess: false, message: 'User profile not found' };
		}

		const { organisationId, teamId, clientId } = params;

		// If organisationId is provided directly, use it
		if (organisationId) {
			return {
				isSuccess: true,
				message: 'Organisation ID provided',
				data: organisationId,
			};
		}

		// Get user's organisation IDs
		const orgMemberships = await getMemberships({
			type: 'organisation',
			userProfileId: userProfile.id,
			prismaArgs: {
				select: { organisationId: true },
			},
		});
		const userOrgIds = orgMemberships
			.map((m) => m.organisationId)
			.filter((id): id is string => !!id);

		// If teamId is provided, get its organisation
		if (teamId) {
			const team = await db.team.findUnique({
				where: { id: teamId },
				select: { organisationId: true },
			});
			if (team?.organisationId && userOrgIds.includes(team.organisationId)) {
				return {
					isSuccess: true,
					message: 'Organisation ID from team',
					data: team.organisationId,
				};
			}
		}

		// If clientId is provided, find intersection with user's organisations
		if (clientId) {
			const clientOrgLinks = await db.membership.findMany({
				where: { clientId, organisationId: { not: null } },
				select: { organisationId: true },
			});
			const clientOrgIds = clientOrgLinks
				.map((l) => l.organisationId)
				.filter((id): id is string => !!id);
			const intersection = clientOrgIds.filter((id) => userOrgIds.includes(id));
			if (intersection.length === 1) {
				return {
					isSuccess: true,
					message: 'Organisation ID from client',
					data: intersection[0],
				};
			}
		}

		// If user has only one organisation, use it
		if (userOrgIds.length === 1) {
			return {
				isSuccess: true,
				message: 'Single organisation',
				data: userOrgIds[0],
			};
		}

		return {
			isSuccess: true,
			message: 'No initial organisation',
			data: undefined,
		};
	} catch (error) {
		console.error('Error getting initial organisation ID:', error);
		return {
			isSuccess: false,
			message: 'Failed to get initial organisation ID',
		};
	}
}
