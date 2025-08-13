'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@shadcn/ui/form';
import { Input } from '@shadcn/ui/input';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

const renameCaseSchema = z.object({
	title: z.string().min(1, 'Title is required'),
});

type RenameCaseFormData = z.infer<typeof renameCaseSchema>;

interface RenameCaseDialogProps {
	caseId: string;
	currentTitle: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export default function RenameCaseDialog({
	currentTitle,
	open: controlledOpen,
	onOpenChange,
}: RenameCaseDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen ?? internalOpen;
	const setOpen = onOpenChange ?? setInternalOpen;
	const [pending, setPending] = useState(false);

	const form = useForm<RenameCaseFormData>({
		resolver: zodResolver(renameCaseSchema),
		defaultValues: {
			title: currentTitle,
		},
	});

	const onSubmit = async () => {
		setPending(true);
		try {
			// TODO: Implement rename case action
			// const result = await renameCaseAction(caseId, data.title);
			// if (result.isSuccess) {
			// 	toast.success('Case renamed successfully');
			// 	setOpen(false);
			// } else {
			// 	toast.error(result.message || 'Failed to rename case');
			// }

			// Temporary placeholder
			toast.success('Case renamed successfully');
			setOpen(false);
		} catch {
			toast.error('Failed to rename case');
		} finally {
			setPending(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Edit className="mr-2 h-4 w-4" />
					Rename
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename Case</DialogTitle>
					<DialogDescription>Update the case title below.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={pending}>
								{pending ? 'Renaming...' : 'Rename Case'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
