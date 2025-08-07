'use client';

import { ContextMenuItem, ContextMenuSeparator } from '@shadcn/ui/context-menu';
import BaseContextMenu from './base-context-menu';

interface OrganizationMemberData {
	id: string;
	membershipId: string;
	name: string;
	email: string;
	role: string;
}

interface OrganizationMembersContextMenuProps {
	children: React.ReactNode;
	rowData?: OrganizationMemberData;
	onChangeRole: (membershipId: string, newRole: string) => void;
	onRemoveMember: (membershipId: string) => void;
	onInviteToTeam: (memberId: string) => void;
}

export default function OrganizationMembersContextMenu({
	children,
	rowData,
	onChangeRole,
	onRemoveMember,
	onInviteToTeam,
}: OrganizationMembersContextMenuProps) {
	const memberData = rowData as OrganizationMemberData;
	const isOwner = memberData?.role === 'owner';

	const additionalItems = () => {
		if (!memberData) return null;

		return (
			<>
				<ContextMenuItem className="text-muted-foreground font-semibold">
					Role
				</ContextMenuItem>
				<ContextMenuItem
					onClick={() => onChangeRole(memberData.membershipId, 'member')}
				>
					Member
				</ContextMenuItem>
				<ContextMenuItem
					onClick={() => onChangeRole(memberData.membershipId, 'admin')}
				>
					Admin
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem className="text-muted-foreground font-semibold">
					Actions
				</ContextMenuItem>
				<ContextMenuItem onClick={() => onInviteToTeam(memberData.id)}>
					Invite to Team
				</ContextMenuItem>
				{!isOwner && (
					<ContextMenuItem
						onClick={() => onRemoveMember(memberData.membershipId)}
						className="text-destructive"
					>
						Remove from organization
					</ContextMenuItem>
				)}
			</>
		);
	};

	return (
		<BaseContextMenu additionalItems={additionalItems} rowData={rowData}>
			{children}
		</BaseContextMenu>
	);
}
