'use server';

import { getCurrentUser } from '@src/lib/auth/auth.utils';
import ProfileUpdateForm from '@src/components/forms/profile-update-form';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { redirect } from 'next/navigation';

export default async function WelcomeRootRedirect() {
	const user = await getCurrentUser();
	if (!user || !user.id) {
		redirect('/signin');
	}
	const { data: profile } = await getUserProfileAction(user.id);
	if (!profile) {
		redirect('/signin');
	}

	return (
		<div className="mx-auto max-w-xl py-8">
			<ProfileUpdateForm
				userId={profile.userId}
				onSuccessRedirect="/home"
				initialValues={{
					firstName: profile.firstName || '',
					lastName: profile.lastName || '',
					email: profile.email || '',
					bio: profile.bio || '',
					jobTitle: profile.jobTitle || '',
				}}
			/>
		</div>
	);
}
