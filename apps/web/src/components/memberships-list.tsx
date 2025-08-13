'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { removeMembershipAction } from '@src/lib/db/membership/membership.actions';
import OrganizationMemberships from './memberships-list/organization-memberships';
import TeamMemberships from './memberships-list/team-memberships';
import CaseMemberships from './memberships-list/case-memberships';
import ClientMemberships from './memberships-list/client-memberships';

// Base membership interface
interface MembershipWithRelations {
	id: string;
	role: string;
	createdAt: Date | string;
	organisation?: {
		id: string;
		name: string;
	};
	teamContext?: {
		id: string;
		name: string;
		organisation?: {
			id: string;
			name: string;
		};
	};
	team?: {
		id: string;
		name: string;
		organisation?: {
			id: string;
			name: string;
		};
	};
	caseItem?: {
		id: string;
		title: string;
		state: string;
		team?: {
			id: string;
			name: string;
		};
	};
	client?: {
		id: string;
		name: string;
		organisation?: {
			id: string;
			name: string;
		};
	};
}

type TransformedMembership = Omit<MembershipWithRelations, 'createdAt'> & {
	createdAt: string;
	type: 'membership';
	// Convert null values to undefined for frontend compatibility
	organisation?: NonNullable<MembershipWithRelations['organisation']>;
	team?: NonNullable<MembershipWithRelations['team']>;
	case?: NonNullable<MembershipWithRelations['caseItem']>;
	client?: NonNullable<MembershipWithRelations['client']>;
};

interface MembershipsListProps {
	userProfileId: string;
	initialMemberships: TransformedMembership[];
}

export default function MembershipsList({
	initialMemberships,
}: MembershipsListProps) {
	const [memberships, setMemberships] =
		useState<TransformedMembership[]>(initialMemberships);
	const [pending, startTransition] = useTransition();

	const handleRemoveMembership = async (
		membershipId: string,
		membershipName: string
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
		(m) => m.team && m.team.organisation
	) as (TransformedMembership & {
		team: NonNullable<TransformedMembership['team']> & {
			organisation: NonNullable<
				NonNullable<TransformedMembership['team']>['organisation']
			>;
		};
	})[];
	const caseMemberships = memberships.filter(
		(m) => m.case && m.case.team
	) as (TransformedMembership & {
		case: NonNullable<TransformedMembership['case']> & {
			team: NonNullable<NonNullable<TransformedMembership['case']>['team']>;
		};
	})[];
	const clientMemberships = memberships.filter(
		(m) => m.client && m.client.organisation
	) as (TransformedMembership & {
		client: NonNullable<TransformedMembership['client']> & {
			organisation: NonNullable<
				NonNullable<TransformedMembership['client']>['organisation']
			>;
		};
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
