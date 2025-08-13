import { ActionState } from '@/types/global';
import { auth } from '@/lib/auth/auth';
import { db } from '@numio/ai-database';
import { getMembership } from './membership.utils';

// Generic hook for fetching user memberships with proper error handling
export async function useUserMemberships<T>(
	fetchFunction: () => Promise<ActionState<T[]>>
): Promise<{
	data: T[] | undefined;
	message: string;
	isSuccess: boolean;
	isLoading: boolean;
}> {
	const session = await auth();

	if (!session?.user?.id) {
		return {
			data: undefined,
			message: 'Not authenticated',
			isSuccess: false,
			isLoading: false,
		};
	}

	try {
		const result = await fetchFunction();
		return {
			data: result.data,
			message: result.message,
			isSuccess: result.isSuccess,
			isLoading: false,
		};
	} catch (error) {
		console.error('Error fetching memberships:', error);
		return {
			data: undefined,
			message: 'Failed to fetch data',
			isSuccess: false,
			isLoading: false,
		};
	}
}

// Generic function to check if user has access to an entity
export async function checkUserAccess(
	entityType: 'organisation' | 'team' | 'case',
	entityId: string
): Promise<boolean> {
	const session = await auth();
	if (!session?.user?.id) return false;

	try {
		const userProfile = await db.userProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!userProfile) return false;

		switch (entityType) {
			case 'organisation': {
				const orgMembership = await getMembership({
					type: 'all',
					userProfileId: userProfile.id,
					prismaArgs: {
						where: { organisationId: entityId },
					},
				});
				return !!orgMembership;
			}

			case 'team': {
				const teamMembership = await getMembership({
					type: 'all',
					userProfileId: userProfile.id,
					prismaArgs: {
						where: { teamId: entityId },
					},
				});
				return !!teamMembership;
			}

			case 'case': {
				const caseMembership = await getMembership({
					type: 'all',
					userProfileId: userProfile.id,
					prismaArgs: {
						where: { caseId: entityId },
					},
				});
				return !!caseMembership;
			}

			default:
				return false;
		}
	} catch (error) {
		console.error('Error checking user access:', error);
		return false;
	}
}

// Generic function to get user's role for an entity
export async function getUserRole(
	entityType: 'organisation' | 'team' | 'case',
	entityId: string
): Promise<string | null> {
	const session = await auth();
	if (!session?.user?.id) return null;

	try {
		const userProfile = await db.userProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!userProfile) return null;

		switch (entityType) {
			case 'organisation': {
				const orgMembership = await getMembership({
					type: 'all',
					userProfileId: userProfile.id,
					prismaArgs: {
						where: { organisationId: entityId },
					},
				});
				return orgMembership?.role || null;
			}

			case 'team': {
				const teamMembership = await getMembership({
					type: 'all',
					userProfileId: userProfile.id,
					prismaArgs: {
						where: { teamId: entityId },
					},
				});
				return teamMembership?.role || null;
			}

			case 'case': {
				const caseMembership = await getMembership({
					type: 'all',
					userProfileId: userProfile.id,
					prismaArgs: {
						where: { caseId: entityId },
					},
				});
				return caseMembership?.role || null;
			}

			default:
				return null;
		}
	} catch (error) {
		console.error('Error getting user role:', error);
		return null;
	}
}
