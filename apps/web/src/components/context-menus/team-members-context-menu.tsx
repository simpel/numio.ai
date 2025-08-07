'use client';

import { ContextMenuItem, ContextMenuSeparator } from '@shadcn/ui/context-menu';
import BaseContextMenu from './base-context-menu';

interface TeamMemberData {
	id: string;
	membershipId: string;
	name: string;
	email: string;
	role: string;
}

interface TeamMembersContextMenuProps {
	children: React.ReactNode;
	rowData?: TeamMemberData;
	onChangeRole: (membershipId: string, newRole: string) => void;
	onRemoveMember: (membershipId: string) => void;
}

export default function TeamMembersContextMenu({
	children,
	rowData,
	onChangeRole,
	onRemoveMember,
}: TeamMembersContextMenuProps) {
	const memberData = rowData as TeamMemberData;
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
				{!isOwner && (
					<ContextMenuItem
						onClick={() => onRemoveMember(memberData.membershipId)}
						className="text-destructive"
					>
						Remove from team
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
