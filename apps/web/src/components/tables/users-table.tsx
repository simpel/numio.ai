'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@shadcn/ui/badge';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';
import { UserWithRelations } from '@/lib/db/user/user.types';

interface UsersTableProps {
	data: UserWithRelations[];
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
	const columns: ColumnDef<UserWithRelations>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			enableSorting: true,
			cell: ({ row }: { row: { original: UserWithRelations } }) => {
				const user = row.original;
				const name =
					`${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() ||
					'Unknown';
				const userId = user.profile?.id || user.id;
				return <ClickableCell href={`/user/${userId}`}>{name}</ClickableCell>;
			},
		},
		{
			accessorKey: 'email',
			header: 'Email',
			enableSorting: true,
			cell: ({ row }: { row: { original: UserWithRelations } }) => {
				const user = row.original;
				const email = user.profile?.email || user.email || '';
				const userId = user.profile?.id || user.id;
				return <ClickableCell href={`/user/${userId}`}>{email}</ClickableCell>;
			},
		},
		{
			accessorKey: 'status',
			header: 'Role',
			enableSorting: true,
			cell: ({ row }: { row: { original: UserWithRelations } }) => {
				const user = row.original;
				const status = user.profile?.role || 'active';
				return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
			},
		},
		{
			accessorKey: 'lastLogin',
			header: 'Last Login',
			enableSorting: true,
			cell: ({ row }: { row: { original: UserWithRelations } }) => {
				const user = row.original;
				const lastLogin = user.profile?.updatedAt
					? new Date(user.profile.updatedAt).toLocaleDateString()
					: 'Never';
				return <div>{lastLogin}</div>;
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
			searchPlaceholder="Search users..."
		/>
	);
}
