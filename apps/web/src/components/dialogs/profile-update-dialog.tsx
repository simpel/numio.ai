'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@shadcn/ui/dialog';
import UserProfileUpdateForm from '@src/components/forms/user-profile-update-form';

// Profile update dialog component
interface ProfileUpdateDialogProps {
	userProfileId: string;
	initialValues: {
		firstName: string;
		lastName: string;
		email: string;
		bio: string;
		jobTitle: string;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function ProfileUpdateDialog({
	userProfileId,
	initialValues,
	open,
	onOpenChange,
}: ProfileUpdateDialogProps) {
	const router = useRouter();
	const t = useTranslations('common');

	const handleSuccess = () => {
		toast.success(t('profile_updated_successfully'));
		onOpenChange(false);
		// Revalidate the page
		router.refresh();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t('edit_profile')}</DialogTitle>
					<DialogDescription>
						{t('update_profile_description')}
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<UserProfileUpdateForm
						userProfileId={userProfileId}
						initialValues={initialValues}
						onSuccess={handleSuccess}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
