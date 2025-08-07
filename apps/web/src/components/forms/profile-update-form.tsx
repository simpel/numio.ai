'use client';

import { useTransition } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserProfileAction } from '@src/lib/auth/auth.actions';
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
import { Textarea } from '@shadcn/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const ProfileSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	email: z.string().email(),
	bio: z.string().optional(),
	jobTitle: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

interface ProfileUpdateFormProps {
	userId: string;
	initialValues?: Partial<ProfileFormValues>;
	/**
	 * Optional path to redirect to after a successful update.
	 */
	onSuccessRedirect?: string;
	/**
	 * Optional callback to call after a successful update.
	 */
	onSuccess?: () => void;
}

export default function ProfileUpdateForm({
	userId,
	initialValues,
	onSuccessRedirect,
	onSuccess,
}: ProfileUpdateFormProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(ProfileSchema),
		defaultValues: {
			firstName: initialValues?.firstName || '',
			lastName: initialValues?.lastName || '',
			email: initialValues?.email || '',
			bio: initialValues?.bio || '',
			jobTitle: initialValues?.jobTitle || '',
		},
	});

	async function onSubmit(values: ProfileFormValues) {
		startTransition(async () => {
			const result = await updateUserProfileAction(userId, values);
			if (result.isSuccess) {
				toast.success('Profile updated successfully!');
				if (onSuccessRedirect) {
					router.push(onSuccessRedirect);
				}
				if (onSuccess) {
					onSuccess();
				}
			} else {
				toast.error(result.message || 'Failed to update profile');
			}
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>First Name</FormLabel>
							<FormControl>
								<Input {...field} disabled={pending} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Last Name</FormLabel>
							<FormControl>
								<Input {...field} disabled={pending} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" {...field} disabled={pending} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Bio</FormLabel>
							<FormControl>
								<Textarea {...field} disabled={pending} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="jobTitle"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Job Title</FormLabel>
							<FormControl>
								<Input {...field} disabled={pending} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={pending}>
					{pending ? 'Saving...' : 'Save Profile'}
				</Button>
			</form>
		</Form>
	);
}
