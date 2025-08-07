'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@shadcn/ui/button';
import { Badge } from '@shadcn/ui/badge';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@shadcn/ui/hover-card';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';
import { toast } from 'sonner';
import {
	reInviteUserAction,
	acceptInviteByIdAction,
	rejectInviteAction,
} from '@src/lib/db/membership/invite.actions';

interface InviteData {
	id: string;
	email: string;
	status: string;
	expiresAt: string;
	createdAt: string;
	// Context data for hover card
	contextName: string;
	contextType: string;
	role: string;
	// User data for conditional button
	hasUser: boolean;
	userProfileId?: string;
	// Context IDs for re-invite
	organisationId?: string;
	teamId?: string;
}

interface InvitesTableProps {
	data: InviteData[];
	title: string;
	description?: string;
	type: 'active' | 'expired';
	isCurrentUser?: boolean;
	currentUserProfileId?: string;
}

const getStatusVariant = (status: string) => {
	switch (status.toLowerCase()) {
		case 'pending':
			return 'default';
		case 'expired':
			return 'destructive';
		case 'accepted':
			return 'secondary';
		case 'cancelled':
			return 'outline';
		default:
			return 'outline';
	}
};

export default function InvitesTable({
	data,
	title,
	description,
	type,
	isCurrentUser = false,
	currentUserProfileId,
}: InvitesTableProps) {
	const [isReInviting, startReInviteTransition] = useTransition();
	const [isAccepting, startAcceptTransition] = useTransition();
	const [isRejecting, startRejectTransition] = useTransition();

	const handleReInvite = async (invite: InviteData) => {
		startReInviteTransition(async () => {
			try {
				const result = await reInviteUserAction({
					email: invite.email,
					organisationId: invite.organisationId,
					teamId: invite.teamId,
					role: invite.role as any,
				});

				if (result.isSuccess) {
					toast.success('Re-invite sent successfully');
					// Refresh the page to update the table
					window.location.reload();
				} else {
					toast.error(result.message || 'Failed to send re-invite');
				}
			} catch (error) {
				toast.error('An unexpected error occurred');
			}
		});
	};

	const handleAcceptInvite = async (invite: InviteData) => {
		if (!currentUserProfileId) {
			toast.error('User profile not found');
			return;
		}

		startAcceptTransition(async () => {
			try {
				const result = await acceptInviteByIdAction({
					inviteId: invite.id,
					userProfileId: currentUserProfileId,
				});

				if (result.isSuccess) {
					toast.success('Invite accepted successfully');
					// Refresh the page to update the table
					window.location.reload();
				} else {
					toast.error(result.message || 'Failed to accept invite');
				}
			} catch (error) {
				toast.error('An unexpected error occurred');
			}
		});
	};

	const handleRejectInvite = async (invite: InviteData) => {
		if (!currentUserProfileId) {
			toast.error('User profile not found');
			return;
		}

		startRejectTransition(async () => {
			try {
				const result = await rejectInviteAction({
					inviteId: invite.id,
					userProfileId: currentUserProfileId,
				});

				if (result.isSuccess) {
					toast.success('Invite rejected successfully');
					// Refresh the page to update the table
					window.location.reload();
				} else {
					toast.error(result.message || 'Failed to reject invite');
				}
			} catch (error) {
				toast.error('An unexpected error occurred');
			}
		});
	};

	const columns: ColumnDef<InviteData>[] = [
		{
			accessorKey: 'email',
			header: 'Email',
			enableSorting: true,
			cell: ({ row }: { row: any }) => {
				const invite = row.original;

				// If there's a user profile, make the email clickable
				if (invite.hasUser && invite.userProfileId) {
					return (
						<HoverCard>
							<HoverCardTrigger asChild>
								<ClickableCell href={`/user/${invite.userProfileId}`}>
									{invite.email}
								</ClickableCell>
							</HoverCardTrigger>
							<HoverCardContent className="w-80">
								<div className="space-y-2">
									<h4 className="text-sm font-semibold">Invite Details</h4>
									<p className="text-sm">
										{invite.email} is invited to the{' '}
										{invite.contextType.toLowerCase()} {invite.contextName} as{' '}
										{invite.role}.
									</p>
									<div className="text-muted-foreground text-xs">
										<p>Role: {invite.role}</p>
										<p>Status: {invite.status}</p>
										<p>Expires: {invite.expiresAt}</p>
									</div>
								</div>
							</HoverCardContent>
						</HoverCard>
					);
				}

				// Otherwise show as regular hover card
				return (
					<HoverCard>
						<HoverCardTrigger asChild>
							<div className="cursor-pointer">{invite.email}</div>
						</HoverCardTrigger>
						<HoverCardContent className="w-80">
							<div className="space-y-2">
								<h4 className="text-sm font-semibold">Invite Details</h4>
								<p className="text-sm">
									{invite.email} is invited to the{' '}
									{invite.contextType.toLowerCase()} {invite.contextName} as{' '}
									{invite.role}.
								</p>
								<div className="text-muted-foreground text-xs">
									<p>Role: {invite.role}</p>
									<p>Status: {invite.status}</p>
									<p>Expires: {invite.expiresAt}</p>
								</div>
							</div>
						</HoverCardContent>
					</HoverCard>
				);
			},
		},
		{
			accessorKey: 'status',
			header: 'Status',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<Badge variant={getStatusVariant(row.original.status)}>
					{row.original.status}
				</Badge>
			),
		},
		{
			accessorKey: 'expiresAt',
			header: 'Expires',
			enableSorting: true,
		},
		{
			accessorKey: 'createdAt',
			header: 'Created',
			enableSorting: true,
		},
		{
			id: 'actions',
			enableSorting: false,
			cell: ({ row }: { row: any }) => (
				<div className="flex gap-2">
					{row.original.hasUser && row.original.userProfileId && (
						<Button asChild variant="outline" size="sm">
							<Link href={`/user/${row.original.userProfileId}`}>
								User Details
							</Link>
						</Button>
					)}
					{/* Show Accept/Reject buttons for current user viewing their own invites */}
					{isCurrentUser && row.original.status === 'PENDING' && (
						<>
							<Button
								variant="default"
								size="sm"
								onClick={() => handleAcceptInvite(row.original)}
								disabled={isAccepting}
							>
								{isAccepting ? 'Accepting...' : 'Accept'}
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => handleRejectInvite(row.original)}
								disabled={isRejecting}
							>
								{isRejecting ? 'Rejecting...' : 'Reject'}
							</Button>
						</>
					)}
					{/* Show Re-invite button for superadmins or expired invites */}
					{(!isCurrentUser || row.original.status === 'EXPIRED') && (
						<Button
							variant={type === 'expired' ? 'destructive' : 'outline'}
							size="sm"
							onClick={() => handleReInvite(row.original)}
							disabled={isReInviting}
						>
							{isReInviting ? 'Sending...' : 'Re-invite'}
						</Button>
					)}
				</div>
			),
		},
	];

	return (
		<DataTable
			columns={columns}
			data={data}
			title={title}
			description={description}
			searchKey="email"
			searchPlaceholder="Search invites..."
		/>
	);
}
