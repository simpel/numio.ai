'use client';

import { useState } from 'react';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent, CardHeader } from '@shadcn/ui/card';
import { Badge } from '@shadcn/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/ui/avatar';
import { Edit } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ProfileUpdateDialog from '@src/components/dialogs/profile-update-dialog';

interface User {
	id: string;
	userId: string;
	firstName?: string;
	lastName?: string;
	email: string;
	role: string;
	image?: string;
	bio?: string;
	jobTitle?: string;
	createdAt: string;
}

interface UserProfileCardProps {
	user: User;
	isCurrentUser: boolean;
	isSuperAdmin: boolean;
}

export default function UserProfileCard({
	user,
	isCurrentUser,
	isSuperAdmin,
}: UserProfileCardProps) {
	const t = useTranslations('common');
	const [showEditDialog, setShowEditDialog] = useState(false);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	// Show edit button for current user or superadmins
	const canEdit = isCurrentUser || isSuperAdmin;

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Avatar className="h-16 w-16">
								<AvatarImage src={user.image || ''} />
								<AvatarFallback>
									{user.firstName?.[0]}
									{user.lastName?.[0]}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<h2 className="text-2xl font-bold">
									{user.firstName} {user.lastName}
								</h2>
								<p className="text-muted-foreground">{user.email}</p>
								<div className="mt-2 flex items-center space-x-2">
									<Badge variant="outline">{user.role}</Badge>
									<span className="text-muted-foreground text-sm">
										{t('member_since')} {formatDate(user.createdAt)}
									</span>
								</div>
							</div>
						</div>
						{canEdit && (
							<Button
								onClick={() => setShowEditDialog(true)}
								variant="outline"
								size="sm"
							>
								<Edit className="mr-2 h-4 w-4" />
								{t('edit_profile')}
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{user.bio && (
						<div className="mb-4">
							<h3 className="mb-2 font-semibold">{t('bio')}</h3>
							<p className="text-muted-foreground">{user.bio}</p>
						</div>
					)}
					{user.jobTitle && (
						<div>
							<h3 className="mb-2 font-semibold">{t('job_title')}</h3>
							<p className="text-muted-foreground">{user.jobTitle}</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Profile Update Dialog */}
			{showEditDialog && (
				<ProfileUpdateDialog
					userId={user.userId}
					initialValues={{
						firstName: user.firstName || '',
						lastName: user.lastName || '',
						email: user.email || '',
						bio: user.bio || '',
						jobTitle: user.jobTitle || '',
					}}
					open={showEditDialog}
					onOpenChange={setShowEditDialog}
				/>
			)}
		</>
	);
}
