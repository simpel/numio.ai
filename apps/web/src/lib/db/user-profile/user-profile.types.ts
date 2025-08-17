import { z } from 'zod';
import { Prisma } from '@numio/ai-database';

export const userProfileSearchSchema = z.object({
	id: z.string(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().optional(),
	role: z.string().optional(),
	createdAt: z.string().optional(),
});

export type UserProfileSearchData = z.infer<typeof userProfileSearchSchema>;

export type UserProfileWithRelations = Prisma.UserProfileGetPayload<{
	include: {
		user: {
			select: {
				id: true;
				email: true;
				createdAt: true;
			};
		};
		memberships: {
			include: {
				organisation: {
					select: {
						id: true;
						name: true;
					};
				};
				team: {
					select: {
						id: true;
						name: true;
						organisation: {
							select: {
								id: true;
								name: true;
							};
						};
					};
				};
				case: {
					select: {
						id: true;
						title: true;
						team: {
							select: {
								id: true;
								name: true;
							};
						};
					};
				};
			};
		};
	};
}> & {
	activeInvites: Prisma.InviteGetPayload<{
		include: {
			organisation: {
				select: {
					id: true;
					name: true;
				};
			};
			team: {
				select: {
					id: true;
					name: true;
					organisation: {
						select: {
							id: true;
							name: true;
						};
					};
				};
			};
		};
	}>[];
};
