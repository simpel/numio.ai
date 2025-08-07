import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
	// Initialize with false to prevent hydration issues
	const [isMobile, setIsMobile] = React.useState(false);

	// Use a separate effect with empty dependency array
	// that only runs once on the client
	React.useEffect(() => {
		// Set the actual initial value based on window width
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

		// Set up the media query listener
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};

		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
	}, []);

	return isMobile;
}
