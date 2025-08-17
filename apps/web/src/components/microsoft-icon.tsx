'use client';

interface IMicrosoftIcon {
	className?: string;
}

export function MicrosoftIcon({ className }: IMicrosoftIcon) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 23 23"
			className={className}
			fill="none"
		>
			<path fill="#f25022" d="M1 1h10v10H1z" />
			<path fill="#00a4ef" d="M1 12h10v10H1z" />
			<path fill="#7fba00" d="M12 1h10v10H12z" />
			<path fill="#ffb900" d="M12 12h10v10H12z" />
		</svg>
	);
}
