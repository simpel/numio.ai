'use client';

import * as React from 'react';
import { Link, usePathname } from '@src/i18n/navigation';
import { cn } from '@src/utils';
import {
	sectionLinkVariants,
	type SectionLinkVariants,
} from './section-navigation.styles';

interface SectionLink {
	id: string;
	label: string;
	href: string;
}

interface SectionNavigationProps extends SectionLinkVariants {
	sections: SectionLink[];
	activeSection?: string;
	className?: string;
}

export default function SectionNavigation({
	sections,
	activeSection,
	className,
}: SectionNavigationProps) {
	const pathname = usePathname();

	if (!sections.length) {
		return null;
	}

	// Determine active section based on pathname if not provided
	const currentActiveSection =
		activeSection ||
		(() => {
			const pathSegments = pathname.split('/');
			const lastSegment = pathSegments[pathSegments.length - 1];

			// Check if last segment matches any section ID
			const matchingSection = sections.find(
				(section) => section.id === lastSegment
			);
			return matchingSection?.id || sections[0]?.id;
		})();

	return (
		<div className={cn('border-b', className)}>
			<nav className="-mb-px flex space-x-8">
				{sections.map((section) => {
					const isActive = currentActiveSection === section.id;

					return (
						<Link
							key={section.id}
							href={section.href}
							className={cn(
								sectionLinkVariants({
									variant: isActive ? 'active' : 'inactive',
								})
							)}
						>
							{section.label}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
