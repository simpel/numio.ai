'use server';

import { Link } from '@src/i18n/navigation';
import { Button } from '@shadcn/ui/button';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@shadcn/ui/card';
import { Users, Building2, Users2, Mail } from 'lucide-react';

export default async function AdminPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold tracking-tight">
					Admin Dashboard
				</h2>
				<p className="text-muted-foreground">
					Manage all teams, organizations, users, and invites in the system.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Teams</CardTitle>
						<Users2 className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Manage Teams</div>
						<p className="text-muted-foreground text-xs">
							View and manage all teams
						</p>
						<Button asChild className="mt-2" size="sm">
							<Link href="/admin/teams">View Teams</Link>
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Organizations</CardTitle>
						<Building2 className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Manage Organizations</div>
						<p className="text-muted-foreground text-xs">
							View and manage all organizations
						</p>
						<Button asChild className="mt-2" size="sm">
							<Link href="/admin/organisations">View Organizations</Link>
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Users</CardTitle>
						<Users className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Manage Users</div>
						<p className="text-muted-foreground text-xs">
							View and manage all users
						</p>
						<Button asChild className="mt-2" size="sm">
							<Link href="/admin/users">View Users</Link>
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Invites</CardTitle>
						<Mail className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Manage Invites</div>
						<p className="text-muted-foreground text-xs">
							View and manage all invites
						</p>
						<Button asChild className="mt-2" size="sm">
							<Link href="/admin/invites">View Invites</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
