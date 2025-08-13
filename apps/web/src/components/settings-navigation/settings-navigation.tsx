'use client';

import { Link, usePathname } from '@src/i18n/navigation';
import { cn } from '@src/utils';

export default function SettingsNavigation() {
	const pathname = usePathname();

	const isSettingsActive = pathname === '/settings';
	const isTeamsActive = pathname === '/settings/teams';
	const isOrganisationsActive = pathname === '/settings/organisations';
	const isUsersActive = pathname === '/settings/users';
	const isInvitesActive = pathname === '/settings/invites';

	return (
		<div className="border-b">
			<nav className="-mb-px flex space-x-8">
				<Link
					href="/settings"
					className={cn(
						'border-b-2 py-2 text-sm font-medium transition-colors',
						isSettingsActive
							? 'border-primary text-primary'
							: 'text-muted-foreground hover:text-foreground border-transparent'
					)}
				>
					General Settings
				</Link>
				<Link
					href="/settings/teams"
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
					href="/settings/organisations"
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
					href="/settings/users"
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
					href="/settings/invites"
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
