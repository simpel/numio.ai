'use client';

import { useEffect, useState } from 'react';
import {
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from '@shadcn/ui/dropdown-menu';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@src/i18n/navigation';
import { setLocaleAction } from '@src/lib/i18n/locale.actions';

async function setLocale(locale: 'en' | 'sv') {
	// Use the server action to update the locale server-side
	await setLocaleAction(locale);
}

export function HeaderLanguageSwitcher() {
	const t = useTranslations('common');
	const router = useRouter();
	const pathname = usePathname();
	const locale = useLocale();
	const [value, setValue] = useState<'en' | 'sv'>(locale as 'en' | 'sv');

	useEffect(() => {
		// Update value when locale changes
		setValue(locale as 'en' | 'sv');
	}, [locale]);

	const handleLocaleChange = async (newLocale: 'en' | 'sv') => {
		await setLocale(newLocale);
		// Navigate to the same page with the new locale
		router.replace(pathname, { locale: newLocale });
		// Update the local state
		setValue(newLocale);
	};

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>{t('language')}</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(val) => handleLocaleChange(val as 'en' | 'sv')}
				>
					<DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="sv">Svenska</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}
