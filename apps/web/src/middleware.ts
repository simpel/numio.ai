import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { geolocation } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';

// Map of country codes to supported locales
const countryToLocale: Record<string, 'en' | 'sv'> = {
	SE: 'sv',
};

// Function to determine locale based on geolocation and cookies
function getLocaleFromGeolocation(request: NextRequest): 'en' | 'sv' {
	// First, check if user has a language preference cookie
	const localeCookie = request.cookies.get('locale');
	if (
		localeCookie?.value &&
		(localeCookie.value === 'en' || localeCookie.value === 'sv')
	) {
		return localeCookie.value;
	}

	try {
		// Get geolocation data from Vercel
		const geo = geolocation(request);

		// Debug logging (only in development)
		if (process.env.NODE_ENV === 'development') {
			console.log('Geolocation data:', {
				country: geo?.country,
				city: geo?.city,
				region: geo?.region,
			});
		}

		if (geo?.country) {
			const detectedLocale = countryToLocale[geo.country];
			if (detectedLocale) {
				if (process.env.NODE_ENV === 'development') {
					console.log(
						`Detected locale '${detectedLocale}' for country '${geo.country}'`
					);
				}
				return detectedLocale;
			}
		}

		// Fallback to English for unknown countries or missing geolocation
		if (process.env.NODE_ENV === 'development') {
			console.log(
				`No locale mapping found for country '${geo?.country}', falling back to English`
			);
		}
		return 'en';
	} catch (error) {
		// Fallback to English if geolocation fails
		console.warn('Geolocation failed, falling back to English:', error);
		return 'en';
	}
}

// Create custom middleware that combines next-intl with geolocation
export default function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Handle root path redirect with geolocation
	if (pathname === '/') {
		console.log('Handling root path with geolocation');
		const detectedLocale = getLocaleFromGeolocation(request);
		const url = request.nextUrl.clone();
		url.pathname = `/${detectedLocale}`;

		// Create response with redirect and set locale cookie if not already set
		const response = NextResponse.redirect(url);

		// Set locale cookie if user doesn't have one yet
		const localeCookie = request.cookies.get('locale');
		if (!localeCookie) {
			response.cookies.set('locale', detectedLocale, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365, // 1 year
				httpOnly: false, // Allow client-side access for language switcher
				sameSite: 'lax',
			});
		}

		return response;
	}

	// For all other paths, use the next-intl middleware
	console.log('Using next-intl middleware for pathname:', pathname);
	const nextIntlMiddleware = createMiddleware(routing);
	return nextIntlMiddleware(request);
}

export const config = {
	// Match all pathnames except for
	// - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
	// - … the ones containing a dot (e.g. `favicon.ico`)
	matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
