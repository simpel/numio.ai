'use client';

import { ColumnDef, Row } from '@tanstack/react-table';
import { Badge } from '@shadcn/ui/badge';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';
import { formatDistanceToNow, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn/ui/tooltip';
import { Prisma } from '@numio/ai-database';

type MembershipWithRelations = Prisma.MembershipGetPayload<{
	include: {
		organisation: {
			select: {
				id: true;
				name: true;
			};
		};
		team: {
			select: {
				id: true;
				name: true;
				organisation: {
					select: {
						id: true;
						name: true;
					};
				};
			};
		};
		case: {
			select: {
				id: true;
				title: true;
				team: {
					select: {
						id: true;
						name: true;
					};
				};
			};
		};
	};
}>;

interface MembershipsTableProps {
	data: MembershipWithRelations[];
	title: string;
	description?: string;
}

export default function MembershipsTable({
	data,
	title,
	description,
}: MembershipsTableProps) {
	const columns: ColumnDef<MembershipWithRelations>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			enableSorting: true,
			cell: ({ row }: { row: Row<MembershipWithRelations> }) => {
				const membership = row.original;
				const name =
					membership.organisation?.name ||
					membership.team?.name ||
					membership.case?.title ||
					'Unknown';
				const href = membership.organisation
					? `/organisation/${membership.organisation.id}`
					: membership.team
						? `/team/${membership.team.id}`
						: membership.case
							? `/case/${membership.case.id}`
							: '#';

				return <ClickableCell href={href}>{name}</ClickableCell>;
			},
		},
		{
			accessorKey: 'type',
			header: 'Type',
			enableSorting: true,
			cell: ({ row }: { row: Row<MembershipWithRelations> }) => {
				const membership = row.original;
				const type = membership.organisation
					? 'organization'
					: membership.team
						? 'team'
						: 'case';

				return <Badge variant={'outline'}>{type}</Badge>;
			},
		},
		{
			accessorKey: 'role',
			header: 'Role',
			enableSorting: true,
			cell: ({ row }: { row: Row<MembershipWithRelations> }) => (
				<Badge variant="outline">{row.original.role}</Badge>
			),
		},
		{
			accessorKey: 'createdAt',
			header: 'Created',
			enableSorting: true,
			cell: ({ row }: { row: Row<MembershipWithRelations> }) => {
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
