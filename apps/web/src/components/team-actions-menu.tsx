'use client';

import { useState } from 'react';
import { Button } from '@shadcn/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@shadcn/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import EditTeamDialog from '@src/components/dialogs/edit-team-dialog';

interface TeamActionsMenuProps {
	teamId: string;
	teamName: string;
	teamDescription: string | null;
}

export default function TeamActionsMenu({
	teamId,
	teamName,
	teamDescription,
}: TeamActionsMenuProps) {
	const t = useTranslations('common');
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="icon">
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
						{t('edit_details')}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<EditTeamDialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				team={{
					id: teamId,
					name: teamName,
					description: teamDescription,
				}}
			/>
		</>
	);
}
