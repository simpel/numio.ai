'use client';

import Link from 'next/link';
import { cn } from '@src/utils';

interface ClickableCellProps {
	href: string;
	children: React.ReactNode;
	className?: string;
}

export function ClickableCell({
	href,
	children,
	className,
}: ClickableCellProps) {
	return (
		<Link
			href={href}
			className={cn(
				'text-primary hover:text-primary/80 transition-colors hover:underline',
				className
			)}
		>
			{children}
		</Link>
	);
}
