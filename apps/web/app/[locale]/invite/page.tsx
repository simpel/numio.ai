'use client';

import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@shadcn/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@shadcn/ui/card';
import {
	acceptInviteAction,
	getInviteAction,
} from '@src/lib/db/membership/invite.actions';
import { getUserProfileAction } from '@src/lib/auth/auth.actions';
import { getCurrentUser } from '@src/lib/auth/auth.utils';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface InviteData {
	id: string;
	email: string;
	status: string;
	role: string;
	organisation?: {
		name: string;
	};
	team?: {
		name: string;
	};
	expiresAt: string | Date;
	createdAt?: string | Date;
}

export default function InvitePage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [invite, setInvite] = useState<InviteData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const token = searchParams.get('token');

	useEffect(() => {
		if (!token) {
			setError('No invite token provided');
			setLoading(false);
			return;
		}

		const fetchInvite = async () => {
			try {
				const result = await getInviteAction(token);
				if (result.isSuccess && result.data) {
					// Convert Date objects to strings for the interface
					const inviteData: InviteData = {
						...result.data,
						expiresAt:
							result.data.expiresAt instanceof Date
								? result.data.expiresAt.toISOString()
								: result.data.expiresAt,
						createdAt:
							result.data.createdAt instanceof Date
								? result.data.createdAt.toISOString()
								: result.data.createdAt,
					};
					setInvite(inviteData);
				} else {
					setError(result.message || 'Failed to load invite');
				}
			} catch {
				setError('Failed to load invite');
			} finally {
				setLoading(false);
			}
		};

		fetchInvite();
	}, [token]);

	const handleAcceptInvite = () => {
		if (!token) return;

		startTransition(async () => {
			try {
				// Get current user
				const user = await getCurrentUser();
				if (!user?.id) {
					toast.error('Please sign in to accept this invite');
					return;
				}

				// Get current user profile
				const userResult = await getUserProfileAction(user.id);
				if (!userResult.isSuccess || !userResult.data) {
					toast.error('Please sign in to accept this invite');
					return;
				}

				const result = await acceptInviteAction({
					token,
					userProfileId: userResult.data.id,
				});
				if (result.isSuccess) {
					toast.success('Invite accepted successfully!');
					router.push('/');
				} else {
					toast.error(result.message || 'Failed to accept invite');
				}
			} catch {
				toast.error('Failed to accept invite');
			}
		});
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Loading Invite...</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							Please wait while we load your invite.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error || !invite) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Invalid Invite</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">
							{error || 'This invite is invalid or has expired.'}
						</p>
						<Button onClick={() => router.push('/')} className="w-full">
							Go Home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (invite.status === 'accepted') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Invite Already Accepted</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">
							This invite has already been accepted.
						</p>
						<Button onClick={() => router.push('/')} className="w-full">
							Go Home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (invite.status === 'expired') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Invite Expired</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">
							This invite has expired. Please contact the person who sent you
							this invite.
						</p>
						<Button onClick={() => router.push('/')} className="w-full">
							Go Home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const contextName =
		invite.organisation?.name || invite.team?.name || 'Unknown';
	const contextType = invite.organisation ? 'Organization' : 'Team';

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Accept Invite</CardTitle>
					<CardDescription>
						You&apos;ve been invited to join {contextName}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<div>
							<label className="text-muted-foreground text-sm font-medium">
								Email
							</label>
							<p className="text-sm">{invite.email}</p>
						</div>
						<div>
							<label className="text-muted-foreground text-sm font-medium">
								{contextType}
							</label>
							<p className="text-sm">{contextName}</p>
						</div>
						<div>
							<label className="text-muted-foreground text-sm font-medium">
								Role
							</label>
							<p className="text-sm capitalize">{invite.role}</p>
						</div>
						<div>
							<label className="text-muted-foreground text-sm font-medium">
								Expires
							</label>
							<p className="text-sm">
								{new Date(invite.expiresAt).toLocaleDateString()}
							</p>
						</div>
					</div>

					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => router.push('/')}
							className="flex-1"
						>
							Decline
						</Button>
						<Button
							onClick={handleAcceptInvite}
							disabled={pending}
							className="flex-1"
						>
							{pending ? 'Accepting...' : 'Accept Invite'}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
