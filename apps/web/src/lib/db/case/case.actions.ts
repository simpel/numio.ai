'use server';

import { db, Prisma, Case } from '@numio/ai-database';
import { ActionState } from '@src/types/global';

export async function createCaseAction(
	input: Prisma.CaseCreateInput
): Promise<ActionState<Case>> {
	try {
		const caseItem = await db.case.create({ data: input });
		return { isSuccess: true, message: 'Case created', data: caseItem };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to create case' };
	}
}

export async function getCaseAction(
	id: string
): Promise<ActionState<Case | null>> {
	try {
		const caseItem = await db.case.findUnique({ where: { id } });
		return { isSuccess: true, message: 'Case fetched', data: caseItem };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to fetch case' };
	}
}

export async function getCaseDetailsAction(
	id: string
): Promise<ActionState<any>> {
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
		return { isSuccess: false, message: 'Failed to fetch case details' };
	}
}

export async function updateCaseAction(
	id: string,
	data: Prisma.CaseUpdateInput
): Promise<ActionState<Case>> {
	try {
		const caseItem = await db.case.update({ where: { id }, data });
		return { isSuccess: true, message: 'Case updated', data: caseItem };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to update case' };
	}
}

export async function updateCaseStateAction(
	id: string,
	state: string
): Promise<ActionState<Case>> {
	try {
		const caseItem = await db.case.update({
			where: { id },
			data: { state },
		});
		return { isSuccess: true, message: 'Case state updated', data: caseItem };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to update case state' };
	}
}

export async function deleteCaseAction(id: string): Promise<ActionState<null>> {
	try {
		await db.case.delete({ where: { id } });
		return { isSuccess: true, message: 'Case deleted', data: null };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to delete case' };
	}
}

export async function getCasesByTeamAction(
	teamId: string
): Promise<ActionState<any[]>> {
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
		return { isSuccess: false, message: 'Failed to fetch cases', data: [] };
	}
}

export async function getCasesForUserAction(
	userProfileId: string
): Promise<ActionState<any[]>> {
	try {
		const cases = await db.case.findMany({
			where: {
				memberships: {
					some: {
						userProfileId: userProfileId,
					},
				},
			},
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
			orderBy: { createdAt: 'desc' },
		});
		return { isSuccess: true, message: 'Cases fetched', data: cases };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to fetch cases', data: [] };
	}
}
