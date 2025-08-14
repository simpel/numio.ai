'use client';

import { useTransition } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
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

export default function UserProfileUpdateForm({
	userProfileId,
	initialValues,
	onSuccessRedirect,
	onSuccess,
}: {
	userProfileId: string;
	initialValues?: Partial<{
		firstName: string;
		lastName: string;
		email: string;
		bio: string;
		jobTitle: string;
	}>;
	onSuccessRedirect?: string;
	onSuccess?: () => void;
}) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const t = useTranslations('common');
	const authT = useTranslations('auth.forms.signup');
	const validationT = useTranslations('components.forms.validation');

	const ProfileSchema = z.object({
		firstName: z
			.string()
			.min(1, authT('first_name_label') + ' ' + t('is_required')),
		lastName: z
			.string()
			.min(1, authT('last_name_label') + ' ' + t('is_required')),
		email: z.string().email(validationT('email')),
		bio: z.string().optional(),
		jobTitle: z.string().optional(),
	});

	type ProfileFormValues = z.infer<typeof ProfileSchema>;

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
			const result = await updateUserProfileAction(userProfileId, values);
			if (result.isSuccess) {
				toast.success(t('profile_updated_successfully'));
				if (onSuccessRedirect) {
					router.push(onSuccessRedirect);
				}
				if (onSuccess) {
					onSuccess();
				}
			} else {
				toast.error(result.message || t('failed_to_update_profile'));
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
							<FormLabel>{authT('first_name_label')}</FormLabel>
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
							<FormLabel>{authT('last_name_label')}</FormLabel>
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
							<FormLabel>{authT('email_label')}</FormLabel>
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
							<FormLabel>{t('bio')}</FormLabel>
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
							<FormLabel>{t('job_title')}</FormLabel>
							<FormControl>
								<Input {...field} disabled={pending} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={pending}>
					{pending ? t('saving') : t('save_profile')}
				</Button>
			</form>
		</Form>
	);
}
