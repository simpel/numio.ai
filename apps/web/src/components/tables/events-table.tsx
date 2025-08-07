'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@shadcn/ui/button';
import { Badge } from '@shadcn/ui/badge';
import { DataTable } from '@src/components/data-table';

interface EventData {
	id: string;
	type: string;
	occurredAt: string;
	metadata?: any;
}

interface EventsTableProps {
	data: EventData[];
	title: string;
	description?: string;
}

export default function EventsTable({
	data,
	title,
	description,
}: EventsTableProps) {
	const columns: ColumnDef<EventData>[] = [
		{
			accessorKey: 'type',
			header: 'Event Type',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<Badge variant="outline">{row.original.type}</Badge>
			),
		},
		{
			accessorKey: 'occurredAt',
			header: 'Occurred At',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<div className="text-muted-foreground text-sm">
					{new Date(row.original.occurredAt).toLocaleString()}
				</div>
			),
		},
		{
			accessorKey: 'metadata',
			header: 'Details',
			enableSorting: false,
			cell: ({ row }: { row: any }) => {
				const metadata = row.original.metadata;
				if (!metadata || Object.keys(metadata).length === 0) {
					return (
						<div className="text-muted-foreground text-sm">No details</div>
					);
				}
				return (
					<div className="text-muted-foreground max-w-xs truncate text-sm">
						{JSON.stringify(metadata)}
					</div>
				);
			},
		},
		{
			id: 'actions',
			enableSorting: false,
			cell: ({ row }: { row: any }) => (
				<Button asChild variant="outline" size="sm">
					<Link href={`/event/${row.original.id}`}>View Details</Link>
				</Button>
			),
		},
	];

	return (
		<DataTable
			columns={columns}
			data={data}
			title={title}
			description={description}
			searchKey="type"
			searchPlaceholder="Search events..."
		/>
	);
}
