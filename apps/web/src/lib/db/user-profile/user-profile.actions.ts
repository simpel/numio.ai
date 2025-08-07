'use server';

import { db } from '@numio/ai-database';
import { ActionState } from '@src/types/global';
import { UserProfileSearchData } from './user-profile.types';
import { auth } from '@src/lib/auth/auth';

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
	} catch (error) {
		return { isSuccess: false, message: 'Failed to search profiles', data: [] };
	}
}

export async function getUserProfileByIdAction(
	userProfileId: string
): Promise<ActionState<any>> {
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
						status: 'PENDING',
						expiresAt: { gt: new Date() },
					},
					{
						status: 'EXPIRED',
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
		const targetUserMemberships = await db.membership.findMany({
			where: { userProfileId: targetUserProfileId },
		});

		const currentUserMemberships = await db.membership.findMany({
			where: {
				userProfileId: currentUserProfile.id,
				role: { in: ['admin', 'owner'] },
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
			.filter((m) => m.teamContextId)
			.map((m) => m.teamContextId);
		const currentAdminTeams = currentUserMemberships
			.filter((m) => m.teamContextId)
			.map((m) => m.teamContextId);

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
