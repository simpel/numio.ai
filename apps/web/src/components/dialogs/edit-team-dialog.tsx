'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import { Textarea } from '@shadcn/ui/textarea';
import { toast } from 'sonner';
import { updateTeamAction } from '@src/lib/db/team/team.actions';

interface EditTeamDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	teamId: string;
	currentName: string;
	currentDescription: string | null;
}

export default function EditTeamDialog({
	open,
	onOpenChange,
	teamId,
	currentName,
	currentDescription,
}: EditTeamDialogProps) {
	const [name, setName] = useState(currentName);
	const [description, setDescription] = useState(currentDescription || '');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setName(currentName);
		setDescription(currentDescription || '');
	}, [currentName, currentDescription, open]);

	const handleSubmit = async () => {
		if (!name || name.trim().length === 0) {
			toast.error('Please enter a team name');
			return;
		}
		try {
			setIsSubmitting(true);
			const res = await updateTeamAction(teamId, {
				name: name.trim(),
				description: description.trim() || null,
			});
			if (res.isSuccess) {
				toast.success('Team updated successfully');
				onOpenChange(false);
				window.location.reload();
			} else {
				toast.error(res.message || 'Failed to update team');
			}
		} catch (e) {
			toast.error('Failed to update team');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Team Details</DialogTitle>
					<DialogDescription>
						Update the team name and description.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="team-name">Team Name</Label>
						<Input
							id="team-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter team name"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="team-description">Description</Label>
						<Textarea
							id="team-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Enter team description (optional)"
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<DialogClose asChild>
						<Button variant="outline" disabled={isSubmitting}>
							Cancel
						</Button>
					</DialogClose>
					<Button onClick={handleSubmit} disabled={isSubmitting}>
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
