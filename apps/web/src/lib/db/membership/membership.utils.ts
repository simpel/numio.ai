import { getUserProfileId } from '../user-profile/user-profile.actions';
import { db, Prisma } from '@numio/ai-database';

// Type for membership parameters
interface MembershipParams {
	type: 'organisation' | 'team' | 'case' | 'client' | 'all';
	userProfileId?: string;
	prismaArgs?: Prisma.MembershipFindManyArgs;
}

// Generic function to get memberships
export async function getMemberships<
	T = Prisma.MembershipGetPayload<Record<string, never>>,
>({ type, userProfileId, prismaArgs }: MembershipParams): Promise<T[]> {
	try {
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
			memberUserProfileId: targetUserProfileId,
		};

		// Add type-specific filtering
		switch (type) {
			case 'organisation':
				where.organisationId = { not: null };
				break;
			case 'team':
				where.teamId = { not: null };
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
