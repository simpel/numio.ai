import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const MAIL_API_SECRET = process.env.MAIL_API_SECRET;
const MAIL_API_URL = process.env.MAIL_API_URL;
const MAIL_API_PORT = process.env.MAIL_API_PORT;

if (!MAIL_API_SECRET || !MAIL_API_URL || !MAIL_API_PORT) {
	throw new Error('Missing required environment variables for mail service');
}

export async function sendOrganisationRoleEmail(
	to: string,
	orgName: string,
	role: 'owner' | 'admin',
	userName?: string
) {
	const token = jwt.sign({ iss: 'nextjs-app' }, MAIL_API_SECRET!, {
		expiresIn: '5m',
	});

	const roleText = role === 'owner' ? 'the owner' : 'an admin';
	const subject = `You are now ${roleText} of ${orgName}`;
	const html = `<p>Hello${userName ? ' ' + userName : ''},<br/>You have been added as ${roleText} of the organisation <strong>${orgName}</strong> in Numio.</p>`;

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
		throw new Error(`Failed to send email: ${res.status} ${text}`);
	}
	return res.json();
}

// Backwards compatible owner email
export async function sendOrganisationOwnerEmail(
	to: string,
	orgName: string,
	ownerName?: string
) {
	return sendOrganisationRoleEmail(to, orgName, 'owner', ownerName);
}
