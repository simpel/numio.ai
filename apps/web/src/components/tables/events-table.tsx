'use client';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Badge } from '@shadcn/ui/badge';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';

interface EventData {
	id: string;
	type: string;
	occurredAt: string;
	metadata?: Record<string, unknown>;
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
			cell: ({ row }: { row: Row<EventData> }) => (
				<ClickableCell href={`/event/${row.original.id}`}>
					<Badge variant="outline">{row.original.type}</Badge>
				</ClickableCell>
			),
		},
		{
			accessorKey: 'occurredAt',
			header: 'Occurred At',
			enableSorting: true,
			cell: ({ row }: { row: Row<EventData> }) => (
				<div className="text-muted-foreground text-sm">
					{new Date(row.original.occurredAt).toLocaleString()}
				</div>
			),
		},
		{
			accessorKey: 'metadata',
			header: 'Details',
			enableSorting: false,
			cell: ({ row }: { row: Row<EventData> }) => {
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
