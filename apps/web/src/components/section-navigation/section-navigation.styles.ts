import { cva, type VariantProps } from 'class-variance-authority';

export const sectionLinkVariants = cva(
	'border-b-2 py-2 text-sm font-medium transition-colors',
	{
		variants: {
			variant: {
				active: 'border-primary text-primary font-semibold',
				inactive:
					'text-muted-foreground hover:text-foreground border-transparent',
			},
		},
		defaultVariants: {
			variant: 'inactive',
		},
	}
);

export type SectionLinkVariants = VariantProps<typeof sectionLinkVariants>;
