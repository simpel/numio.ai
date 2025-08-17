'use client';

import { Link, usePathname } from '@src/i18n/navigation';
import { cn } from '@src/utils';

export default function AdminNavigation() {
	const pathname = usePathname();

	const isTeamsActive = pathname === '/admin/teams';
	const isOrganisationsActive = pathname === '/admin/organisations';
	const isUsersActive = pathname === '/admin/users';
	const isInvitesActive = pathname === '/admin/invites';

	return (
		<div className="border-b">
			<nav className="-mb-px flex space-x-8">
				<Link
					href="/admin/teams"
					className={cn(
						'border-b-2 py-2 text-sm font-medium transition-colors',
						isTeamsActive
							? 'border-primary text-primary'
							: 'text-muted-foreground hover:text-foreground border-transparent'
					)}
				>
					Teams
				</Link>
				<Link
					href="/admin/organisations"
					className={cn(
						'border-b-2 py-2 text-sm font-medium transition-colors',
						isOrganisationsActive
							? 'border-primary text-primary'
							: 'text-muted-foreground hover:text-foreground border-transparent'
					)}
				>
					Organisations
				</Link>
				<Link
					href="/admin/users"
					className={cn(
						'border-b-2 py-2 text-sm font-medium transition-colors',
						isUsersActive
							? 'border-primary text-primary'
							: 'text-muted-foreground hover:text-foreground border-transparent'
					)}
				>
					Users
				</Link>
				<Link
					href="/admin/invites"
					className={cn(
						'border-b-2 py-2 text-sm font-medium transition-colors',
						isInvitesActive
							? 'border-primary text-primary'
							: 'text-muted-foreground hover:text-foreground border-transparent'
					)}
				>
					Invites
				</Link>
			</nav>
		</div>
	);
}
