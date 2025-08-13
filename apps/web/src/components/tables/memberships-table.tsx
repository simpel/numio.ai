'use client';

import React from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Badge } from '@shadcn/ui/badge';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';
import { formatDistanceToNow, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn/ui/tooltip';

interface MembershipData {
	id: string;
	name: string;
	type: 'organization' | 'team' | 'case';
	role: string;
	createdAt: string;
	href: string;
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
			cell: ({ row }: { row: Row<MembershipData> }) => (
				<ClickableCell href={row.original.href}>
					{row.original.name}
				</ClickableCell>
			),
		},
		{
			accessorKey: 'type',
			header: 'Type',
			enableSorting: true,
			cell: ({ row }: { row: Row<MembershipData> }) => (
				<Badge variant={'outline'}>{row.original.type}</Badge>
			),
		},
		{
			accessorKey: 'role',
			header: 'Role',
			enableSorting: true,
			cell: ({ row }: { row: Row<MembershipData> }) => (
				<Badge variant="outline">{row.original.role}</Badge>
			),
		},
		{
			accessorKey: 'createdAt',
			header: 'Created',
			enableSorting: true,
			cell: ({ row }: { row: Row<MembershipData> }) => {
				const date = new Date(row.original.createdAt);
				const relative = formatDistanceToNow(date, { addSuffix: true });
				const exact = format(date, 'PPpp');

				return (
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="text-muted-foreground text-sm">{relative}</div>
						</TooltipTrigger>
						<TooltipContent>{exact}</TooltipContent>
					</Tooltip>
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
			searchKey="name"
			searchPlaceholder="Search memberships..."
			initialSorting={[
				{
					id: 'createdAt',
					desc: true,
				},
			]}
		/>
	);
}
