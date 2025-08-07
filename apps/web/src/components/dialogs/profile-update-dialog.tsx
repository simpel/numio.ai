'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@shadcn/ui/dialog';
import ProfileUpdateForm from '@src/components/forms/profile-update-form';

// Profile update dialog component
interface ProfileUpdateDialogProps {
	userId: string;
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
	userId,
	initialValues,
	open,
	onOpenChange,
}: ProfileUpdateDialogProps) {
	const router = useRouter();

	const handleSuccess = () => {
		toast.success('Profile updated successfully!');
		onOpenChange(false);
		// Revalidate the page
		router.refresh();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>
						Update your profile information and preferences.
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<ProfileUpdateForm
						userId={userId}
						initialValues={initialValues}
						onSuccess={handleSuccess}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
