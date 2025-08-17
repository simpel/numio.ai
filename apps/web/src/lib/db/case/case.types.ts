import { z } from 'zod';
import { Prisma } from '@numio/ai-database';

export const caseFormSchema = z.object({
	clientId: z.string(),
	teamId: z.string(),
	title: z.string().min(1),
	description: z.string().optional(),
});

export type CaseFormValues = z.infer<typeof caseFormSchema>;

export type CaseWithRelations = Prisma.CaseGetPayload<{
	include: {
		client: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>;
