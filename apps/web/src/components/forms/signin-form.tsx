'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@shadcn/ui/button';
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@shadcn/ui/tabs';
import { MicrosoftIcon } from '@src/components/microsoft-icon';

interface SignInFormProps {
	callbackUrl?: string;
}

export default function SignInForm({ callbackUrl }: SignInFormProps) {
	const [tab, setTab] = useState('microsoft');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleCredentialsLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const res = await signIn('credentials', {
			email,
			password,
			redirect: false,
			callbackUrl: callbackUrl || '/',
		});
		setLoading(false);
		if (res?.error) {
			setError('Invalid email or password');
		} else if (res?.ok) {
			// Redirect to callback URL or root
			window.location.href = callbackUrl || '/';
		}
	};

	const handleMicrosoftLogin = () => {
		setLoading(true);
		signIn('microsoft-entra-id', {
			callbackUrl: callbackUrl || '/',
		});
	};

	return (
		<Tabs value={tab} onValueChange={setTab} className="w-full">
			<TabsList className="mb-4 w-full">
				<TabsTrigger value="microsoft" className="w-1/2">
					Microsoft
				</TabsTrigger>
				<TabsTrigger value="credentials" className="w-1/2">
					Email & Password
				</TabsTrigger>
			</TabsList>

			<TabsContent value="microsoft">
				<Button
					type="button"
					onClick={handleMicrosoftLogin}
					className="w-full"
					disabled={loading}
					variant="outline"
				>
					<MicrosoftIcon className="mr-2 h-4 w-4" />
					Sign in with Microsoft
				</Button>
			</TabsContent>

			<TabsContent value="credentials">
				<form onSubmit={handleCredentialsLogin} className="space-y-4">
					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							autoComplete="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={loading}
						/>
					</div>
					<div>
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={loading}
						/>
					</div>
					{error && <div className="text-destructive text-sm">{error}</div>}
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? 'Signing in...' : 'Sign in'}
					</Button>
				</form>
			</TabsContent>
		</Tabs>
	);
}
