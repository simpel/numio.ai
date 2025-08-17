import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const MAIL_API_SECRET = process.env.MAIL_API_SECRET;
const MAIL_API_URL = process.env.MAIL_API_URL;
const MAIL_API_PORT = process.env.MAIL_API_PORT;

if (!MAIL_API_SECRET || !MAIL_API_URL || !MAIL_API_PORT) {
	throw new Error('Missing required environment variables for mail service');
}

export async function sendWelcomeEmail(to: string, name?: string) {
	const token = jwt.sign({ iss: 'nextjs-app' }, MAIL_API_SECRET!, {
		expiresIn: '5m',
	});
	const subject = 'Welcome to Numio!';
	const html = `<p>Hello${name ? ' ' + name : ''},<br/>Welcome to Numio!</p>`;
	const res = await fetch(`${MAIL_API_URL}:${MAIL_API_PORT}/send`, {
		method: 'POST',
		headers: {
			 
			Authorization: `Bearer ${token}`,

			// eslint-disable-next-line @typescript-eslint/naming-convention
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
