'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/ui/avatar';
import { Badge } from '@shadcn/ui/badge';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent, CardHeader } from '@shadcn/ui/card';
import Tabs from '@src/components/tabs';
import InvitesTable from '@src/components/tables/invites-table';
import ProfileUpdateDialog from '@src/components/dialogs/profile-update-dialog';

// Type for user with profile
interface UserWithProfile {
	id: string;
	firstName?: string;
	lastName?: string;
	email: string;
	role: string;
	image?: string;
	bio?: string;
	createdAt: string;
	userProfile?: {
		id: string;
	};
	activeInvites?: InviteWithRelations[];
}

// Type for invite with relations
interface InviteWithRelations {
	id: string;
	email: string;
	status: string;
	expiresAt: string;
	createdAt: string;
	role: string;
	organisationId?: string;
	teamId?: string;
	organisation?: {
		name: string;
	};
	team?: {
		name: string;
	};
}

// Type for invite data for table
interface InviteData {
	id: string;
	email: string;
	status: string;
	expiresAt: string;
	createdAt: string;
	contextName: string;
	contextType: string;
	role: string;
	hasUser: boolean;
	userProfileId?: string;
	organisationId?: string;
	teamId?: string;
}

interface UserDetailViewProps {
	targetUser: UserWithProfile;
	currentUser: UserWithProfile;
}

export default function UserDetailView({
	targetUser,
	currentUser,
}: UserDetailViewProps) {
	const t = useTranslations('common');

	const [showEditDialog, setShowEditDialog] = useState(false);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	// Check if current user can view sensitive information
	const canViewSensitiveInfo =
		currentUser.role === 'superadmin' || currentUser.id === targetUser.id;

	// Check if current user is viewing their own profile
	const isCurrentUser = currentUser.id === targetUser.id;

	// Transform active invites to match InvitesTable format
	const activeInvites: InviteData[] =
		targetUser.activeInvites?.map((invite: InviteWithRelations) => ({
			id: invite.id,
			email: invite.email,
			status: invite.status,
			expiresAt: new Date(invite.expiresAt).toLocaleDateString(),
			createdAt: new Date(invite.createdAt).toLocaleDateString(),
			contextName:
				invite.organisation?.name || invite.team?.name || t('unknown'),
			contextType: invite.organisation ? t('organisation') : t('team'),
			role: invite.role,
			hasUser: !!targetUser.userProfile,
			userProfileId: targetUser.userProfile?.id,
			organisationId: invite.organisationId,
			teamId: invite.teamId,
		})) || [];

	// Separate active and expired invites
	const pendingInvites = activeInvites.filter(
		(invite: InviteData) =>
			invite.status === 'pending' && new Date(invite.expiresAt) > new Date()
	);
	const expiredInvites = activeInvites.filter(
		(invite: InviteData) =>
			invite.status === 'expired' || new Date(invite.expiresAt) <= new Date()
	);

	// Profile Information Tab Content
	const ProfileInformationContent = (
		<div className="space-y-6">
			{/* User Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Avatar className="h-16 w-16">
								<AvatarImage src={targetUser.image || ''} />
								<AvatarFallback>
									{targetUser.firstName?.[0]}
									{targetUser.lastName?.[0]}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<h2 className="text-2xl font-bold">
									{targetUser.firstName} {targetUser.lastName}
								</h2>
								<p className="text-muted-foreground">{targetUser.email}</p>
								<div className="mt-2 flex items-center space-x-2">
									<Badge variant="outline">{targetUser.role}</Badge>
									<span className="text-muted-foreground text-sm">
										{t('member_since')} {formatDate(targetUser.createdAt)}
									</span>
								</div>
							</div>
						</div>
						{isCurrentUser && (
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
					{targetUser.bio && (
						<div className="mb-4">
							<h3 className="mb-2 font-semibold">{t('bio')}</h3>
							<p className="text-muted-foreground">{targetUser.bio}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);

	// Invites Tab Content
	const InvitesContent = (
		<div className="space-y-6">
			{canViewSensitiveInfo ? (
				<>
					{/* pending Invites */}
					{pendingInvites.length > 0 && (
						<InvitesTable
							data={pendingInvites}
							title="pending Invites"
							description="Active invitations for this user."
							type="active"
							isCurrentUser={isCurrentUser}
							currentUserProfileId={currentUser.id}
						/>
					)}

					{/* expired Invites */}
					{expiredInvites.length > 0 && (
						<InvitesTable
							data={expiredInvites}
							title="expired Invites"
							description="Invitations that have expired and need to be re-sent."
							type="expired"
							isCurrentUser={isCurrentUser}
							currentUserProfileId={currentUser.id}
						/>
					)}

					{/* No invites message */}
					{pendingInvites.length === 0 && expiredInvites.length === 0 && (
						<div className="py-8 text-center">
							<p className="text-muted-foreground">No invites found.</p>
						</div>
					)}
				</>
			) : (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">
						You don&apos;t have permission to view this user&apos;s invites.
					</p>
				</div>
			)}
		</div>
	);

	const tabs = [
		{
			id: 'profile',
			value: 'profile',
			label: t('profile_information'),
			content: ProfileInformationContent,
		},
		{
			id: 'invites',
			value: 'invites',
			label: t('invites'),
			content: InvitesContent,
		},
	];

	return (
		<div className="space-y-6">
			<Tabs tabs={tabs} defaultTab="profile" />

			{showEditDialog && (
				<ProfileUpdateDialog
					open={showEditDialog}
					onOpenChange={setShowEditDialog}
					userId={targetUser.id}
					initialValues={{
						firstName: targetUser.firstName || '',
						lastName: targetUser.lastName || '',
						email: targetUser.email || '',
						bio: targetUser.bio || '',
						jobTitle: (targetUser as any).jobTitle || '',
					}}
				/>
			)}
		</div>
	);
}
