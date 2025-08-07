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
import { toast } from 'sonner';
import { updateCaseAction } from '@src/lib/db/case/case.actions';

interface RenameCaseDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	caseId: string;
	currentTitle: string;
}

export default function RenameCaseDialog({
	open,
	onOpenChange,
	caseId,
	currentTitle,
}: RenameCaseDialogProps) {
	const [title, setTitle] = useState(currentTitle);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setTitle(currentTitle);
	}, [currentTitle, open]);

	const handleSubmit = async () => {
		if (!title || title.trim().length === 0) {
			toast.error('Please enter a name');
			return;
		}
		try {
			setIsSubmitting(true);
			const res = await updateCaseAction(caseId, { title });
			if (res.isSuccess) {
				toast.success('Case renamed');
				onOpenChange(false);
				window.location.reload();
			} else {
				toast.error(res.message || 'Failed to rename case');
			}
		} catch (e) {
			toast.error('Failed to rename case');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename case</DialogTitle>
					<DialogDescription>Change the case title.</DialogDescription>
				</DialogHeader>

				<div className="space-y-2">
					<Label htmlFor="case-title">Title</Label>
					<Input
						id="case-title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Enter a new case title"
					/>
				</div>

				<DialogFooter className="gap-2">
					<DialogClose asChild>
						<Button variant="outline" disabled={isSubmitting}>
							Cancel
						</Button>
					</DialogClose>
					<Button onClick={handleSubmit} disabled={isSubmitting}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
