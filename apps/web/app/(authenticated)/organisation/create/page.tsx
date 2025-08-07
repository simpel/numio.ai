'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import debounce from 'lodash.debounce';

import { createOrganisationAction } from '@src/lib/db/organisation/organisation.actions';
import { checkOrgNameAction } from '@src/lib/db/organisation/organisation.actions';
import { Button } from '@shadcn/ui/button';
import { Form } from '@shadcn/ui/form';
import AsyncInput from '@src/components/forms/elements/async-input';
import { toast } from 'sonner';
import { toUrl } from '@src/utils';

// Debounced async validator for org name
const checkOrgNameDebounced = debounce(
	async (name: string, resolve: (value: boolean) => void) => {
		if (name.length < 3) return resolve(true);
		const result = await checkOrgNameAction(name);
		resolve(result.isSuccess && result.data === true);
	},
	400
);

const CreateOrganisationSchema = z.object({
	name: z
		.string()
		.min(3, 'Name must be at least 3 characters')
		.refine(
			(name) => new Promise((resolve) => checkOrgNameDebounced(name, resolve)),
			{
				message: 'Organisation name is already taken',
			}
		),
});

type CreateOrganisationSchemaType = z.infer<typeof CreateOrganisationSchema>;

export default function CreateOrganisationPage() {
	const [pending, startTransition] = useTransition();
	const router = useRouter();

	const form = useForm<CreateOrganisationSchemaType>({
		resolver: zodResolver(CreateOrganisationSchema),
		mode: 'onChange',
	});

	const name = form.watch('name');

	async function onSubmit(values: CreateOrganisationSchemaType) {
		startTransition(async () => {
			const result = await createOrganisationAction({ name: values.name });

			if (result.isSuccess && result.data) {
				toast.success('The org has been created.');
				router.push(`/organisation/${result.data.id}`);
			} else {
				toast.error(result.message || 'Failed to create organisation');
			}
		});
	}

	return (
		<div className="mx-auto max-w-md">
			<h1 className="mb-4 text-2xl font-bold">Create a New Organisation</h1>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<AsyncInput
						name="name"
						label="Organisation Name"
						placeholder="Enter a name for your organisation"
						required
					/>

					<p className="text-muted-foreground text-sm">
						{toUrl(form.watch('name'))}.{process.env.NEXT_PUBLIC_DOMAIN}
					</p>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={pending || !form.formState.isValid}>
							{pending ? 'Creating...' : 'Create Organisation'}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
