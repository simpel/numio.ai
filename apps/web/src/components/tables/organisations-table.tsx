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

interface OrganisationData {
	id: string;
	name: string;
	organisationId?: string;
	teamsCount?: number;
	usersCount?: number;
	activeCasesCount?: number;
	description?: string;
	ownerName?: string;
	createdAt?: string;
}

interface OrganisationsTableProps {
	data: OrganisationData[];
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
	const columns: ColumnDef<OrganisationData>[] = [
		{
			accessorKey: 'name',
			header: 'Organization Name',
			enableSorting: true,
			cell: ({ row }: { row: Row<OrganisationData> }) => (
				<ClickableCell
					href={`/organisation/${row.original.organisationId || row.original.id}`}
				>
					{row.original.name}
				</ClickableCell>
			),
		},
		...(showOwner
			? [
					{
						accessorKey: 'ownerName',
						header: 'Owner',
						enableSorting: true,
					},
				]
			: []),
		...(showCreatedAt
			? [
					{
						accessorKey: 'createdAt',
						header: 'Created',
						enableSorting: true,
						cell: ({ row }: { row: Row<OrganisationData> }) => {
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
		row: Row<OrganisationData>,
		children: React.ReactNode
	) => {
		const org = row.original as OrganisationData;

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
							<p>Active Cases: {org.activeCasesCount ?? 0}</p>
							<p>Teams: {org.teamsCount ?? 0}</p>
							<p>Users: {org.usersCount ?? 0}</p>
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
