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
import { useTranslations } from 'next-intl';

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
	const t = useTranslations('common');

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
						<Button variant="outline">{t('cancel')}</Button>
					</DialogClose>
					<Button variant="destructive" onClick={onConfirm}>
						{t('remove')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
