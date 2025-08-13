'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteTeamDialogProps {
	teamId: string;
	teamName: string;
}

export default function DeleteTeamDialog({ teamName }: DeleteTeamDialogProps) {
	const [open, setOpen] = useState(false);
	const [pending, setPending] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		setPending(true);
		try {
			// TODO: Implement delete team action
			toast.success('Team deleted successfully');
			setOpen(false);
			router.push('/teams');
		} catch {
			toast.error('Failed to delete team');
		} finally {
			setPending(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="destructive" size="sm">
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Team
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Team</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete &quot;{teamName}&quot;? This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={pending}
					>
						{pending ? 'Deleting...' : 'Delete Team'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
