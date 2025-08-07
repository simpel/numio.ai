'use client';

import { SidebarProvider, SidebarTrigger } from '@shadcn/ui/sidebar';
import { ReactNode } from 'react';
import AppSidebar from './app-sidebar';

interface AppLayoutProps {
	children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main>
				<SidebarTrigger />
				{children}
			</main>
		</SidebarProvider>
	);
}
