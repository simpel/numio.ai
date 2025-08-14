'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Edit } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@shadcn/ui/card';
import { Button } from '@shadcn/ui/button';
import { Badge } from '@shadcn/ui/badge';
import { getUserProfileByIdAction } from '@src/lib/db/user-profile/user-profile.actions';
import ProfileUpdateDialog from '@src/components/dialogs/profile-update-dialog';

interface UserDetailContentProps {
	userId: string;
}

export function UserDetailContent({ userId }: UserDetailContentProps) {
	const t = useTranslations('pages.admin');
	const router = useRouter();
	const [userData, setUserData] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const result = await getUserProfileByIdAction(userId);
				if (result.isSuccess && result.data) {
					setUserData(result.data);
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, [userId]);

	const getUserDisplayName = (user: any) => {
		const firstName = user.firstName || '';
		const lastName = user.lastName || '';
		const fullName = `${firstName} ${lastName}`.trim();
		return fullName || user.email || 'Unknown User';
	};

	if (isLoading) {
		return (
			<div className="container mx-auto space-y-6 p-6">
				<div className="py-8 text-center">
					<div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
					<p className="text-muted-foreground mt-2">{t('loading_user')}</p>
				</div>
			</div>
		);
	}

	if (!userData) {
		return (
			<div className="container mx-auto space-y-6 p-6">
				<div className="py-8 text-center">
					<p className="text-muted-foreground">{t('user_not_found')}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.back()}
					className="flex items-center gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					{t('back')}
				</Button>
			</div>

			<div className="space-y-2">
				<h1 className="text-3xl font-bold">{t('user_details')}</h1>
				<p className="text-muted-foreground">{t('user_details_description')}</p>
			</div>

			{/* User Information */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								{t('user_information')}
							</CardTitle>
							<CardDescription>
								{t('user_information_description')}
							</CardDescription>
						</div>
						<Button
							onClick={() => setIsEditDialogOpen(true)}
							className="flex items-center gap-2"
						>
							<Edit className="h-4 w-4" />
							{t('edit_profile')}
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
							<User className="text-primary h-6 w-6" />
						</div>
						<div>
							<h3 className="text-lg font-semibold">
								{getUserDisplayName(userData)}
							</h3>
							{userData.email && (
								<p className="text-muted-foreground">{userData.email}</p>
							)}
							{userData.role && (
								<Badge variant="secondary" className="mt-1">
									{userData.role}
								</Badge>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Edit Profile Dialog */}
			<ProfileUpdateDialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				userId={userData.id}
				initialValues={{
					firstName: userData.firstName || '',
					lastName: userData.lastName || '',
					email: userData.email || '',
					bio: userData.bio || '',
					jobTitle: userData.jobTitle || '',
				}}
			/>
		</div>
	);
}
