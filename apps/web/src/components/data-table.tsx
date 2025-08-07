'use client';

import * as React from 'react';
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';

import { Button } from '@shadcn/ui/button';
import { Input } from '@shadcn/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@shadcn/ui/table';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import BaseContextMenu from './context-menus/base-context-menu';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	title: string;
	description?: string;
	searchKey?: string;
	searchPlaceholder?: string;
	pagination?: number;
	initialSorting?: SortingState;
	contextMenu?: {
		additionalItems?: React.ReactNode | ((row: any) => React.ReactNode);
	};
}

export function DataTable<TData, TValue>({
	columns,
	data,
	title,
	description,
	searchKey,
	searchPlaceholder = 'Search...',
	pagination = 10,
	initialSorting = [],
	contextMenu,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});

	// Ensure data is always an array
	const safeData = React.useMemo(() => {
		if (!Array.isArray(data)) {
			console.warn('DataTable: data prop is not an array, using empty array');
			return [];
		}
		return data;
	}, [data]);

	const table = useReactTable({
		data: safeData,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		// Enable sorting removal by default (none -> desc -> asc -> none)
		enableSortingRemoval: true,
		// Enable multi-sorting with Shift key
		enableMultiSort: true,
		// Allow up to 3 columns to be sorted at once
		maxMultiSortColCount: 3,
		// Set initial page size
		initialState: {
			pagination: {
				pageSize: pagination,
			},
		},
	});

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">{title}</h2>
					{description && (
						<p className="text-muted-foreground">{description}</p>
					)}
				</div>

				{/* Search */}
				{searchKey && (
					<div className="flex items-center py-4">
						<Input
							placeholder={searchPlaceholder}
							value={
								(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
							}
							onChange={(event) =>
								table.getColumn(searchKey)?.setFilterValue(event.target.value)
							}
							className="max-w-sm"
						/>
					</div>
				)}
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder ? null : header.column.getCanSort() ? (
												<SortableColumnHeader column={header.column}>
													{flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
												</SortableColumnHeader>
											) : (
												flexRender(
													header.column.columnDef.header,
													header.getContext()
												)
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => {
								const rowData = row.original as any;

								return contextMenu ? (
									<BaseContextMenu
										key={row.id}
										additionalItems={contextMenu.additionalItems}
										rowData={rowData}
									>
										<TableRow
											data-state={row.getIsSelected() && 'selected'}
											className="cursor-context-menu"
										>
											{row.getVisibleCells().map((cell, index) => {
												const isLastColumn =
													index === row.getVisibleCells().length - 1;
												return (
													<TableCell
														key={cell.id}
														className={
															isLastColumn
																? 'bg-background sticky right-0 text-right'
																: ''
														}
													>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext()
														)}
													</TableCell>
												);
											})}
										</TableRow>
									</BaseContextMenu>
								) : (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && 'selected'}
									>
										{row.getVisibleCells().map((cell, index) => {
											const isLastColumn =
												index === row.getVisibleCells().length - 1;
											return (
												<TableCell
													key={cell.id}
													className={
														isLastColumn ? 'sticky right-0 text-right' : ''
													}
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</TableCell>
											);
										})}
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{/* Only show pagination and selection info if pagination is needed */}
			{table.getPageCount() > 1 && (
				<div className="flex items-center justify-end space-x-2 py-4">
					<div className="text-muted-foreground flex-1 text-sm">
						Showing{' '}
						{table.getState().pagination.pageIndex *
							table.getState().pagination.pageSize +
							1}
						-
						{Math.min(
							(table.getState().pagination.pageIndex + 1) *
								table.getState().pagination.pageSize,
							table.getFilteredRowModel().rows.length
						)}{' '}
						of {table.getFilteredRowModel().rows.length} results
					</div>
					<div className="space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

// Sortable column header component following TanStack Table v8 best practices
export function SortableColumnHeader({
	column,
	children,
}: {
	column: any;
	children: React.ReactNode;
}) {
	const isSorted = column.getIsSorted();
	const canSort = column.getCanSort();

	return (
		<div
			className={`flex items-center space-x-1 ${
				canSort ? 'cursor-pointer select-none' : ''
			}`}
			onClick={canSort ? column.getToggleSortingHandler() : undefined}
		>
			{children}
			{canSort && (
				<div className="flex flex-col">
					{isSorted === 'asc' ? (
						<ChevronUp className="h-3 w-3" />
					) : isSorted === 'desc' ? (
						<ChevronDown className="h-3 w-3" />
					) : (
						<ChevronsUpDown className="h-3 w-3" />
					)}
				</div>
			)}
		</div>
	);
}
