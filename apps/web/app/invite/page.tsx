'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
	getInviteByTokenAction,
	acceptInviteAction,
} from '@src/lib/db/membership/invite.actions';
import { Button } from '@shadcn/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@shadcn/ui/alert';
import { useSession, signIn } from 'next-auth/react';
import { Invite } from '@numio/ai-database';

export default function InvitePage() {
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const { data: session, status } = useSession();
	const [invite, setInvite] = useState<Invite | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [accepted, setAccepted] = useState(false);

	useEffect(() => {
		async function fetchInvite() {
			if (!token) {
				setError('No invite token provided.');
				setLoading(false);
				return;
			}
			try {
				const res = await getInviteByTokenAction(token);
				if (!res.isSuccess || !res.data) {
					setError('Invite not found or invalid.');
				} else {
					setInvite(res.data);
				}
			} catch (err) {
				setError('Failed to load invite. Please try again.');
			}
			setLoading(false);
		}
		fetchInvite();
	}, [token]);

	async function handleAccept() {
		if (!invite || !session?.user?.id) return;
		setLoading(true);

		try {
			// Get user profile ID
			const userProfileRes = await fetch('/api/user-profile', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: session.user.id }),
			});

			if (!userProfileRes.ok) {
				setError('Failed to get user profile.');
				setLoading(false);
				return;
			}

			const { data: userProfile } = await userProfileRes.json();

			const res = await acceptInviteAction({
				token: invite.token,
				userProfileId: userProfile.id,
			});
			if (res.isSuccess) {
				setAccepted(true);
				setError(null);
				// Redirect to home after successful acceptance
				setTimeout(() => {
					window.location.href = '/home';
				}, 2000);
			} else {
				setError(res.message || 'Failed to accept invite.');
			}
		} catch (err) {
			setError('An unexpected error occurred. Please try again.');
		}
		setLoading(false);
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
					<p>Loading invite...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Alert variant="destructive" className="max-w-md">
					<AlertTitle>Invite Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!invite) return null;

	if (accepted) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Alert className="max-w-md">
					<AlertTitle>Invite Accepted</AlertTitle>
					<AlertDescription>
						You have successfully joined as <b>{invite.role}</b>{' '}
						{invite.organisationId ? 'in the organisation' : 'in the team'}.
						Redirecting to home page...
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (invite.status === 'EXPIRED') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Alert variant="destructive" className="max-w-md">
					<AlertTitle>Invite Expired</AlertTitle>
					<AlertDescription>
						This invite has expired. Please contact the administrator for a new
						invite.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (invite.status === 'ACCEPTED') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Alert className="max-w-md">
					<AlertTitle>Invite Already Accepted</AlertTitle>
					<AlertDescription>
						This invite has already been accepted. You can access the platform
						through your account.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (invite.status === 'CANCELLED') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Alert variant="destructive" className="max-w-md">
					<AlertTitle>Invite Cancelled</AlertTitle>
					<AlertDescription>
						This invite has been cancelled. Please contact the administrator if
						you believe this is an error.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="bg-background max-w-md rounded-lg border p-6 shadow-lg">
				<h1 className="mb-4 text-2xl font-bold">You're Invited!</h1>
				<div className="mb-6 space-y-2">
					<div>
						<b>Email:</b> {invite.email}
					</div>
					<div>
						<b>Role:</b> {invite.role}
					</div>
					<div>
						<b>Context:</b> {invite.organisationId ? 'Organisation' : 'Team'}
					</div>
					<div>
						<b>Status:</b> {invite.status}
					</div>
					<div>
						<b>Expires:</b> {new Date(invite.expiresAt).toLocaleString()}
					</div>
				</div>
				{status === 'authenticated' ? (
					<Button onClick={handleAccept} disabled={loading} className="w-full">
						{loading ? 'Accepting...' : 'Accept Invite'}
					</Button>
				) : (
					<Button onClick={() => signIn()} className="w-full">
						Sign in to accept
					</Button>
				)}
			</div>
		</div>
	);
}
