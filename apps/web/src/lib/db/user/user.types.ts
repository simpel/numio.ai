import { z } from 'zod';

export const userFormSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1),
	// Add other fields as needed
});

export type UserFormValues = z.infer<typeof userFormSchema>;
