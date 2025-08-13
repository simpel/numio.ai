'use server';

import { Link } from '@src/i18n/navigation';
import { Button } from '@shadcn/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@shadcn/ui/dropdown-menu';
import { Settings, LogOut, User, Shield } from 'lucide-react';
import { cn } from '@src/utils';
import { HeaderLanguageSwitcher } from './header-language-switcher';
import { getTranslations } from 'next-intl/server';
import { auth } from '@src/lib/auth/auth';
import RoleGuard from '@src/components/auth/role-guard';

export default async function Header() {
	const session = await auth();
	const t = await getTranslations('header');
	const nav = await getTranslations('navigation');

	const authenticatedMenuItems = [
		{
			title: nav('cases'),
			url: '/cases',
		},
		{
			title: nav('teams'),
			url: '/teams',
		},
		{
			title: nav('organizations'),
			url: '/organisations',
		},
		{
			title: nav('settings'),
			url: '/settings',
		},
	];

	const getUserInitials = (name?: string | null, email?: string | null) => {
		if (name) {
			const names = name.split(' ');
			if (names.length >= 2) {
				return `${names[0]?.[0] || ''}${names[1]?.[0] || ''}`.toUpperCase();
			}
			return name[0]?.toUpperCase() || '?';
		}
		if (email) {
			return email[0]?.toUpperCase() || '?';
		}
		return '?';
	};

	return (
		<header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
			<div className="container mx-auto flex h-14 items-center justify-between px-6">
				{/* Left: App Name */}
				<Link href="/" className="flex items-center space-x-2">
					<span className="text-xl font-bold">{t('app_name')}</span>
				</Link>

				{/* Center: Navigation Menu (only for authenticated users) */}
				{session && (
					<nav className="hidden items-center space-x-6 md:flex">
						{authenticatedMenuItems.map((item) => (
							<Link
								key={item.title}
								href={item.url}
								className={cn(
									'hover:text-primary text-sm font-medium transition-colors',
									'text-muted-foreground'
								)}
							>
								{item.title}
							</Link>
						))}
					</nav>
				)}

				{/* Right: Auth Controls */}
				<div className="flex items-center space-x-4">
					{session ? (
						<>
							{/* Admin button for superadmin users */}
							<RoleGuard requiredRoles={['superadmin']}>
								<Button asChild variant="outline" size="sm">
									<Link href="/admin" className="flex items-center">
										<Shield className="mr-2 h-4 w-4" />
										{nav('admin')}
									</Link>
								</Button>
							</RoleGuard>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-8 w-8 rounded-full"
									>
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={session.user?.image || ''}
												alt={session.user?.name || ''}
											/>
											<AvatarFallback>
												{getUserInitials(
													session.user?.name,
													session.user?.email
												)}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">
												{session.user?.name || t('user_fallback')}
											</p>
											<p className="text-muted-foreground text-xs leading-none">
												{session.user?.email}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{/* Language submenu */}
									<HeaderLanguageSwitcher />
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link href="/settings" className="flex items-center">
											<User className="mr-2 h-4 w-4" />
											{nav('settings')}
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link
											href="/api/auth/signout"
											className="text-destructive focus:text-destructive flex items-center"
										>
											<LogOut className="mr-2 h-4 w-4" />
											{t('sign_out')}
										</Link>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					) : (
						<Button asChild>
							<Link href="/signin">{nav('signin')}</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
