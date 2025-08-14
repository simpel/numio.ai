import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export type SendMailProps = {
	from?: string;
};

export function sendMail({ from = 'me@joelsanden.se' }: SendMailProps) {
	return [
		// Validation middleware
		body('to').isEmail().withMessage('Valid "to" email is required'),
		body('subject').isString().notEmpty().withMessage('Subject is required'),
		body('html').isString().notEmpty().withMessage('HTML content is required'),
		async (req: Request, res: Response, next: NextFunction) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { to, subject, html } = req.body;

			// Override recipient in development mode or when DEV_EMAIL_OVERRIDE is set
			const isDevelopment = process.env.NODE_ENV === 'development';
			const devEmailOverride = process.env.DEV_EMAIL_OVERRIDE;
			const shouldOverride = isDevelopment || devEmailOverride;
			const actualRecipient = shouldOverride
				? devEmailOverride || 'me@joelsanden.se'
				: to;

			// Log the email override in development
			if (shouldOverride && to !== actualRecipient) {
				console.log(`📧 [DEV] Email override: ${to} → ${actualRecipient}`);
				console.log(`📧 [DEV] Subject: ${subject}`);
			}

			try {
				const data = await resend.emails.send({
					from: process.env.RESEND_FROM || from,
					to: actualRecipient,
					subject: shouldOverride ? `[DEV] ${subject}` : subject,
					html: shouldOverride
						? `<div style="background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-left: 4px solid #ff6b6b;">
							<strong>🚨 DEVELOPMENT MODE</strong><br/>
							Original recipient: ${to}<br/>
							This email was redirected to: ${actualRecipient}
						</div>${html}`
						: html,
				});
				res.status(200).json({ success: true, data });
			} catch (error) {
				next(error);
			}
		},
	];
}
