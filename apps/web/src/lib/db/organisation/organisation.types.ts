import { z } from 'zod';

export const OrganisationFormSchema = z.object({
	name: z.string().min(1),
	ownerId: z.string(),
});

export type OrganisationFormValues = z.infer<typeof OrganisationFormSchema>;
