import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const MAIL_API_SECRET = process.env.MAIL_API_SECRET;
const MAIL_API_URL = process.env.MAIL_API_URL;
const MAIL_API_PORT = process.env.MAIL_API_PORT;
const APP_URL = process.env.APP_URL || 'https://numio.ai';

if (!MAIL_API_SECRET || !MAIL_API_URL || !MAIL_API_PORT) {
	throw new Error('Missing required environment variables for mail service');
}

export async function sendInviteEmail(
	to: string,
	contextName: string,
	role: string,
	inviteToken: string,
	contextType: 'organisation' | 'team'
) {
	const token = jwt.sign({ iss: 'nextjs-app' }, MAIL_API_SECRET!, {
		expiresIn: '5m',
	});

	const subject = `You're invited to join ${contextName} as ${role}`;
	const inviteUrl = `${APP_URL}/invite?token=${inviteToken}`;
	const html = `<p>Hello,<br/>You have been invited to join the ${contextType} <strong>${contextName}</strong> as <strong>${role}</strong> in Numio.<br/><br/>Click <a href="${inviteUrl}">here</a> to accept your invite.<br/><br/>This invite will expire in 24 hours.</p>`;

	const res = await fetch(`${MAIL_API_URL}:${MAIL_API_PORT}/send`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ to, subject, html }),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Failed to send invite email: ${res.status} ${text}`);
	}
	return res.json();
}
