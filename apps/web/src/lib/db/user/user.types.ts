import { z } from 'zod';
import { Prisma } from '@numio/ai-database';

export const userFormSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1),
	// Add other fields as needed
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export type UserWithRelations = Prisma.UserGetPayload<{
	include: {
		profile: true;
	};
}>;
