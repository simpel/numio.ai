'use client';

import { useState, useTransition } from 'react';
import { removeMembershipAction } from '@src/lib/db/membership/membership.actions';
import { toast } from 'sonner';
import OrganizationMemberships from './memberships-list/organization-memberships';
import TeamMemberships from './memberships-list/team-memberships';
import CaseMemberships from './memberships-list/case-memberships';
import ClientMemberships from './memberships-list/client-memberships';
import type { Prisma } from '@numio/ai-database';

// Define the type for memberships with included relations using Prisma utility types
type MembershipWithRelations = Prisma.MembershipGetPayload<{
	include: {
		organisation: {
			select: {
				id: true;
				name: true;
			};
		};
		teamContext: {
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
		caseItem: {
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
		client: {
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
	};
}>;

// Transform the Prisma result to include the type field and convert dates
type TransformedMembership = Omit<MembershipWithRelations, 'createdAt'> & {
	createdAt: string;
	type: 'membership';
	// Convert null values to undefined for frontend compatibility
	organisation?: NonNullable<MembershipWithRelations['organisation']>;
	teamContext?: NonNullable<MembershipWithRelations['teamContext']>;
	team?: NonNullable<MembershipWithRelations['team']>;
	caseItem?: NonNullable<MembershipWithRelations['caseItem']>;
	client?: NonNullable<MembershipWithRelations['client']>;
};

interface MembershipsListProps {
	userProfileId: string;
	initialMemberships: TransformedMembership[];
}

export default function MembershipsList({
	userProfileId,
	initialMemberships,
}: MembershipsListProps) {
	const [memberships, setMemberships] =
		useState<TransformedMembership[]>(initialMemberships);
	const [pending, startTransition] = useTransition();

	const handleRemoveMembership = async (
		membershipId: string,
		membershipName: string,
		_type: 'organisation' | 'team' | 'case' | 'client'
	) => {
		startTransition(async () => {
			const result = await removeMembershipAction(membershipId);
			if (result.isSuccess) {
				setMemberships((prev) => prev.filter((m) => m.id !== membershipId));
				toast.success(`Left ${membershipName}`);
			} else {
				toast.error(result.message || 'Failed to leave membership');
			}
		});
	};

	// Filter memberships by type
	const organizationMemberships = memberships.filter(
		(m) => m.organisation
	) as (TransformedMembership & {
		organisation: NonNullable<TransformedMembership['organisation']>;
	})[];
	const teamMemberships = memberships.filter(
		(m) => m.teamContext || m.team
	) as (TransformedMembership & {
		teamContext?: NonNullable<TransformedMembership['teamContext']>;
		team?: NonNullable<TransformedMembership['team']>;
	})[];
	const caseMemberships = memberships.filter(
		(m) => m.caseItem
	) as (TransformedMembership & {
		caseItem: NonNullable<TransformedMembership['caseItem']>;
	})[];
	const clientMemberships = memberships.filter(
		(m) => m.client
	) as (TransformedMembership & {
		client: NonNullable<TransformedMembership['client']>;
	})[];

	if (memberships.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">No memberships found.</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<OrganizationMemberships
				memberships={organizationMemberships}
				pending={pending}
				onRemoveMembership={handleRemoveMembership}
			/>

			<TeamMemberships
				memberships={teamMemberships}
				pending={pending}
				onRemoveMembership={handleRemoveMembership}
			/>

			<ClientMemberships
				memberships={clientMemberships}
				pending={pending}
				onRemoveMembership={handleRemoveMembership}
			/>

			<CaseMemberships
				memberships={caseMemberships}
				pending={pending}
				onRemoveMembership={handleRemoveMembership}
			/>
		</div>
	);
}
