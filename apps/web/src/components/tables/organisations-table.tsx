'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@shadcn/ui/button';
import { Badge } from '@shadcn/ui/badge';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';

interface OrganisationData {
	id: string;
	name: string;
	role: string;
	memberSince?: string;
	organisationId?: string;
}

interface OrganisationsTableProps {
	data: OrganisationData[];
	title: string;
	description?: string;
	showActions?: boolean;
	showMemberSince?: boolean;
}

export default function OrganisationsTable({
	data,
	title,
	description,
	showActions = true,
	showMemberSince = true,
}: OrganisationsTableProps) {
	const columns: ColumnDef<OrganisationData>[] = [
		{
			accessorKey: 'name',
			header: 'Organization Name',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<ClickableCell
					href={`/organisation/${row.original.organisationId || row.original.id}`}
				>
					{row.original.name}
				</ClickableCell>
			),
		},
		{
			accessorKey: 'role',
			header: 'Role',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<Badge variant="outline">{row.original.role}</Badge>
			),
		},
		...(showMemberSince
			? [
					{
						accessorKey: 'memberSince',
						header: 'Member Since',
						enableSorting: true,
					},
				]
			: []),
		...(showActions
			? [
					{
						id: 'actions',
						enableSorting: false,
						cell: ({ row }: { row: any }) => (
							<Button asChild variant="outline" size="sm">
								<Link
									href={`/organisation/${row.original.organisationId || row.original.id}`}
								>
									View Details
								</Link>
							</Button>
						),
					},
				]
			: []),
	];

	return (
		<DataTable
			columns={columns}
			data={data}
			title={title}
			description={description}
			searchKey="name"
			searchPlaceholder="Search organizations..."
		/>
	);
}
