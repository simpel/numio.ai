'use client';

import { ColumnDef, Row } from '@tanstack/react-table';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@shadcn/ui/badge';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@shadcn/ui/hover-card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn/ui/tooltip';
import { DataTable } from '@src/components/data-table';
import { ClickableCell } from './clickable-cell';
import { TeamWithRelations } from '@/lib/db/team/team.types';

interface TeamsTableProps {
	data: TeamWithRelations[];
	title: string;
	description?: string;
	showDescription?: boolean;
	showOrganisation?: boolean;
	showOwner?: boolean;
	showCreatedAt?: boolean;
}

export default function TeamsTable({
	data,
	title,
	description,
	showDescription = true,
	showOrganisation = true,
	showOwner = false,
	showCreatedAt = false,
}: TeamsTableProps) {
	const columns: ColumnDef<TeamWithRelations>[] = [
		{
			accessorKey: 'name',
			header: 'Team Name',
			enableSorting: true,
			cell: ({ row }: { row: Row<TeamWithRelations> }) => (
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
						cell: ({ row }: { row: Row<TeamWithRelations> }) => {
							// Always make organization clickable if we have the ID
							if (row.original.organisationId) {
								return (
									<ClickableCell
										href={`/organisation/${row.original.organisationId}`}
									>
										{row.original.organisation?.name}
									</ClickableCell>
								);
							}
							// Otherwise just show the name
							return <div>{row.original.organisation?.name}</div>;
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
		...(showCreatedAt
			? [
					{
						accessorKey: 'createdAt',
						header: 'Created',
						enableSorting: true,
						cell: ({ row }: { row: Row<TeamWithRelations> }) => {
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
		row: Row<TeamWithRelations>,
		children: React.ReactNode
	) => {
		const team = row.original;

		// Sort members alphabetically
		const sortedMembers = (team.members || []).sort((a, b) => {
			const aName =
				`${a.memberUserProfile?.firstName || ''} ${a.memberUserProfile?.lastName || ''}`.trim();
			const bName =
				`${b.memberUserProfile?.firstName || ''} ${b.memberUserProfile?.lastName || ''}`.trim();
			return aName.localeCompare(bName);
		});

		return (
			<HoverCard>
				<HoverCardTrigger asChild className="cursor-pointer">
					{children}
				</HoverCardTrigger>
				<HoverCardContent className="w-80">
					<div className="space-y-2">
						<div>
							<h4 className="text-sm font-semibold">{team.name}</h4>
							{team.description && (
								<p className="text-muted-foreground text-sm">
									{team.description}
								</p>
							)}
						</div>
						<div>
							<p className="text-muted-foreground text-xs">
								{sortedMembers.length} member
								{sortedMembers.length !== 1 ? 's' : ''}
							</p>
							<div className="mt-2 space-y-1">
								{sortedMembers.slice(0, 5).map((member) => (
									<div key={member.id} className="flex items-center gap-2">
										<Badge variant="secondary" className="text-xs">
											{member.role}
										</Badge>
										<span className="text-sm">
											{member.memberUserProfile?.firstName}{' '}
											{member.memberUserProfile?.lastName}
										</span>
									</div>
								))}
								{sortedMembers.length > 5 && (
									<p className="text-muted-foreground text-xs">
										+{sortedMembers.length - 5} more
									</p>
								)}
							</div>
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
			searchPlaceholder="Search teams..."
			customRowRenderer={customRowRenderer}
		/>
	);
}
