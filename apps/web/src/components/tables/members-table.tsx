'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@shadcn/ui/badge';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';
import {
	removeTeamMemberAction,
	changeTeamMemberRoleAction,
} from '@src/lib/db/team/team.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from '@shadcn/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import RemoveMemberDialog from '@src/components/dialogs/remove-member-dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn/ui/tooltip';
import { Prisma } from '@numio/ai-database';

type MembershipWithUserProfile = Prisma.MembershipGetPayload<{
	include: {
		memberUserProfile: true;
	};
}>;

interface MembersTableProps {
	data: MembershipWithUserProfile[];
	title: string;
	description?: string;
	showMemberSince?: boolean;
	roleVariant?: 'default' | 'admin' | 'owner';
	teamId?: string;
}

const getRoleVariant = (roleVariant?: 'default' | 'admin' | 'owner') => {
	switch (roleVariant) {
		case 'admin':
			return 'secondary';
		case 'owner':
			return 'default';
		default:
			return 'outline';
	}
};

export default function MembersTable({
	data,
	title,
	description,
	showMemberSince = true,
	roleVariant = 'default',
	teamId,
}: MembersTableProps) {
	const router = useRouter();

	const handleRemoveMember = async (membershipId: string) => {
		if (!teamId) return;

		try {
			const result = await removeTeamMemberAction(teamId, membershipId);
			if (result.isSuccess) {
				toast.success('Team member removed successfully');
				router.refresh();
			} else {
				toast.error(result.message || 'Failed to remove team member');
			}
		} catch (error) {
			console.error('Error removing team member:', error);
			toast.error('Failed to remove team member');
		}
	};

	const handleChangeRole = async (
		membershipId: string,
		newRole: 'owner' | 'member'
	) => {
		if (!teamId) return;

		try {
			const result = await changeTeamMemberRoleAction(
				teamId,
				membershipId,
				newRole
			);
			if (result.isSuccess) {
				toast.success('Team member role updated successfully');
				router.refresh();
			} else {
				toast.error(result.message || 'Failed to update team member role');
			}
		} catch (error) {
			console.error('Error changing team member role:', error);
			toast.error('Failed to update team member role');
		}
	};

	const columns: ColumnDef<MembershipWithUserProfile>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			enableSorting: true,
			cell: ({ row }: { row: { original: MembershipWithUserProfile } }) => {
				const membership = row.original;
				const userProfile = membership.memberUserProfile;
				const name =
					`${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim();
				const userId = userProfile?.id;

				return (
					<ClickableCell href={`/user/${userId}`}>
						{name || userProfile?.email || 'Unknown'}
					</ClickableCell>
				);
			},
		},
		{
			accessorKey: 'email',
			header: 'Email',
			enableSorting: true,
			cell: ({ row }: { row: { original: MembershipWithUserProfile } }) => {
				const membership = row.original;
				const userProfile = membership.memberUserProfile;
				const userId = userProfile?.id;

				return (
					<ClickableCell href={`/user/${userId}`}>
						{userProfile?.email || '—'}
					</ClickableCell>
				);
			},
		},
		{
			accessorKey: 'role',
			header: 'Role',
			enableSorting: true,
			cell: ({ row }: { row: { original: MembershipWithUserProfile } }) => (
				<Badge variant={getRoleVariant(roleVariant)}>{row.original.role}</Badge>
			),
		},
		...(showMemberSince
			? [
					{
						accessorKey: 'createdAt',
						header: 'Member Since',
						enableSorting: true,
						cell: ({
							row,
						}: {
							row: { original: MembershipWithUserProfile };
						}) => {
							const v = row.original.createdAt;
							if (!v) return <div className="text-muted-foreground">—</div>;
							const d = new Date(v);
							const rel = formatDistanceToNow(d, { addSuffix: true });
							const exact = format(d, 'PPpp');
							return (
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="text-muted-foreground text-sm">{rel}</div>
									</TooltipTrigger>
									<TooltipContent>{exact}</TooltipContent>
								</Tooltip>
							);
						},
					},
				]
			: []),
		{
			id: 'actions',
			header: '',
			enableSorting: false,
			cell: ({ row }: { row: { original: MembershipWithUserProfile } }) => (
				<MembersActionsCell
					membership={row.original}
					onChangeRole={(role) => handleChangeRole(row.original.id, role)}
					onRemove={() => handleRemoveMember(row.original.id)}
				/>
			),
		},
	];

	return (
		<DataTable
			columns={columns}
			data={data}
			title={title}
			description={description}
			searchKey="name"
			searchPlaceholder="Search members..."
		/>
	);
}

function MembersActionsCell({
	membership,
	onChangeRole,
	onRemove,
}: {
	membership: MembershipWithUserProfile;
	onChangeRole: (role: 'owner' | 'member') => void;
	onRemove: () => void;
}) {
	const [open, setOpen] = React.useState(false);
	const isOwner = membership.role === 'owner';
	const userProfile = membership.memberUserProfile;
	const memberName =
		`${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() ||
		userProfile?.email ||
		'Unknown';

	return (
		<div className="flex justify-end">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-md">
						<MoreHorizontal className="h-4 w-4" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Change role</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuRadioGroup
								value={membership.role}
								onValueChange={(value) =>
									onChangeRole(value as 'owner' | 'member')
								}
							>
								<DropdownMenuRadioItem value="member">
									Member
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="owner">
									Owner
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
					<DropdownMenuSeparator />
					{!isOwner && (
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => setOpen(true)}
						>
							Remove from team…
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<RemoveMemberDialog
				open={open}
				onOpenChange={setOpen}
				memberName={memberName}
				onConfirm={onRemove}
			/>
		</div>
	);
}
