'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef, Row, useReactTable } from '@tanstack/react-table';
import { Button } from '@shadcn/ui/button';
import { Badge } from '@shadcn/ui/badge';
import { Checkbox } from '@shadcn/ui/checkbox';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@shadcn/ui/hover-card';
import { DataTable } from '@/components/data-table';
import { ClickableCell } from './clickable-cell';
import { toast } from 'sonner';
import {
	reInviteUserAction,
	renewInviteAction,
	acceptInviteByIdAction,
	rejectInviteAction,
	cancelInviteByIdAction,
} from '@/lib/db/membership/invite.actions';
import { Trash2 } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@shadcn/ui/alert-dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { InviteStatus, Role } from '@numio/ai-database';

interface InviteData {
	id: string;
	email: string;
	status: string;
	expiresAt: string;
	createdAt: string;
	// Context data for hover card
	contextName?: string;
	contextType?: string;
	role: Role;
	// User data for conditional button
	hasUser: boolean;
	userProfileId?: string;
	userName?: string;
	// Context IDs for re-invite
	organisationId?: string;
	teamId?: string;
}

interface InvitesTableProps {
	data: InviteData[];
	title: string;
	description?: string;
	state: InviteStatus;
	isCurrentUser?: boolean;
	currentUserProfileId?: string;
}

const getStatusVariant = (status: InviteStatus) => {
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
	isCurrentUser = false,
	currentUserProfileId,
}: InvitesTableProps) {
	const t = useTranslations('common');
	const router = useRouter();
	const [reInvitingId, setReInvitingId] = useState<string | null>(null);
	const [renewingId, setRenewingId] = useState<string | null>(null);
	const [acceptingId, setAcceptingId] = useState<string | null>(null);
	const [rejectingId, setRejectingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [bulkRenewing, setBulkRenewing] = useState(false);
	const [bulkReInviting, setBulkReInviting] = useState(false);
	const [bulkDeleting, setBulkDeleting] = useState(false);

	const handleRenewInvite = async (invite: InviteData) => {
		try {
			setRenewingId(invite.id);
			const result = await renewInviteAction(invite.id);
			if (result.isSuccess) {
				toast.success('Invite renewed successfully', {
					id: `renew-${invite.id}`,
				});
				// Refresh the current route to re-fetch data
				router.refresh();
			} else {
				toast.error(result.message || 'Failed to renew invite', {
					id: `renew-error-${invite.id}`,
				});
			}
		} catch {
			toast.error('An unexpected error occurred', {
				id: `renew-error-${invite.id}`,
			});
		} finally {
			setRenewingId(null);
		}
	};

	const handleReInvite = async (invite: InviteData) => {
		try {
			setReInvitingId(invite.id);
			const result = await reInviteUserAction({
				email: invite.email,
				organisationId: invite.organisationId,
				teamId: invite.teamId,
				role: invite.role as 'owner' | 'member',
			});
			if (result.isSuccess) {
				toast.success(`Re-invite sent to ${invite.email}`, {
					id: `reinvite-${invite.id}`,
				});
				// Refresh the current route to re-fetch data
				router.refresh();
			} else {
				toast.error(result.message || 'Failed to send re-invite', {
					id: `reinvite-error-${invite.id}`,
				});
			}
		} catch {
			toast.error('An unexpected error occurred', {
				id: `reinvite-error-${invite.id}`,
			});
		} finally {
			setReInvitingId(null);
		}
	};

	const handleAcceptInvite = async (invite: InviteData) => {
		if (!currentUserProfileId) {
			toast.error('User profile not found');
			return;
		}

		try {
			setAcceptingId(invite.id);
			const result = await acceptInviteByIdAction({
				inviteId: invite.id,
				userProfileId: currentUserProfileId,
			});
			if (result.isSuccess) {
				toast.success('Invite accepted successfully');
				// Refresh the current route to re-fetch data
				router.refresh();
			} else {
				toast.error(result.message || 'Failed to accept invite');
			}
		} catch {
			toast.error('An unexpected error occurred');
		} finally {
			setAcceptingId(null);
		}
	};

	const handleRejectInvite = async (invite: InviteData) => {
		if (!currentUserProfileId) {
			toast.error('User profile not found');
			return;
		}

		try {
			setRejectingId(invite.id);
			const result = await rejectInviteAction({ inviteId: invite.id });
			if (result.isSuccess) {
				toast.success('Invite rejected successfully');
				// Refresh the current route to re-fetch data
				router.refresh();
			} else {
				toast.error(result.message || 'Failed to reject invite');
			}
		} catch {
			toast.error('An unexpected error occurred');
		} finally {
			setRejectingId(null);
		}
	};

	const handleDeleteInvite = async (invite: InviteData) => {
		try {
			setDeletingId(invite.id);
			const result = await cancelInviteByIdAction(invite.id);
			if (result.isSuccess) {
				toast.success('Invite cancelled');
				// Refresh the current route to re-fetch data
				router.refresh();
			} else {
				toast.error(result.message || 'Failed to cancel invite');
			}
		} catch {
			toast.error('An unexpected error occurred');
		} finally {
			setDeletingId(null);
		}
	};

	// Bulk action handlers
	const handleBulkRenew = async (
		selectedRows: Row<InviteData>[],
		table: ReturnType<typeof useReactTable<InviteData>>
	) => {
		try {
			setBulkRenewing(true);
			const pendingInvites = selectedRows.filter(
				(row) => row.original.status === 'pending'
			);

			if (pendingInvites.length === 0) {
				toast.error('No pending invites selected for renewal');
				return;
			}

			const results = await Promise.allSettled(
				pendingInvites.map((row) => renewInviteAction(row.original.id))
			);

			const successCount = results.filter(
				(result) => result.status === 'fulfilled' && result.value.isSuccess
			).length;

			if (successCount > 0) {
				toast.success(`Successfully renewed ${successCount} invite(s)`);
				// Clear row selection before refreshing
				table.toggleAllPageRowsSelected(false);
				router.refresh();
			} else {
				toast.error('Failed to renew any invites');
			}
		} catch {
			toast.error('An unexpected error occurred');
		} finally {
			setBulkRenewing(false);
		}
	};

	const handleBulkReInvite = async (
		selectedRows: Row<InviteData>[],
		table: ReturnType<typeof useReactTable<InviteData>>
	) => {
		try {
			setBulkReInviting(true);
			const expiredInvites = selectedRows.filter(
				(row) => row.original.status === 'expired'
			);

			if (expiredInvites.length === 0) {
				toast.error('No expired invites selected for re-invite');
				return;
			}

			const results = await Promise.allSettled(
				expiredInvites.map((row) =>
					reInviteUserAction({
						email: row.original.email,
						organisationId: row.original.organisationId,
						teamId: row.original.teamId,
						role: row.original.role as 'owner' | 'member',
					})
				)
			);

			const successCount = results.filter(
				(result) => result.status === 'fulfilled' && result.value.isSuccess
			).length;

			if (successCount > 0) {
				toast.success(`Successfully re-invited ${successCount} user(s)`);
				// Clear row selection before refreshing
				table.toggleAllPageRowsSelected(false);
				router.refresh();
			} else {
				toast.error('Failed to re-invite any users');
			}
		} catch {
			toast.error('An unexpected error occurred');
		} finally {
			setBulkReInviting(false);
		}
	};

	const handleBulkDelete = async (
		selectedRows: Row<InviteData>[],
		table: ReturnType<typeof useReactTable<InviteData>>
	) => {
		try {
			setBulkDeleting(true);
			const results = await Promise.allSettled(
				selectedRows.map((row) => cancelInviteByIdAction(row.original.id))
			);

			const successCount = results.filter(
				(result) => result.status === 'fulfilled' && result.value.isSuccess
			).length;

			if (successCount > 0) {
				toast.success(`Successfully deleted ${successCount} invite(s)`);
				// Clear row selection before refreshing
				table.toggleAllPageRowsSelected(false);
				router.refresh();
			} else {
				toast.error('Failed to delete any invites');
			}
		} catch {
			toast.error('An unexpected error occurred');
		} finally {
			setBulkDeleting(false);
		}
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return formatDistanceToNow(date, { addSuffix: true });
		} catch {
			return 'Invalid date';
		}
	};

	const formatFullDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return format(date, 'MMM d, yyyy');
		} catch {
			return 'Invalid date';
		}
	};

	const getInviteDescription = (invite: InviteData) => {
		return `**${invite.email}** is invited to the ${invite.contextType?.toLowerCase() || 'context'} **${invite.contextName || 'Unknown'}** as **${invite.role}**.`;
	};

	const columns: ColumnDef<InviteData>[] = [
		{
			id: 'select',
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && 'indeterminate')
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: 'email',
			header: 'User',
			enableSorting: true,
			enableColumnFilter: true,
			filterFn: (row, id, value) => {
				const email = row.getValue(id) as string;
				const userName = row.original.userName;
				const searchValue = value.toLowerCase();

				return (
					email.toLowerCase().includes(searchValue) ||
					(userName ? userName.toLowerCase().includes(searchValue) : false)
				);
			},
			cell: ({ row }: { row: Row<InviteData> }) => {
				const invite = row.original;

				// If there's a user profile, show name and make it clickable
				if (invite.hasUser && invite.userProfileId && invite.userName) {
					return (
						<ClickableCell href={`/user/${invite.userProfileId}`}>
							{invite.userName}
						</ClickableCell>
					);
				}

				// Otherwise show email as non-clickable text
				return <div className="text-foreground">{invite.email}</div>;
			},
		},
		{
			accessorKey: 'status',
			header: 'Status',
			enableSorting: true,
			cell: ({ row }: { row: Row<InviteData> }) => (
				<Badge variant={getStatusVariant(row.original.status as InviteStatus)}>
					{row.original.status}
				</Badge>
			),
		},
		{
			accessorKey: 'expiresAt',
			header: 'Expires',
			enableSorting: true,
			cell: ({ row }: { row: Row<InviteData> }) =>
				formatDate(row.original.expiresAt),
		},

		{
			id: 'actions',
			enableSorting: false,
			cell: ({ row }: { row: Row<InviteData> }) => (
				<div className="flex gap-2">
					{/* Show Accept/Reject buttons for current user viewing their own invites */}
					{isCurrentUser && row.original.status === 'pending' && (
						<>
							<Button
								variant="default"
								size="sm"
								onClick={() => handleAcceptInvite(row.original)}
								disabled={acceptingId === row.original.id}
							>
								{acceptingId === row.original.id ? 'Accepting...' : 'Accept'}
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => handleRejectInvite(row.original)}
								disabled={rejectingId === row.original.id}
							>
								{rejectingId === row.original.id ? 'Rejecting...' : 'Reject'}
							</Button>
						</>
					)}
					{/* Renew button for pending invites (non-current user) */}
					{!isCurrentUser && row.original.status === 'pending' && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleRenewInvite(row.original)}
							disabled={renewingId === row.original.id}
						>
							{renewingId === row.original.id ? 'Renewing...' : 'Renew'}
						</Button>
					)}
					{/* Re-invite button for expired invites */}
					{row.original.status === 'expired' && (
						<Button
							variant="destructive"
							size="sm"
							onClick={() => handleReInvite(row.original)}
							disabled={reInvitingId === row.original.id}
						>
							{reInvitingId === row.original.id ? 'Sending...' : 'Re-invite'}
						</Button>
					)}

					{/* Allow deleting both pending and expired invites */}
					{(row.original.status === 'pending' ||
						row.original.status === 'expired') && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="text-destructive"
									disabled={deletingId === row.original.id}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										{row.original.status === 'pending'
											? 'Cancel invite?'
											: 'Delete expired invite?'}
									</AlertDialogTitle>
									<AlertDialogDescription>
										{row.original.status === 'pending'
											? `This will cancel the pending invite to ${row.original.email}.`
											: `This will permanently delete the expired invite for ${row.original.email}.`}
										<br />
										<br />
										<strong>Invite details:</strong>
										<br />
										{getInviteDescription(row.original)}
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>{t('close')}</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => handleDeleteInvite(row.original)}
									>
										{row.original.status === 'pending'
											? 'Cancel invite'
											: 'Delete invite'}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</div>
			),
		},
	];

	// Bulk actions component
	const BulkActions = ({
		table,
	}: {
		table: ReturnType<typeof useReactTable<InviteData>>;
	}) => {
		if (!table) return null;

		const selectedRows = table.getFilteredSelectedRowModel().rows;

		if (selectedRows.length === 0) return null;

		const pendingCount = selectedRows.filter(
			(row: Row<InviteData>) => row.original.status === 'pending'
		).length;

		const expiredCount = selectedRows.filter(
			(row: Row<InviteData>) => row.original.status === 'expired'
		).length;

		return (
			<>
				{pendingCount > 0 && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleBulkRenew(selectedRows, table)}
						disabled={bulkRenewing}
					>
						{bulkRenewing ? 'Renewing...' : `Renew ${pendingCount}`}
					</Button>
				)}
				{expiredCount > 0 && (
					<Button
						variant="destructive"
						size="sm"
						onClick={() => handleBulkReInvite(selectedRows, table)}
						disabled={bulkReInviting}
					>
						{bulkReInviting ? 'Re-inviting...' : `Re-invite ${expiredCount}`}
					</Button>
				)}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => handleBulkDelete(selectedRows, table)}
					disabled={bulkDeleting}
					className="text-destructive"
				>
					{bulkDeleting ? 'Deleting...' : `Delete ${selectedRows.length}`}
				</Button>
			</>
		);
	};

	// Custom row renderer with hover card
	const customRowRenderer = (
		row: Row<InviteData>,
		children: React.ReactNode
	) => {
		const invite = row.original;

		return (
			<HoverCard key={invite.id}>
				<HoverCardTrigger asChild>{children}</HoverCardTrigger>
				<HoverCardContent className="w-80">
					<div className="space-y-2">
						<p className="text-sm">
							<span className="font-bold">{invite.email}</span> is invited to
							the{' '}
							<span className="font-bold">
								{invite.contextName || 'Unknown'}
							</span>{' '}
							{invite.contextType?.toLowerCase() || 'context'} as{' '}
							<span className="font-bold">{invite.role}</span>.
						</p>
						<div className="text-muted-foreground text-xs">
							<p>Email: {invite.email}</p>
							<p>Role: {invite.role}</p>
							<p>Status: {invite.status}</p>
							<p>Expires: {formatFullDate(invite.expiresAt)}</p>
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>
		);
	};

	return (
		<DataTable
			columns={columns}
			data={data}
			title={title}
			description={description}
			searchKey="email"
			searchPlaceholder="Search by email or name..."
			bulkActions={
				<BulkActions
					table={
						null as unknown as ReturnType<typeof useReactTable<InviteData>>
					}
				/>
			}
			customRowRenderer={customRowRenderer}
			stretchColumn="email"
		/>
	);
}
