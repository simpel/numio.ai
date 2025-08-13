'use server';

import { redirect } from 'next/navigation';

interface TeamRedirectPageProps {
	params: Promise<{ id: string }>;
}

export default async function TeamRedirectPage({
	params,
}: TeamRedirectPageProps) {
	const { id: teamId } = await params;
	redirect(`/team/${teamId}/cases`);
}
