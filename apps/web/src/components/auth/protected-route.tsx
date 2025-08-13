'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@shadcn/ui/alert';
import { X } from 'lucide-react';
import { Button } from '@shadcn/ui/button';
import { useTranslations } from 'next-intl';

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRoles?: string[];
	fallback?: React.ReactNode;
	errorConfig?: {
		insufficientPermissions?: {
			code: string;
			variables?: Record<string, string | number>;
		};
	};
	initialErrorCode?: string;
	initialErrorVariables?: Record<string, string | number>;
}

export default function ProtectedRoute({
	children,
	fallback,
	errorConfig,
	initialErrorCode,
	initialErrorVariables,
}: ProtectedRouteProps) {
	const t = useTranslations('auth.errors');
	const searchParams = useSearchParams();
	const [showPermissionError, setShowPermissionError] = useState(false);
	const [errorCode, setErrorCode] = useState<string>('');
	const [errorVariables, setErrorVariables] = useState<
		Record<string, string | number> | undefined
	>();
	const [errorMessage, setErrorMessage] = useState<string>('');

	useEffect(() => {
		const error = searchParams.get('error');
		if (error) {
			setShowPermissionError(true);
			setErrorCode(error);
		} else if (initialErrorCode) {
			setShowPermissionError(true);
			setErrorCode(initialErrorCode);
			setErrorVariables(initialErrorVariables);
		}
	}, [searchParams, initialErrorCode, initialErrorVariables]);

	useEffect(() => {
		if (showPermissionError && errorCode) {
			const defaultErrorCode = 'auth.errors.insufficient_permissions';
			const finalErrorCode =
				errorConfig?.insufficientPermissions?.code ||
				errorCode ||
				defaultErrorCode;
			const finalVariables =
				errorConfig?.insufficientPermissions?.variables || errorVariables;

			// Attempt to translate via next-intl; fallback to code
			try {
				const msg = t(finalErrorCode, finalVariables);
				setErrorMessage(msg || finalErrorCode);
			} catch {
				setErrorMessage(finalErrorCode);
			}
		}
	}, [showPermissionError, errorCode, errorVariables, errorConfig, t]);

	const handleDismissError = () => {
		setShowPermissionError(false);
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.delete('error');
		window.history.replaceState({}, '', newUrl.toString());
	};

	if (showPermissionError) {
		return (
			<div className="container mx-auto px-6 py-8">
				<Alert className="border-destructive mb-6">
					<AlertDescription className="flex items-center justify-between">
						<span>{errorMessage || errorCode}</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleDismissError}
							className="text-muted-foreground hover:text-foreground h-auto p-0"
						>
							<X className="h-4 w-4" />
						</Button>
					</AlertDescription>
				</Alert>
				{fallback || children}
			</div>
		);
	}

	return <>{children}</>;
}
