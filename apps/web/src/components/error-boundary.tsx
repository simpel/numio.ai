'use client';

import { Button } from '@shadcn/ui/button';
import { AlertTriangle } from 'lucide-react';
import React from 'react';

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}

	resetError = () => {
		this.setState({ hasError: false, error: undefined });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				const FallbackComponent = this.props.fallback;
				return (
					<FallbackComponent
						error={this.state.error}
						resetError={this.resetError}
					/>
				);
			}

			return (
				<div className="flex min-h-[200px] flex-col items-center justify-center p-4 text-center">
					<div className="mx-auto max-w-md">
						<div className="mb-4 flex justify-center">
							<div className="bg-destructive/10 rounded-full p-3">
								<AlertTriangle className="text-destructive h-6 w-6" />
							</div>
						</div>
						<h3 className="mb-2 text-lg font-semibold">Something went wrong</h3>
						<p className="text-muted-foreground mb-4 text-sm">
							An error occurred while rendering this component.
						</p>
						<Button onClick={this.resetError} variant="outline" size="sm">
							Try Again
						</Button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
