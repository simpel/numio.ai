'use server';

import { db, Role, Invite } from '@numio/ai-database';
import { ActionState } from '@/types/global';
import { sendInviteEmail } from '@/mails/invite';
import { v4 as uuidv4 } from 'uuid';

export async function createInviteAction(input: {
	email: string;
	organisationId: string;
	role: Role;
}): Promise<ActionState<Invite>> {
	const { email, organisationId, role } = input;
	const token = uuidv4();
	const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

	try {
		// Get organisation name
		const organisation = await db.organisation.findUnique({
			where: { id: organisationId },
			select: { name: true },
		});

		// Create invite
		const invite = await db.invite.create({
			data: {
				email,
				organisationId,
				role,
				token,
				expiresAt,
			},
		});

		// Send invite email
		await sendInviteEmail(
			email,
			organisation?.name || 'Organisation',
			role,
			token,
			'organisation'
		);

		return { isSuccess: true, message: 'Invite created', data: invite };
	} catch {
		return { isSuccess: false, message: 'Failed to create invite' };
	}
}

export async function getInviteByTokenAction(
	token: string
): Promise<ActionState<Invite | null>> {
	try {
		const invite = await db.invite.findFirst({ where: { token } });
		return { isSuccess: true, message: 'Invite fetched', data: invite };
	} catch {
		return { isSuccess: false, message: 'Failed to fetch invite' };
	}
}

export async function acceptInviteAction({
	token,
	userProfileId,
}: {
	token: string;
	userProfileId: string;
}): Promise<ActionState<Invite | null>> {
	try {
		const invite = await db.invite.findFirst({ where: { token } });
		if (
			!invite ||
			invite.status !== 'pending' ||
			invite.expiresAt < new Date()
		) {
			return {
				isSuccess: false,
				message: 'Invite is invalid or expired',
				data: null,
			};
		}
		// Create membership
		await db.membership.create({
			data: {
				memberUserProfileId: userProfileId,
				organisationId: invite.organisationId ?? undefined,
				teamId: invite.teamId ?? undefined,
				role: invite.role,
			},
		});
		// Mark invite as accepted
		const updated = await db.invite.update({
			where: { id: invite.id },
			data: {
				status: 'accepted',
				acceptedAt: new Date(),
				acceptedById: userProfileId,
			},
		});
		return { isSuccess: true, message: 'Invite accepted', data: updated };
	} catch (error) {
		console.error('Error accepting invite:', error);
		return { isSuccess: false, message: 'Failed to accept invite' };
	}
}

export async function rejectInviteAction({
	inviteId,
}: {
	inviteId: string;
}): Promise<ActionState<Invite | null>> {
	try {
		const invite = await db.invite.findUnique({ where: { id: inviteId } });
		if (
			!invite ||
			invite.status !== 'pending' ||
			invite.expiresAt < new Date()
		) {
			return {
				isSuccess: false,
				message: 'Invite is invalid or expired',
				data: null,
			};
		}

		// Mark invite as rejected
		const updated = await db.invite.update({
			where: { id: invite.id },
			data: {
				status: 'cancelled',
			},
		});
		return { isSuccess: true, message: 'Invite rejected', data: updated };
	} catch (error) {
		console.error('Error rejecting invite:', error);
		return { isSuccess: false, message: 'Failed to reject invite' };
	}
}

export async function cancelInviteByIdAction(
	inviteId: string
): Promise<ActionState<Invite | null>> {
	try {
		const invite = await db.invite.findUnique({ where: { id: inviteId } });
		if (
			!invite ||
			(invite.status !== 'pending' && invite.status !== 'expired')
		) {
			return {
				isSuccess: false,
				message: 'Invite is not pending/expired or does not exist',
				data: null,
			};
		}

		const updated = await db.invite.update({
			where: { id: inviteId },
			data: { status: 'cancelled' },
		});

		return { isSuccess: true, message: 'Invite cancelled', data: updated };
	} catch (error) {
		console.error('Error cancelling invite:', error);
		return { isSuccess: false, message: 'Failed to cancel invite', data: null };
	}
}

export async function acceptInviteByIdAction({
	inviteId,
	userProfileId,
}: {
	inviteId: string;
	userProfileId: string;
}): Promise<ActionState<Invite | null>> {
	try {
		const invite = await db.invite.findUnique({ where: { id: inviteId } });
		if (
			!invite ||
			invite.status !== 'pending' ||
			invite.expiresAt < new Date()
		) {
			return {
				isSuccess: false,
				message: 'Invite is invalid or expired',
				data: null,
			};
		}

		// Create membership
		await db.membership.create({
			data: {
				memberUserProfileId: userProfileId,
				organisationId: invite.organisationId ?? undefined,
				teamId: invite.teamId ?? undefined,
				role: invite.role,
			},
		});

		// Mark invite as accepted
		const updated = await db.invite.update({
			where: { id: invite.id },
			data: {
				status: 'accepted',
				acceptedAt: new Date(),
				acceptedById: userProfileId,
			},
		});
		return { isSuccess: true, message: 'Invite accepted', data: updated };
	} catch (error) {
		console.error('Error accepting invite:', error);
		return { isSuccess: false, message: 'Failed to accept invite' };
	}
}

export async function expireOldInvitesAction(): Promise<ActionState<number>> {
	try {
		const now = new Date();
		const { count } = await db.invite.updateMany({
			where: {
				status: 'pending',
				expiresAt: { lt: now },
			},
			data: { status: 'expired' },
		});
		return { isSuccess: true, message: 'expired old invites', data: count };
	} catch (error) {
		console.error('Error expiring old invites:', error);
		return { isSuccess: false, message: 'Failed to expire invites', data: 0 };
	}
}

export async function listInvitesForContextAction(context: {
	organisationId?: string;
	teamId?: string;
}): Promise<ActionState<Invite[]>> {
	try {
		const invites = await db.invite.findMany({ where: context });
		return { isSuccess: true, message: 'Invites fetched', data: invites };
	} catch (error) {
		console.error('Error fetching invites:', error);
		return { isSuccess: false, message: 'Failed to fetch invites', data: [] };
	}
}

export async function listInvitesForEmailAction(
	email: string
): Promise<ActionState<Invite[]>> {
	try {
		const invites = await db.invite.findMany({ where: { email } });
		return { isSuccess: true, message: 'Invites fetched', data: invites };
	} catch (error) {
		console.error('Error fetching invites:', error);
		return { isSuccess: false, message: 'Failed to fetch invites', data: [] };
	}
}

export async function renewInviteAction(
	inviteId: string
): Promise<ActionState<Invite | null>> {
	try {
		const invite = await db.invite.findUnique({ where: { id: inviteId } });
		if (!invite || invite.status !== 'pending') {
			return {
				isSuccess: false,
				message: 'Invite is not pending or does not exist',
				data: null,
			};
		}

		// Extend expiry by 72 hours from now
		const newExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

		const updated = await db.invite.update({
			where: { id: inviteId },
			data: { expiresAt: newExpiresAt },
		});

		return { isSuccess: true, message: 'Invite renewed', data: updated };
	} catch (error) {
		console.error('Error renewing invite:', error);
		return { isSuccess: false, message: 'Failed to renew invite' };
	}
}

export async function reInviteUserAction(input: {
	email: string;
	organisationId?: string;
	teamId?: string;
	role: Role;
}): Promise<ActionState<Invite>> {
	const { email, organisationId, teamId, role } = input;
	const token = uuidv4();
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	try {
		let contextName = 'Unknown';
		let contextType = 'organisation';

		// Get context name and type
		if (organisationId) {
			const organisation = await db.organisation.findUnique({
				where: { id: organisationId },
				select: { name: true },
			});
			contextName = organisation?.name || 'Unknown Organisation';
			contextType = 'organisation';
		} else if (teamId) {
			const team = await db.team.findUnique({
				where: { id: teamId },
				select: {
					name: true,
					organisation: {
						select: { name: true },
					},
				},
			});
			contextName = team?.name || 'Unknown Team';
			contextType = 'team';
		}

		// Cancel any existing pending or expired invites for this email and context
		await db.invite.updateMany({
			where: {
				email,
				...(organisationId ? { organisationId } : {}),
				...(teamId ? { teamId } : {}),
				status: {
					in: ['pending', 'expired'],
				},
			},
			data: { status: 'cancelled' },
		});

		// Create new invite
		const invite = await db.invite.create({
			data: {
				email,
				...(organisationId ? { organisationId } : {}),
				...(teamId ? { teamId } : {}),
				role,
				token,
				expiresAt,
			},
		});

		// Send invite email
		await sendInviteEmail(
			email,
			contextName,
			role,
			token,
			contextType as 'organisation' | 'team'
		);

		return { isSuccess: true, message: 'Re-invite sent', data: invite };
	} catch (error) {
		console.error('Error re-inviting user:', error);
		return { isSuccess: false, message: 'Failed to re-invite user' };
	}
}

export async function getPendingInvitesForUserAction(
	email: string
): Promise<ActionState<Invite[]>> {
	try {
		const invites = await db.invite.findMany({
			where: {
				email,
				status: 'pending',
				expiresAt: { gt: new Date() },
			},
			include: {
				organisation: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
		return {
			isSuccess: true,
			message: 'Pending invites fetched',
			data: invites,
		};
	} catch (error) {
		console.error('Error fetching pending invites:', error);
		return {
			isSuccess: false,
			message: 'Failed to fetch pending invites',
			data: [],
		};
	}
}

export async function getAllInvitesAction(): Promise<ActionState<Invite[]>> {
	try {
		const invites = await db.invite.findMany({
			where: {
				status: {
					in: ['pending', 'expired'],
				},
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

		// Find user profiles for each invite by email
		const invitesWithUserProfiles = await Promise.all(
			invites.map(async (invite) => {
				const userProfile = await db.userProfile.findUnique({
					where: { email: invite.email },
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				});

				return {
					...invite,
					userProfile,
				};
			})
		);

		return {
			isSuccess: true,
			message: 'All invites retrieved',
			data: invitesWithUserProfiles,
		};
	} catch (error) {
		console.error('Error getting all invites:', error);
		return { isSuccess: false, message: 'Failed to get all invites' };
	}
}

export async function getInviteAction(
	token: string
): Promise<ActionState<Invite | null>> {
	try {
		const invite = await db.invite.findFirst({
			where: { token },
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
		});

		if (!invite) {
			return { isSuccess: false, message: 'Invite not found', data: null };
		}

		return {
			isSuccess: true,
			message: 'Invite retrieved',
			data: invite,
		};
	} catch (error) {
		console.error('Error getting invite:', error);
		return { isSuccess: false, message: 'Failed to get invite', data: null };
	}
}

export async function getInviteByIdAction(
	inviteId: string
): Promise<ActionState<Invite | null>> {
	try {
		const invite = await db.invite.findUnique({
			where: { id: inviteId },
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
		});

		if (!invite) {
			return { isSuccess: false, message: 'Invite not found', data: null };
		}

		return { isSuccess: true, message: 'Invite found', data: invite };
	} catch (error) {
		console.error('Error getting invite by ID:', error);
		return { isSuccess: false, message: 'Failed to get invite', data: null };
	}
}
