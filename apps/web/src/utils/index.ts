import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const normalize = (
	value: string | null | undefined
): string | undefined => value ?? undefined;

/**
 * Converts a string to a URL-friendly slug.
 * - Lowercases
 * - Replaces spaces with hyphens
 * - Replaces Scandinavian/European diacritics (ö, ä, å, etc.)
 * - Removes non-alphanumeric (except hyphens)
 */
export function toUrl(input?: string): string {
	const map: Record<string, string> = {
		å: 'a',
		ä: 'a',
		æ: 'a',
		á: 'a',
		à: 'a',
		ã: 'a',
		â: 'a',
		Å: 'a',
		Ä: 'a',
		Æ: 'a',
		Á: 'a',
		À: 'a',
		Ã: 'a',
		Â: 'a',
		ö: 'o',
		ø: 'o',
		ó: 'o',
		ò: 'o',
		õ: 'o',
		ô: 'o',
		Ö: 'o',
		Ø: 'o',
		Ó: 'o',
		Ò: 'o',
		Õ: 'o',
		Ô: 'o',
		ü: 'u',
		ú: 'u',
		ù: 'u',
		û: 'u',
		Ü: 'u',
		Ú: 'u',
		Ù: 'u',
		Û: 'u',
		ë: 'e',
		é: 'e',
		è: 'e',
		ê: 'e',
		Ë: 'e',
		É: 'e',
		È: 'e',
		Ê: 'e',
		ï: 'i',
		í: 'i',
		ì: 'i',
		î: 'i',
		Ï: 'i',
		Í: 'i',
		Ì: 'i',
		Î: 'i',
		ç: 'c',
		Ç: 'c',
		ñ: 'n',
		Ñ: 'n',
		ß: 'ss',
	};

	if (!input) return '';

	return input
		.normalize('NFD')
		.split('')
		.map((char) => map[char] ?? char)
		.join('')
		.replace(/[\u0300-\u036f]/g, '') // Remove remaining diacritics
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
		.replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
		.replace(/--+/g, '-'); // Collapse multiple hyphens
}
