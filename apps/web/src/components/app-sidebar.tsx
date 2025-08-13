'use client';

import { Sidebar } from '@shadcn/ui/sidebar';
import { Link } from '@src/i18n/navigation';
import { usePathname } from 'next/navigation';
import { cn } from '@src/utils';

export default function AppSidebar() {
	const pathname = usePathname();

	const navigation = [
		{
			name: 'Dashboard',
			href: '/home',
			icon: '🏠',
		},
		{
			name: 'Organizations',
			href: '/organisations',
			icon: '🏢',
		},
		{
			name: 'Teams',
			href: '/teams',
			icon: '👥',
		},
		{
			name: 'Cases',
			href: '/cases',
			icon: '📋',
		},
	];

	return (
		<Sidebar>
			<div className="flex h-full flex-col gap-2">
				<div className="flex h-[60px] items-center px-2">
					<Link href="/home" className="flex items-center gap-2 font-semibold">
						<span className="text-xl">Numio</span>
					</Link>
				</div>
				<div className="flex-1 overflow-auto">
					<nav className="grid items-start px-2 text-sm font-medium">
						{navigation.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
									pathname === item.href &&
										'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50'
								)}
							>
								<span className="text-lg">{item.icon}</span>
								{item.name}
							</Link>
						))}
					</nav>
				</div>
			</div>
		</Sidebar>
	);
}
