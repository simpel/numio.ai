'use server';

import { db, Prisma, User } from '@numio/ai-database';
import { ActionState } from '@src/types/global';

export async function createUserAction(
	input: Prisma.UserCreateInput
): Promise<ActionState<User>> {
	try {
		const user = await db.user.create({ data: input });
		return { isSuccess: true, message: 'User created', data: user };
	} catch (error) {
		return { isSuccess: false, message: 'Failed to create user' };
	}
}

export async function getAllUsersAction(): Promise<ActionState<any[]>> {
	try {
		const users = await db.user.findMany({
			include: {
				profile: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return { isSuccess: true, message: 'All users retrieved', data: users };
	} catch (error) {
		console.error('Error getting all users:', error);
		return { isSuccess: false, message: 'Failed to get all users' };
	}
}
