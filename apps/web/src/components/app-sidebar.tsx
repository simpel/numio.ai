import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from '@shadcn/ui/sidebar';
import { Users, Settings } from 'lucide-react';
import Link from 'next/link';

const menuItems = [
	{
		title: 'General Settings',
		url: '/settings',
		icon: Settings,
	},
	{
		title: 'Teams',
		url: '/settings/teams',
		icon: Users,
	},
	{
		title: 'Organisations',
		url: '/settings/organisations',
		icon: Settings,
	},
	{
		title: 'Users',
		url: '/settings/users',
		icon: Users,
	},
];

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Settings</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link href={item.url}>
											<item.icon className="mr-2 h-5 w-5" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}

export default AppSidebar;
