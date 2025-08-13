'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Badge } from '@shadcn/ui/badge';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';
import {
	CaseState,
	getAvailableTransitions,
	getStateDisplayName,
} from '@src/lib/state-machines/case-state-machine';
import { updateCaseStateAction } from '@src/lib/db/case/case.actions';
import { toast } from 'sonner';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@shadcn/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import RenameCaseDialog from '@src/components/dialogs/rename-case-dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn/ui/tooltip';

interface CaseData {
	id: string;
	title: string;
	description?: string;
	client?: string;
	clientId?: string;
	status?: string;
	state?: string;
	createdAt: string;
	updatedAt?: string;
}

interface CasesTableProps {
	data: CaseData[];
	title: string;
	description?: string;
	showClient?: boolean;
}

export default function CasesTable({
	data,
	title,
	description,
	showClient = true,
}: CasesTableProps) {
	const router = useRouter();
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [selectedCase, setSelectedCase] = useState<{ id: string; title: string } | null>(null);
	const handleStateChange = async (caseId: string, newState: string) => {
		try {
			const result = await updateCaseStateAction(
				caseId,
				newState as 'created' | 'active' | 'on_hold' | 'completed' | 'closed'
			);
			if (result.isSuccess) {
				toast.success('Case state updated successfully');
				// Refresh the current route to re-fetch data
				router.refresh();
			} else {
				toast.error(result.message || 'Failed to update case state');
			}
		} catch (error) {
			console.error('State change error:', error);
			toast.error('Failed to update case state');
		}
	};

	const getStateOptions = (currentState: string) => {
		try {
			const availableTransitions = getAvailableTransitions(
				currentState as CaseState
			);
			return availableTransitions.map((state) => ({
				value: state,
				label: getStateDisplayName(state),
				color: '', // No longer used
			}));
		} catch (error) {
			console.error('Error getting state options:', error);
			return [];
		}
	};

	const getStateBadgeVariant = (state: string) => {
		switch (state) {
			case 'created':
				return 'outline';
			case 'active':
				return 'default';
			case 'on_hold':
				return 'outline';
			case 'completed':
				return 'outline';
			case 'closed':
				return 'secondary';
			default:
				return 'secondary';
		}
	};

	const getStateBadgeClassName = (state: string) => {
		switch (state) {
			case 'created':
				return 'border-blue-500 text-blue-700 bg-blue-50';
			case 'on_hold':
				return 'border-red-500 text-red-700 bg-red-50';
			case 'completed':
				return 'border-green-500 text-green-700 bg-green-50';
			default:
				return '';
		}
	};

	// Ensure data is always an array
	const safeData = React.useMemo(() => {
		if (!Array.isArray(data)) {
			console.warn('CasesTable: data prop is not an array, using empty array');
			return [];
		}
		// Log the first item to debug the data structure
		if (data.length > 0) {
			console.log('CasesTable: First data item:', data[0]);
		}
		return data;
	}, [data]);

	const columns: ColumnDef<CaseData>[] = [
		{
			accessorKey: 'updatedAt',
			header: 'Last Changed',
			enableSorting: true,
			cell: ({ row }: { row: Row<CaseData> }) => {
				const v = row.original.updatedAt;
				if (!v) return <div className="text-muted-foreground">—</div>;
				const d = new Date(v);
				const rel = formatDistanceToNow(d, { addSuffix: true });
				const exact = format(d, 'PPpp');
				return (
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="text-muted-foreground text-sm">{rel}</div>
						</TooltipTrigger>
						<TooltipContent>{exact}</TooltipContent>
					</Tooltip>
				);
			},
		},
		{
			accessorKey: 'status',
			header: 'Status',
			enableSorting: true,
			cell: ({ row }: { row: Row<CaseData> }) => {
				const currentState = row.original.state || 'created';
				return (
					<Badge
						variant={getStateBadgeVariant(currentState)}
						className={getStateBadgeClassName(currentState)}
					>
						{getStateDisplayName(currentState as CaseState)}
					</Badge>
				);
			},
		},
		{
			accessorKey: 'title',
			header: 'Case',
			enableSorting: true,
			cell: ({ row }: { row: Row<CaseData> }) => (
				<div className="space-y-1">
					<ClickableCell href={`/case/${row.original.id}`}>
						{row.original.title}
					</ClickableCell>
					<div className="text-muted-foreground max-w-xs truncate text-sm">
						{row.original.description || 'No description'}
					</div>
				</div>
			),
		},

		...(showClient
			? [
					{
						accessorKey: 'client',
						header: 'Client',
						enableSorting: true,
						cell: ({ row }: { row: Row<CaseData> }) => {
							if (row.original.client && row.original.clientId) {
								return (
									<ClickableCell href={`/client/${row.original.clientId}`}>
										{row.original.client}
									</ClickableCell>
								);
							}
							return <div>{row.original.client || '-'}</div>;
						},
					},
				]
			: []),
		{
			id: 'actions',
			header: '',
			enableSorting: false,
			cell: ({ row }: { row: Row<CaseData> }) => {
				const currentState = row.original.state || 'created';
				const stateOptions = getStateOptions(currentState);
				return (
					<div className="flex justify-end">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-md">
									<MoreHorizontal className="h-4 w-4" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>Change state</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										<DropdownMenuRadioGroup
											value={currentState}
											onValueChange={(val) =>
												handleStateChange(row.original.id, val)
											}
										>
											{stateOptions.map((opt) => (
												<DropdownMenuRadioItem
													key={opt.value}
													value={opt.value}
												>
													{opt.label}
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuSubContent>
								</DropdownMenuSub>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => {
									setSelectedCase({ id: row.original.id, title: row.original.title });
									setRenameDialogOpen(true);
								}}>
									Rename…
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{selectedCase && (
							<RenameCaseDialog
								open={renameDialogOpen}
								onOpenChange={setRenameDialogOpen}
								caseId={selectedCase.id}
								currentTitle={selectedCase.title}
							/>
						)}
					</div>
				);
			},
		},
	];

	return (
		<DataTable
			columns={columns}
			data={safeData}
			title={title}
			description={description}
			searchKey="title"
			searchPlaceholder="Search cases..."
			initialSorting={[
				{
					id: 'updatedAt',
					desc: true,
				},
			]}
		/>
	);
}
