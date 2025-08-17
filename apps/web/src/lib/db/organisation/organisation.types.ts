import { z } from 'zod';
import { Prisma } from '@numio/ai-database';

export const organisationFormSchema = z.object({
	name: z.string().min(1),
	ownerId: z.string(),
});

export type OrganisationFormValues = z.infer<typeof organisationFormSchema>;

export type OrganisationWithRelations = Prisma.OrganisationGetPayload<{
	include: {
		_count: {
			select: { teams: true; members: true };
		};
	};
}> & {
	owner?: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		email: string | null;
	};
};

export type OrganisationWithDetails = Prisma.OrganisationGetPayload<{
	include: {
		teams: {
			include: {
				organisation: { select: { id: true; name: true } };
				_count: {
					select: { memberships: true; members: true };
				};
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
		};
		members: {
			include: {
				memberUserProfile: true;
			};
		};
	};
}>;
