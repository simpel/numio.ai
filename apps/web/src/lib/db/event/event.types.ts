import { z } from 'zod';

export const eventFormSchema = z.object({
	caseId: z.string(),
	occurredAt: z.date().optional(),
	type: z.string().min(1),
	metadata: z.any().optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
