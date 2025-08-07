'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@shadcn/ui/button';
import { Badge } from '@shadcn/ui/badge';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';

interface UserData {
	id: string;
	name: string;
	email: string;
	status: string;
	lastLogin: string;
}

interface UsersTableProps {
	data: UserData[];
	title: string;
	description?: string;
}

const getStatusVariant = (status: string) => {
	switch (status.toLowerCase()) {
		case 'active':
			return 'default';
		case 'pending':
		case 'inactive':
			return 'secondary';
		case 'expired':
		case 'suspended':
			return 'destructive';
		default:
			return 'outline';
	}
};

export default function UsersTable({
	data,
	title,
	description,
}: UsersTableProps) {
	const columns: ColumnDef<UserData>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<ClickableCell href={`/user/${row.original.id}`}>
					{row.original.name}
				</ClickableCell>
			),
		},
		{
			accessorKey: 'email',
			header: 'Email',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<ClickableCell href={`/user/${row.original.id}`}>
					{row.original.email}
				</ClickableCell>
			),
		},
		{
			accessorKey: 'status',
			header: 'Role',
			enableSorting: true,
			cell: ({ row }: { row: any }) => (
				<Badge variant={getStatusVariant(row.original.status)}>
					{row.original.status}
				</Badge>
			),
		},
		{
			accessorKey: 'lastLogin',
			header: 'Last Login',
			enableSorting: true,
		},
		{
			id: 'actions',
			enableSorting: false,
			cell: ({ row }: { row: any }) => (
				<Button asChild variant="outline" size="sm">
					<Link href={`/user/${row.original.id}`}>View Details</Link>
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
			searchKey="name"
			searchPlaceholder="Search users..."
		/>
	);
}
