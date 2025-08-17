'use server';

import { db, Prisma } from '@numio/ai-database';
import { ActionState } from '@src/types/global';

export async function createUserAction(
	input: Prisma.UserCreateInput
): Promise<ActionState<Prisma.UserGetPayload<Record<string, never>>>> {
	try {
		const user = await db.user.create({ data: input });
		return { isSuccess: true, message: 'User created', data: user };
	} catch (error) {
		console.error('Error creating user:', error);
		return { isSuccess: false, message: 'Failed to create user' };
	}
}

import { UserWithRelations } from './user.types';

export async function getAllUsersAction(): Promise<
	ActionState<UserWithRelations[]>
> {
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
