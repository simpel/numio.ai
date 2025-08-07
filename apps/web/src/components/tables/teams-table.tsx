'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@shadcn/ui/button';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';

interface TeamData {
	id: string;
	name: string;
	description?: string;
	organisation?: string;
	organisationId?: string;
	owner?: string;
}

interface TeamsTableProps {
	data: TeamData[];
	title: string;
	description?: string;
	showActions?: boolean;
	showDescription?: boolean;
	showOrganisation?: boolean;
	showOwner?: boolean;
}

export default function TeamsTable({
	data,
	title,
	description,
	showActions = true,
	showDescription = true,
	showOrganisation = true,
	showOwner = false,
}: TeamsTableProps) {
	const columns: ColumnDef<TeamData>[] = [
		{
			accessorKey: 'name',
			header: 'Team Name',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<ClickableCell href={`/team/${row.original.id}`}>
					{row.original.name}
				</ClickableCell>
			),
		},
		...(showDescription
			? [
					{
						accessorKey: 'description',
						header: 'Description',
						enableSorting: true,
					},
				]
			: []),
		...(showOrganisation
			? [
					{
						accessorKey: 'organisation',
						header: 'Organization',
						enableSorting: true,
						cell: ({ row }: { row: any }) => {
							// If we have organisation data with ID, make it clickable
							if (row.original.organisationId) {
								return (
									<ClickableCell
										href={`/organisation/${row.original.organisationId}`}
									>
										{row.original.organisation}
									</ClickableCell>
								);
							}
							// Otherwise just show the name
							return <div>{row.original.organisation}</div>;
						},
					},
				]
			: []),
		...(showOwner
			? [
					{
						accessorKey: 'owner',
						header: 'Owner',
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
								<Link href={`/team/${row.original.id}`}>View Details</Link>
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
			searchPlaceholder="Search teams..."
		/>
	);
}
