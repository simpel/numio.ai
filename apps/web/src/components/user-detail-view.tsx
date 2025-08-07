'use client';

import { useTransition, useState } from 'react';
import { Card, CardContent, CardHeader } from '@shadcn/ui/card';
import { Badge } from '@shadcn/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/ui/avatar';
import { Button } from '@shadcn/ui/button';
import { Edit } from 'lucide-react';
import Tabs from '@src/components/tabs';
import InvitesTable from '@src/components/tables/invites-table';
import ProfileUpdateDialog from '@src/components/dialogs/profile-update-dialog';

interface UserDetailViewProps {
	targetUser: any;
	currentUser: any;
}

export default function UserDetailView({
	targetUser,
	currentUser,
}: UserDetailViewProps) {
	const [isReInviting, startReInviteTransition] = useTransition();
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
	const activeInvites =
		targetUser.activeInvites?.map((invite: any) => ({
			id: invite.id,
			email: invite.email,
			status: invite.status,
			expiresAt: new Date(invite.expiresAt).toLocaleDateString(),
			createdAt: new Date(invite.createdAt).toLocaleDateString(),
			contextName: invite.organisation?.name || invite.team?.name || 'Unknown',
			contextType: invite.organisation ? 'Organisation' : 'Team',
			role: invite.role,
			hasUser: !!targetUser.userProfile,
			userProfileId: targetUser.userProfile?.id,
			organisationId: invite.organisationId,
			teamId: invite.teamId,
		})) || [];

	// Separate active and expired invites
	const pendingInvites = activeInvites.filter(
		(invite: any) =>
			invite.status === 'PENDING' && new Date(invite.expiresAt) > new Date()
	);
	const expiredInvites = activeInvites.filter(
		(invite: any) =>
			invite.status === 'EXPIRED' || new Date(invite.expiresAt) <= new Date()
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
										Member since {formatDate(targetUser.createdAt)}
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
								Edit Profile
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{targetUser.bio && (
						<div className="mb-4">
							<h3 className="mb-2 font-semibold">Bio</h3>
							<p className="text-muted-foreground">{targetUser.bio}</p>
						</div>
					)}
					{targetUser.jobTitle && (
						<div>
							<h3 className="mb-2 font-semibold">Job Title</h3>
							<p className="text-muted-foreground">{targetUser.jobTitle}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);

	// Memberships Tab Content
	const MembershipsContent = (
		<div className="space-y-6">
			{targetUser.memberships && targetUser.memberships.length > 0 ? (
				<div className="space-y-4">
					<div>
						<h2 className="text-2xl font-bold">Active Memberships</h2>
						<p className="text-muted-foreground">
							Organizations, teams, and cases this user is part of.
						</p>
					</div>
					<Card>
						<CardContent className="pt-6">
							<div className="space-y-3">
								{targetUser.memberships.map((membership: any) => (
									<div
										key={membership.id}
										className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
									>
										<div className="flex-1">
											<p className="font-medium">
												{membership.organisation?.name ||
													membership.teamContext?.name ||
													membership.caseItem?.title ||
													'Unknown'}
											</p>
											<p className="text-muted-foreground text-sm">
												{membership.organisation
													? 'Organisation'
													: membership.teamContext
														? 'Team'
														: 'Case'}{' '}
												• Role: {membership.role}
											</p>
											{membership.teamContext?.organisation && (
												<p className="text-muted-foreground text-xs">
													Team in: {membership.teamContext.organisation.name}
												</p>
											)}
										</div>
										<Badge variant="secondary">{membership.role}</Badge>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			) : (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">No memberships found.</p>
				</div>
			)}
		</div>
	);

	// Invites Tab Content
	const InvitesContent = (
		<div className="space-y-6">
			{/* Pending Invites */}
			{pendingInvites.length > 0 && (
				<InvitesTable
					data={pendingInvites}
					title="Pending Invites"
					description="Active invitations for this user."
					type="active"
					isCurrentUser={isCurrentUser}
					currentUserProfileId={currentUser.id}
				/>
			)}

			{/* Expired Invites */}
			{expiredInvites.length > 0 && (
				<InvitesTable
					data={expiredInvites}
					title="Expired Invites"
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
		</div>
	);

	// Define tabs
	const tabs = [
		{
			id: 'profile',
			label: 'Profile Information',
			content: ProfileInformationContent,
		},
		{
			id: 'memberships',
			label: 'Memberships',
			content: MembershipsContent,
		},
		...(canViewSensitiveInfo &&
		(pendingInvites.length > 0 || expiredInvites.length > 0)
			? [
					{
						id: 'invites',
						label: 'Invites',
						content: InvitesContent,
					},
				]
			: []),
	];

	return (
		<div className="space-y-6">
			<Tabs tabs={tabs} defaultTab="profile" />

			{/* Profile Update Dialog */}
			{showEditDialog && (
				<ProfileUpdateDialog
					userId={targetUser.userId}
					initialValues={{
						firstName: targetUser.firstName || '',
						lastName: targetUser.lastName || '',
						email: targetUser.email || '',
						bio: targetUser.bio || '',
						jobTitle: targetUser.jobTitle || '',
					}}
					open={showEditDialog}
					onOpenChange={setShowEditDialog}
				/>
			)}
		</div>
	);
}
