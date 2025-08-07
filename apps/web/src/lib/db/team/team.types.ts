import { z } from 'zod';

export const TeamFormSchema = z.object({
	name: z.string().min(1),
	// Add other fields as needed
});

export type TeamFormValues = z.infer<typeof TeamFormSchema>;
