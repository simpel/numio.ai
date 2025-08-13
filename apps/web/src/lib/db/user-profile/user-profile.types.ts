import { z } from 'zod';

export const UserProfileSearchSchema = z.object({
	id: z.string(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().optional(),
	role: z.string().optional(),
	createdAt: z.string().optional(),
});

export type UserProfileSearchData = z.infer<typeof UserProfileSearchSchema>;
