import { Prisma, UserProfile } from '@numio/ai-database';

export type InviteWithRelations = Prisma.InviteGetPayload<{
	include: {
		organisation: { select: { id: true; name: true } };
		team: {
			select: {
				id: true;
				name: true;
				organisation: { select: { id: true; name: true } };
			};
		};
	};
}> & {
	userProfile?: UserProfile | null;
};
