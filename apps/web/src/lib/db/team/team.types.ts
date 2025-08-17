import { z } from 'zod';
import { Prisma } from '@numio/ai-database';

export const teamFormSchema = z.object({
	name: z.string().min(1),
	// Add other fields as needed
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;

export type TeamWithRelations = Prisma.TeamGetPayload<{
	include: {
		organisation: { select: { id: true; name: true } };
		_count: { select: { memberships: true; members: true } };
		members: {
			include: {
				memberUserProfile: {
					select: {
						id: true;
						firstName: true;
						lastName: true;
						image: true;
					};
				};
			};
		};
	};
}>;
