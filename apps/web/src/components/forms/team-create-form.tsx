'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TeamFormSchema, TeamFormValues } from '@src/lib/db/team/team.types';
import { createTeamAction } from '@src/lib/db/team/team.actions';
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from '@shadcn/ui/form';
import { Input } from '@shadcn/ui/input';
import { Button } from '@shadcn/ui/button';

export default function TeamCreateForm() {
	const [pending, startTransition] = useTransition();
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<TeamFormValues>({
		resolver: zodResolver(TeamFormSchema),
		defaultValues: {
			name: '',
			// Add other fields as needed
		},
	});

	async function onSubmit(values: TeamFormValues) {
		setSuccess(null);
		setError(null);
		startTransition(async () => {
			const result = await createTeamAction(values);
			if (result.isSuccess) {
				setSuccess('Team created!');
				form.reset();
			} else {
				setError(result.message || 'Failed to create team');
			}
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} disabled={pending} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Add more fields as needed */}
				<Button type="submit" disabled={pending}>
					{pending ? 'Creating...' : 'Create Team'}
				</Button>
				{success && <div className="text-green-600">{success}</div>}
				{error && <div className="text-red-600">{error}</div>}
			</form>
		</Form>
	);
}
