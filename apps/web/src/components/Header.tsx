'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
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
import { Settings, LogOut, User } from 'lucide-react';
import { cn } from '@src/utils';

const authenticatedMenuItems = [
	{
		title: 'Home',
		url: '/home',
	},
	{
		title: 'Cases',
		url: '/cases',
	},
	{
		title: 'Teams',
		url: '/teams',
	},
	{
		title: 'Organisations',
		url: '/organisations',
	},
	{
		title: 'Settings',
		url: '/settings',
	},
];

export default function Header() {
	const { data: session, status } = useSession();
	const isLoading = status === 'loading';

	const handleSignOut = () => {
		signOut({ callbackUrl: '/' });
	};

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
					<span className="text-xl font-bold">Numio</span>
				</Link>

				{/* Center: Navigation Menu (only for authenticated users) */}
				{!isLoading && session && (
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
					{isLoading ? (
						<div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
					) : session ? (
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
											{getUserInitials(session.user?.name, session.user?.email)}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">
											{session.user?.name || 'User'}
										</p>
										<p className="text-muted-foreground text-xs leading-none">
											{session.user?.email}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/settings" className="flex items-center">
										<Settings className="mr-2 h-4 w-4" />
										Settings
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/profile" className="flex items-center">
										<User className="mr-2 h-4 w-4" />
										Profile
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleSignOut}
									className="text-destructive focus:text-destructive flex items-center"
								>
									<LogOut className="mr-2 h-4 w-4" />
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild>
							<Link href="/signin">Sign in</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
