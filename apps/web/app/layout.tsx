import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';

import { Analytics } from '@vercel/analytics/react';

import { ThemeProvider } from '@src/components/theme-provider';
import { cn } from '@src/utils';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@shadcn/ui/sonner';

// Add imports for sidebar

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});

const title = 'Numio AI';
const description = 'The AI for all things Numio.';

export const metadata: Metadata = {
	metadataBase: new URL('https://numio.ai'),
	title,
	description,
	openGraph: {
		title,
		description,
	},
	twitter: {
		title,
		description,
		card: 'summary_large_image',
		creator: 'Numio AI',
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	minimumScale: 1,
	maximumScale: 5,
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning className="h-full">
			<body
				className={cn('bg-sidebar font-sans antialiased', fontSans.variable)}
			>
				<SessionProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}

						<Toaster />
					</ThemeProvider>
				</SessionProvider>
				<Analytics />
			</body>
		</html>
	);
}
