'use server';

import { db, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import {
	UserProfileSearchData,
	UserProfileWithRelations,
} from './user-profile.types';
import { auth } from '@src/lib/auth/auth';
import { getMemberships } from '@src/lib/db/membership/membership.utils';

export async function searchUserProfilesAction(
	query: string
): Promise<ActionState<UserProfileSearchData[]>> {
	console.log('query', query);

	try {
		const results = await db.userProfile.findMany({
			where: {
				 
				OR: [
					{ firstName: { contains: query, mode: 'insensitive' } },
					{ lastName: { contains: query, mode: 'insensitive' } },
					{ email: { contains: query, mode: 'insensitive' } },
				],
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
			},
			take: 10,
		});

		console.log('results', results);

		// Map nulls to undefined for Zod compatibility
		const mapped = results.map((r) => ({
			id: r.id,
			firstName: r.firstName ?? undefined,
			lastName: r.lastName ?? undefined,
			email: r.email ?? undefined,
		}));
		console.log('mapped', mapped);

		return { isSuccess: true, message: 'Profiles found', data: mapped };
	} catch {
		return { isSuccess: false, message: 'Failed to search profiles', data: [] };
	}
}

export async function getAllUserProfilesAction(): Promise<
	ActionState<UserProfileSearchData[]>
> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { isSuccess: false, message: 'Not authenticated', data: [] };
		}

		const currentUserProfile = await db.userProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!currentUserProfile || currentUserProfile.role !== 'superadmin') {
			return {
				isSuccess: false,
				message: 'Insufficient permissions',
				data: [],
			};
		}

		const results = await db.userProfile.findMany({
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				role: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Map nulls to undefined for Zod compatibility
		const mapped = results.map((r) => ({
			id: r.id,
			firstName: r.firstName ?? undefined,
			lastName: r.lastName ?? undefined,
			email: r.email ?? undefined,
			role: r.role,
			createdAt: r.createdAt.toISOString(),
		}));

		return { isSuccess: true, message: 'All profiles fetched', data: mapped };
	} catch (error) {
		console.error('Error fetching all user profiles:', error);
		return { isSuccess: false, message: 'Failed to fetch profiles', data: [] };
	}
}

export async function getCurrentUserProfileAction(): Promise<
	ActionState<Prisma.UserProfileGetPayload<Record<string, never>> | null>
> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { isSuccess: false, message: 'Not authenticated', data: null };
		}

		const userProfile = await db.userProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!userProfile) {
			return {
				isSuccess: false,
				message: 'User profile not found',
				data: null,
			};
		}

		return { isSuccess: true, message: 'Profile fetched', data: userProfile };
	} catch (error) {
		console.error('Error fetching current user profile:', error);
		return { isSuccess: false, message: 'Failed to fetch profile', data: null };
	}
}

// Helper function to get user profile ID from session
export async function getUserProfileId(): Promise<string | null> {
	const session = await auth();
	if (!session?.user?.id) {
		return null;
	}

	const userProfile = await db.userProfile.findUnique({
		where: { userId: session.user.id },
	});

	return userProfile?.id ?? null;
}

export async function getUserProfileByIdAction(
	userProfileId: string
): Promise<ActionState<UserProfileWithRelations | null>> {
	try {
		const profile = await db.userProfile.findUnique({
			where: { id: userProfileId },
			include: {
				user: {
					select: {
						id: true,
						email: true,
						createdAt: true,
					},
				},
				memberships: {
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
				},
			},
		});

		if (!profile) {
			return { isSuccess: false, message: 'User profile not found' };
		}

		// Get all active invites for this user's email
		const activeInvites = await db.invite.findMany({
			where: {
				email: profile.email || '',

				 
				OR: [
					{
						status: 'pending',
						expiresAt: { gt: new Date() },
					},
					{
						status: 'expired',
					},
				],
			},
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
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return {
			isSuccess: true,
			message: 'Profile fetched',
			data: {
				...profile,
				activeInvites,
			},
		};
	} catch (error) {
		console.error('Error fetching user profile:', error);
		return { isSuccess: false, message: 'Failed to fetch profile' };
	}
}

export async function canViewUserProfileAction(
	targetUserProfileId: string
): Promise<ActionState<boolean>> {
	const session = await auth();
	if (!session?.user?.id) {
		return { isSuccess: false, message: 'Not authenticated', data: false };
	}

	try {
		const currentUserProfile = await db.userProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!currentUserProfile) {
			return {
				isSuccess: false,
				message: 'User profile not found',
				data: false,
			};
		}

		// Superadmin can view any user
		if (currentUserProfile.role === 'superadmin') {
			return { isSuccess: true, message: 'Superadmin access', data: true };
		}

		// Check if current user is admin/owner of any organisation or team that the target user is part of
		const targetUserMemberships = await getMemberships({
			type: 'all',
			userProfileId: targetUserProfileId,
		});

		const currentUserMemberships = await getMemberships({
			type: 'all',
			userProfileId: currentUserProfile.id,
			prismaArgs: {
				where: {
					role: { in: ['member', 'owner'] },
				},
			},
		});

		// Check for organisation overlap
		const targetOrgs = targetUserMemberships
			.filter((m) => m.organisationId)
			.map((m) => m.organisationId);
		const currentAdminOrgs = currentUserMemberships
			.filter((m) => m.organisationId)
			.map((m) => m.organisationId);

		const orgOverlap = targetOrgs.some((orgId) =>
			currentAdminOrgs.includes(orgId)
		);

		// Check for team overlap
		const targetTeams = targetUserMemberships
			.filter((m) => m.teamId)
			.map((m) => m.teamId);
		const currentAdminTeams = currentUserMemberships
			.filter((m) => m.teamId)
			.map((m) => m.teamId);

		const teamOverlap = targetTeams.some((teamId) =>
			currentAdminTeams.includes(teamId)
		);

		const canView = orgOverlap || teamOverlap;

		return {
			isSuccess: true,
			message: canView ? 'Access granted' : 'Access denied',
			data: canView,
		};
	} catch (error) {
		console.error('Error checking user profile access:', error);
		return { isSuccess: false, message: 'Failed to check access', data: false };
	}
}
