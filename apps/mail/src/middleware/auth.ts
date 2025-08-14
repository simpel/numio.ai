import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
	user?: any;
}

export function authenticateJWT(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) {
	const authHeader = req.headers['authorization'];

	if (!authHeader || !authHeader.startsWith('Bearer')) {
		return res
			.status(401)
			.json({ error: 'Missing or invalid Authorization header' });
	}
	const token = authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({ error: 'Invalid token' });
	}

	try {
		const secret = process.env.MAIL_API_SECRET;
		if (!secret) {
			return res.status(401).json({ error: 'Invalid secret' });
		}
		const decoded = jwt.verify(token, secret);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}
