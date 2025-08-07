import { Role } from '@numio/ai-database';
import { z } from 'zod';

export const MembershipFormSchema = z.object({
	userId: z.string().optional(),
	teamId: z.string().optional(),
	organisationId: z.string().optional(),
	teamContextId: z.string().optional(),
	caseId: z.string().optional(),
	role: z.nativeEnum(Role),
});

export type MembershipFormValues = z.infer<typeof MembershipFormSchema>;
