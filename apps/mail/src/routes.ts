'use strict';
import type { Application } from 'express';
import { authenticateJWT } from './middleware/auth';
import { sendMail, SendMailProps } from './handlers/send-mail';
import { ServerOptions } from '.';

export default function routes(app: Application, options: ServerOptions) {
	// Public status endpoint
	app.get('/status', (req, res) => res.sendStatus(200));

	// All other endpoints require authentication
	app.use(authenticateJWT);
	app.post('/send', sendMail({ from: options.from }));
}
