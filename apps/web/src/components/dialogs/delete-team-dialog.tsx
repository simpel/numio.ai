'use client';

import { useState } from 'react';
import { Button } from '@shadcn/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@shadcn/ui/dialog';
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DeleteTeamDialogProps {
	teamId: string;
	teamName: string;
}

export default function DeleteTeamDialog({
	teamId,
	teamName,
}: DeleteTeamDialogProps) {
	const [open, setOpen] = useState(false);
	const [confirmationText, setConfirmationText] = useState('');
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		if (confirmationText !== teamName) {
			toast.error('Team name does not match');
			return;
		}

		setIsDeleting(true);
		try {
			// TODO: Implement delete team action
			// const result = await deleteTeamAction(teamId);
			// if (result.isSuccess) {
			// 	toast.success('Team deleted successfully');
			// 	router.push('/teams');
			// } else {
			// 	toast.error(result.message || 'Failed to delete team');
			// }

			// Temporary placeholder
			toast.success('Team deleted successfully');
			router.push('/teams');
		} catch (error) {
			console.error('Delete team error:', error);
			toast.error('Failed to delete team');
		} finally {
			setIsDeleting(false);
			setOpen(false);
			setConfirmationText('');
		}
	};

	const isConfirmButtonDisabled = confirmationText !== teamName || isDeleting;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="destructive" size="sm">
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Team
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Delete Team</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will permanently delete the team{' '}
						<strong>{teamName}</strong> and all associated data.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="confirmation">
							Please type <strong>{teamName}</strong> to confirm
						</Label>
						<Input
							id="confirmation"
							value={confirmationText}
							onChange={(e) => setConfirmationText(e.target.value)}
							placeholder="Enter team name to confirm"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isDeleting}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isConfirmButtonDisabled}
					>
						{isDeleting ? 'Deleting...' : 'Delete Team'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
