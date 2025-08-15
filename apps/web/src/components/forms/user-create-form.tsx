'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userFormSchema, UserFormValues } from '@src/lib/db/user/user.types';
import { createUserAction } from '@src/lib/db/user/user.actions';
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

export default function UserCreateForm() {
	const [pending, startTransition] = useTransition();
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<UserFormValues>({
		resolver: zodResolver(userFormSchema),
		defaultValues: {
			email: '',
			name: '',
			// Add other fields as needed
		},
	});

	async function onSubmit(values: UserFormValues) {
		setSuccess(null);
		setError(null);
		startTransition(async () => {
			const result = await createUserAction(values);
			if (result.isSuccess) {
				setSuccess('User created!');
				form.reset();
			} else {
				setError(result.message || 'Failed to create user');
			}
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input {...field} disabled={pending} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
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
					{pending ? 'Creating...' : 'Create User'}
				</Button>
				{success && <div className="text-green-600">{success}</div>}
				{error && <div className="text-red-600">{error}</div>}
			</form>
		</Form>
	);
}
