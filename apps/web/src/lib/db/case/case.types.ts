import { z } from 'zod';

export const CaseFormSchema = z.object({
	clientId: z.string(),
	teamId: z.string(),
	title: z.string().min(1),
	description: z.string().optional(),
});

export type CaseFormValues = z.infer<typeof CaseFormSchema>;
