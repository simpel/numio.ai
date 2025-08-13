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
import { Textarea } from '@shadcn/ui/textarea';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

const editTeamSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
});

type EditTeamFormData = z.infer<typeof editTeamSchema>;

interface EditTeamDialogProps {
	team: {
		id: string;
		name: string;
		description?: string | null;
	};
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export default function EditTeamDialog({ 
	team, 
	open: controlledOpen, 
	onOpenChange 
}: EditTeamDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen ?? internalOpen;
	const setOpen = onOpenChange ?? setInternalOpen;
	const [pending, setPending] = useState(false);

	const form = useForm<EditTeamFormData>({
		resolver: zodResolver(editTeamSchema),
		defaultValues: {
			name: team.name,
			description: team.description || '',
		},
	});

	const onSubmit = async () => {
		setPending(true);
		try {
			// TODO: Implement update team action
			// const result = await updateTeamAction(team.id, data);
			// if (result.isSuccess) {
			// 	toast.success('Team updated successfully');
			// 	setOpen(false);
			// } else {
			// 	toast.error(result.message || 'Failed to update team');
			// }

			// Temporary placeholder
			toast.success('Team updated successfully');
			setOpen(false);
		} catch {
			toast.error('Failed to update team');
		} finally {
			setPending(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Edit className="mr-2 h-4 w-4" />
					Edit Team
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Team</DialogTitle>
					<DialogDescription>
						Update the team information below.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea {...field} />
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
								{pending ? 'Updating...' : 'Update Team'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
