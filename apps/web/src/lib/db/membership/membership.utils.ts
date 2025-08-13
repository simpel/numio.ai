import { db, Prisma } from '@numio/ai-database';
import { getUserProfileId } from '../user-profile/user-profile.actions';

// Simple membership types
export type MembershipType =
	| 'organisation'
	| 'team'
	| 'case'
	| 'client'
	| 'all';

type MembershipParams = {
	type: MembershipType;
	userProfileId?: string;
	prismaArgs?: Prisma.MembershipFindManyArgs;
};

// Simple unified membership function
export async function getMemberships<
	T = Prisma.MembershipGetPayload<Record<string, never>>,
>({ type, userProfileId, prismaArgs }: MembershipParams): Promise<T[]> {
	try {
		// Get user profile ID if not provided
		let targetUserProfileId = userProfileId;
		if (!targetUserProfileId) {
			const profileId = await getUserProfileId();
			if (!profileId) {
				return [];
			}
			targetUserProfileId = profileId;
		}

		// Build where clause based on type
		const where: Prisma.MembershipWhereInput = {
			userProfileId: targetUserProfileId,
		};

		// Add type-specific filtering
		switch (type) {
			case 'organisation':
				where.organisationId = { not: null };
				break;
			case 'team':
				where.teamContextId = { not: null };
				break;
			case 'case':
				where.caseId = { not: null };
				break;
			case 'client':
				where.clientId = { not: null };
				break;
			case 'all':
			default:
				// No additional filtering for 'all'
				break;
		}

		// Merge with provided Prisma arguments
		const args: Prisma.MembershipFindManyArgs = {
			...prismaArgs,
			where: {
				...prismaArgs?.where,
				...where,
			},
		};

		return (await db.membership.findMany(args)) as T[];
	} catch (error) {
		console.error('Error fetching memberships:', error);
		return [];
	}
}

// Singular membership function for finding single memberships
export async function getMembership<
	T = Prisma.MembershipGetPayload<Record<string, never>>,
>({ type, userProfileId, prismaArgs }: MembershipParams): Promise<T | null> {
	try {
		// Convert FindFirstArgs to FindManyArgs with take: 1
		const findManyArgs: Prisma.MembershipFindManyArgs = {
			...prismaArgs,
			take: 1,
		};

		// Use the existing getMemberships function
		const memberships = await getMemberships<T>({
			type,
			userProfileId,
			prismaArgs: findManyArgs,
		});

		// Return the first item or null
		return memberships[0] || null;
	} catch (error) {
		console.error('Error fetching membership:', error);
		return null;
	}
}

// Convenience functions for common use cases
export async function getOrganisationMemberships<
	T = Prisma.MembershipGetPayload<Record<string, never>>,
>(params?: {
	userProfileId?: string;
	prismaArgs?: Prisma.MembershipFindManyArgs;
}): Promise<T[]> {
	return getMemberships<T>({ type: 'organisation', ...params });
}

export async function getTeamMemberships<
	T = Prisma.MembershipGetPayload<Record<string, never>>,
>(params?: {
	userProfileId?: string;
	prismaArgs?: Prisma.MembershipFindManyArgs;
}): Promise<T[]> {
	return getMemberships<T>({ type: 'team', ...params });
}

export async function getCaseMemberships<
	T = Prisma.MembershipGetPayload<Record<string, never>>,
>(params?: {
	userProfileId?: string;
	prismaArgs?: Prisma.MembershipFindManyArgs;
}): Promise<T[]> {
	return getMemberships<T>({ type: 'case', ...params });
}

export async function getClientMemberships<
	T = Prisma.MembershipGetPayload<Record<string, never>>,
>(params?: {
	userProfileId?: string;
	prismaArgs?: Prisma.MembershipFindManyArgs;
}): Promise<T[]> {
	return getMemberships<T>({ type: 'client', ...params });
}

// Singular convenience functions
export async function getOrganisationMembership<
	T = Prisma.MembershipGetPayload<Record<string, never>>,
>(params?: {
	userProfileId?: string;
	prismaArgs?: Prisma.MembershipFindFirstArgs;
}): Promise<T | null> {
	return getMembership<T>({ type: 'organisation', ...params });
}

export async function getTeamMembership<
	T = Prisma.MembershipGetPayload<Record<string, never>>,
>(params?: {
	userProfileId?: string;
	prismaArgs?: Prisma.MembershipFindFirstArgs;
}): Promise<T | null> {
	return getMembership<T>({ type: 'team', ...params });
}

export async function getCaseMembership<
	T = Prisma.MembershipGetPayload<Record<string, never>>,
>(params?: {
	userProfileId?: string;
	prismaArgs?: Prisma.MembershipFindFirstArgs;
}): Promise<T | null> {
	return getMembership<T>({ type: 'case', ...params });
}

export async function getClientMembership<
	T = Prisma.MembershipGetPayload<Record<string, never>>,
>(params?: {
	userProfileId?: string;
	prismaArgs?: Prisma.MembershipFindFirstArgs;
}): Promise<T | null> {
	return getMembership<T>({ type: 'client', ...params });
}

// Legacy interface for backward compatibility
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

// Specific transformers for different entity types (kept for backward compatibility)
export function transformOrganizationMemberships(
	memberships: Prisma.MembershipGetPayload<{
		include: {
			organisation: {
				include: {
					_count: { select: { teams: true; memberships: true } };
					owner: true;
				};
			};
		};
	}>[]
): OrganisationData[] {
	return memberships.map((membership) => {
		const org = membership.organisation!;
		return {
			id: membership.id,
			name: org.name,
			organisationId: org.id,
			teamsCount: org._count?.teams ?? 0,
			usersCount: org._count?.memberships ?? 0,
			ownerName: org.owner?.firstName
				? `${org.owner.firstName} ${org.owner.lastName || ''}`.trim()
				: undefined,
			createdAt: membership.createdAt.toISOString(),
		};
	});
}

export function transformTeamMemberships(
	memberships: Prisma.MembershipGetPayload<{
		include: {
			teamContext: {
				include: {
					_count: {
						select: { teamMemberships: true; contextMemberships: true };
					};
					owner: true;
				};
			};
		};
	}>[]
) {
	return memberships.map((membership) => {
		const team = membership.teamContext!;
		return {
			id: membership.id,
			entityId: team.id,
			entityName: team.name,
			memberSince: new Date(membership.createdAt).toLocaleDateString(),
			role: membership.role,
			entity: team,
			membersCount: team._count?.teamMemberships ?? 0,
			casesCount: team._count?.contextMemberships ?? 0,
		};
	});
}

export function transformCaseMemberships(
	memberships: Prisma.MembershipGetPayload<{
		include: {
			caseItem: {
				include: {
					_count: { select: { memberships: true } };
					team: { include: { owner: true } };
				};
			};
		};
	}>[]
) {
	return memberships.map((membership) => {
		const caseItem = membership.caseItem!;
		return {
			id: membership.id,
			entityId: caseItem.id,
			entityName: caseItem.title,
			memberSince: new Date(membership.createdAt).toLocaleDateString(),
			role: membership.role,
			entity: caseItem,
			membersCount: caseItem._count?.memberships ?? 0,
		};
	});
}
