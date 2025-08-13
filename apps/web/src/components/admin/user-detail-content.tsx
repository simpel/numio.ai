'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Building, Users, Briefcase } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@shadcn/ui/card';
import { Button } from '@shadcn/ui/button';
import { Badge } from '@shadcn/ui/badge';
import { getUserProfileByIdAction } from '@src/lib/db/user-profile/user-profile.actions';
import MembershipsTable from '@src/components/tables/memberships-table';

interface UserDetailContentProps {
	userId: string;
}

export function UserDetailContent({ userId }: UserDetailContentProps) {
	const t = useTranslations('pages.admin');
	const router = useRouter();
	const [userData, setUserData] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const result = await getUserProfileByIdAction(userId);
				if (result.isSuccess && result.data) {
					setUserData(result.data);
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, [userId]);

	const getUserDisplayName = (user: any) => {
		const firstName = user.firstName || '';
		const lastName = user.lastName || '';
		const fullName = `${firstName} ${lastName}`.trim();
		return fullName || user.email || 'Unknown User';
	};

	const transformMembershipsToTableData = (memberships: any[]) => {
		return memberships.map((membership) => {
			let name = '';
			let type: 'organization' | 'team' | 'case' = 'organization';
			let href = '';

			if (membership.organisation) {
				name = membership.organisation.name;
				type = 'organization';
				href = `/organisation/${membership.organisation.id}`;
			} else if (membership.teamContext) {
				name = membership.teamContext.name;
				type = 'team';
				href = `/team/${membership.teamContext.id}`;
			} else if (membership.caseItem) {
				name = membership.caseItem.title;
				type = 'case';
				href = `/case/${membership.caseItem.id}`;
			}

			return {
				id: membership.id,
				name,
				type,
				role: membership.role,
				createdAt: membership.createdAt,
				href,
			};
		});
	};

	if (isLoading) {
		return (
			<div className="container mx-auto space-y-6 p-6">
				<div className="py-8 text-center">
					<div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
					<p className="text-muted-foreground mt-2">{t('loading_user')}</p>
				</div>
			</div>
		);
	}

	if (!userData) {
		return (
			<div className="container mx-auto space-y-6 p-6">
				<div className="py-8 text-center">
					<p className="text-muted-foreground">{t('user_not_found')}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.back()}
					className="flex items-center gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					{t('back')}
				</Button>
			</div>

			<div className="space-y-2">
				<h1 className="text-3xl font-bold">{t('user_details')}</h1>
				<p className="text-muted-foreground">{t('user_details_description')}</p>
			</div>

			{/* User Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						{t('user_information')}
					</CardTitle>
					<CardDescription>{t('user_information_description')}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
							<User className="text-primary h-6 w-6" />
						</div>
						<div>
							<h3 className="text-lg font-semibold">
								{getUserDisplayName(userData)}
							</h3>
							{userData.email && (
								<p className="text-muted-foreground">{userData.email}</p>
							)}
							{userData.role && (
								<Badge variant="secondary" className="mt-1">
									{userData.role}
								</Badge>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Memberships */}
			{userData.memberships && userData.memberships.length > 0 ? (
				<MembershipsTable
					data={transformMembershipsToTableData(userData.memberships)}
					title={t('memberships')}
					description={t('memberships_description')}
				/>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							{t('memberships')}
						</CardTitle>
						<CardDescription>{t('memberships_description')}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="py-8 text-center">
							<p className="text-muted-foreground">{t('no_memberships')}</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Active Invites */}
			{userData.activeInvites && userData.activeInvites.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							{t('active_invites')}
						</CardTitle>
						<CardDescription>{t('active_invites_description')}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{userData.activeInvites.map((invite: any, index: number) => (
								<div
									key={index}
									className="flex items-center justify-between rounded-lg border p-4"
								>
									<div className="flex items-center gap-3">
										<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
											{invite.organisation ? (
												<Building className="text-primary h-5 w-5" />
											) : (
												<Users className="text-primary h-5 w-5" />
											)}
										</div>
										<div>
											<p className="font-medium">
												{invite.organisation?.name ||
													invite.team?.name ||
													'Unknown'}
											</p>
											<p className="text-muted-foreground text-sm">
												{invite.organisation ? 'Organization' : 'Team'} Invite
											</p>
										</div>
									</div>
									<Badge
										variant={
											invite.status === 'pending' ? 'default' : 'secondary'
										}
									>
										{invite.status}
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
