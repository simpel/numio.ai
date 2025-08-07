'use client';

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from '@shadcn/ui/dialog';
import { Button } from '@shadcn/ui/button';

interface RemoveMemberDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	memberName?: string;
}

export default function RemoveMemberDialog({
	open,
	onOpenChange,
	onConfirm,
	memberName,
}: RemoveMemberDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Remove team member</DialogTitle>
					<DialogDescription>
						Are you sure you want to remove {memberName || 'this user'} from the
						team?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2">
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button variant="destructive" onClick={onConfirm}>
						Remove
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
