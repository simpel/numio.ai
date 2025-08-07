'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@shadcn/ui/badge';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';

interface MembershipData {
	id: string;
	name: string;
	type: string;
	role: string;
	organisation?: string;
	organisationId?: string;
	teamId?: string;
	createdAt: string;
}

interface MembershipsTableProps {
	data: MembershipData[];
	title: string;
	description?: string;
}

export default function MembershipsTable({
	data,
	title,
	description,
}: MembershipsTableProps) {
	const columns: ColumnDef<MembershipData>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			enableSorting: true,
			cell: ({ row }: { row: any }) => {
				const membership = row.original;
				let href = '';

				// Determine the correct link based on membership type
				if (
					membership.type.toLowerCase() === 'organisation' ||
					membership.type.toLowerCase() === 'organization'
				) {
					href = `/organisation/${membership.organisationId || membership.id}`;
				} else if (membership.type.toLowerCase() === 'team') {
					href = `/team/${membership.teamId || membership.id}`;
				} else {
					// Default to user profile if type is unknown
					href = `/user/${membership.id}`;
				}

				return (
					<ClickableCell href={href}>
						<div className="font-medium">{membership.name}</div>
					</ClickableCell>
				);
			},
		},
		{
			accessorKey: 'type',
			header: 'Type',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<Badge variant="outline">{row.original.type}</Badge>
			),
		},
		{
			accessorKey: 'role',
			header: 'Role',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<Badge variant="secondary">{row.original.role}</Badge>
			),
		},
		{
			accessorKey: 'organisation',
			header: 'Organization',
			enableSorting: true,
			cell: ({ row }: { row: any }) => {
				const membership = row.original;
				if (membership.organisation && membership.organisationId) {
					return (
						<ClickableCell href={`/organisation/${membership.organisationId}`}>
							<div className="text-muted-foreground text-sm">
								{membership.organisation}
							</div>
						</ClickableCell>
					);
				}
				return (
					<div className="text-muted-foreground text-sm">
						{membership.organisation || '-'}
					</div>
				);
			},
		},
		{
			accessorKey: 'createdAt',
			header: 'Member Since',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<div className="text-muted-foreground text-sm">
					{new Date(row.original.createdAt).toLocaleDateString()}
				</div>
			),
		},
	];

	return (
		<DataTable
			columns={columns}
			data={data}
			title={title}
			description={description}
			searchKey="name"
			searchPlaceholder="Search memberships..."
		/>
	);
}
