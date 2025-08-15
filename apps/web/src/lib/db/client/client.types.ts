import { z } from 'zod';

export const clientFormSchema = z.object({
	organisationId: z.string(),
	name: z.string().min(1),
	orgNumber: z.string().min(1),
	description: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
