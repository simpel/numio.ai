'use client';
import { ColumnDef, Row } from '@tanstack/react-table';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn/ui/tooltip';
import { formatDistanceToNow, format } from 'date-fns';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@shadcn/ui/hover-card';
import { OrganisationWithRelations } from '@src/lib/db/organisation/organisation.types';

interface OrganisationsTableProps {
	data: OrganisationWithRelations[];
	title: string;
	description?: string;
	showOwner?: boolean;
	showCreatedAt?: boolean;
}

export default function OrganisationsTable({
	data,
	title,
	description,
	showOwner = false,
	showCreatedAt = false,
}: OrganisationsTableProps) {
	const columns: ColumnDef<OrganisationWithRelations>[] = [
		{
			accessorKey: 'name',
			header: 'Organization Name',
			enableSorting: true,
			cell: ({ row }: { row: Row<OrganisationWithRelations> }) => (
				<ClickableCell href={`/organisation/${row.original.id}`}>
					{row.original.name}
				</ClickableCell>
			),
		},
		...(showOwner
			? [
					{
						accessorKey: 'owner',
						header: 'Owner',
						enableSorting: true,
						cell: ({ row }: { row: Row<OrganisationWithRelations> }) => {
							const owner = row.original.owner;
							if (!owner) return <div className="text-muted-foreground">—</div>;
							const name =
								`${owner.firstName || ''} ${owner.lastName || ''}`.trim();
							return <div>{name || owner.email}</div>;
						},
					},
				]
			: []),
		...(showCreatedAt
			? [
					{
						accessorKey: 'createdAt',
						header: 'Created',
						enableSorting: true,
						cell: ({ row }: { row: Row<OrganisationWithRelations> }) => {
							const v = row.original.createdAt;
							if (!v) return <div className="text-muted-foreground">—</div>;
							const d = new Date(v);
							const rel = formatDistanceToNow(d, { addSuffix: true });
							const exact = format(d, 'PPpp');
							return (
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="text-muted-foreground text-sm">{rel}</div>
									</TooltipTrigger>
									<TooltipContent>{exact}</TooltipContent>
								</Tooltip>
							);
						},
					},
				]
			: []),
		// Removed actions column; names are already linked
	];

	// Custom row renderer with hover card
	const customRowRenderer = (
		row: Row<OrganisationWithRelations>,
		children: React.ReactNode
	) => {
		const org = row.original;

		return (
			<HoverCard key={row.id}>
				<HoverCardTrigger asChild>{children}</HoverCardTrigger>
				<HoverCardContent className="w-80">
					<div className="space-y-2">
						<h4 className="text-sm font-semibold">{org.name}</h4>
						{org.description && (
							<p className="text-muted-foreground text-sm">{org.description}</p>
						)}
						<div className="text-muted-foreground space-y-1 text-xs">
							<p>Teams: {org._count.teams}</p>
							<p>Users: {org._count.members}</p>
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>
		);
	};

	return (
		<DataTable
			columns={columns}
			data={data}
			title={title}
			description={description}
			searchKey="name"
			searchPlaceholder="Search organizations..."
			customRowRenderer={customRowRenderer}
			stretchColumn="name"
		/>
	);
}
