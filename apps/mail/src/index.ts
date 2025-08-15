'use strict';

import 'dotenv/config';

import express from 'express';
import createError from 'http-errors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import routes from './routes';
import type { Request, Response, NextFunction, Application } from 'express';
import type { Server } from 'http';
import type { AddressInfo } from 'net';

export type ServerOptions = {
	port: number;
	host: string;
	from?: string;
};

export default function main(
	options: ServerOptions,
	cb?: (err?: Error, app?: Application, server?: Server) => void
) {
	// Set default options
	const ready = cb || function () {};

	const logger = pino();

	// Server state
	let serverStarted = false;
	let serverClosing = false;

	// Setup error handling
	function unhandledError(err: Error) {
		// Log the errors
		logger.error(err);

		// Only clean up once
		if (serverClosing) {
			return;
		}
		serverClosing = true;

		// If server has started, close it down
		if (serverStarted && server) {
			server.close(function () {
				process.exit(1);
			});
		}
	}
	process.on('uncaughtException', unhandledError);
	process.on('unhandledRejection', unhandledError);

	// Create the express app
	const app = express();

	// Common middleware
	// app.use(/* ... */)
	app.use(pinoHttp({ logger }));
	app.use(express.json());

	// Register routes
	// @NOTE: require here because this ensures that even syntax errors
	// or other startup related errors are caught logged and debuggable.
	// Alternativly, you could setup external log handling for startup
	// errors and handle them outside the node process.  I find this is
	// better because it works out of the box even in local development.
	routes(app, options);

	// Common error handlers
	app.use(function fourOhFourHandler(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		next(createError(404, `Route not found: ${req.url}`));
	});
	app.use(function fiveHundredHandler(
		err: any,
		req: Request,
		res: Response,
		next: NextFunction
	) {
		if (err.status >= 500) {
			logger.error(err);
		}
		res.status(err.status || 500).json({
			messages: [
				{
					code: err.code || 'InternalServerError',
					message: err.message,
				},
			],
		});
	});

	// Start server
	const server = app.listen(options.port, options.host, function (err?: Error) {
		if (err) {
			return ready(err, app, server);
		}

		// If some other error means we should close
		if (serverClosing) {
			return ready(new Error('Server was closed before it could start'));
		}

		serverStarted = true;
		const addr = server.address() as AddressInfo | null;
		if (addr && typeof addr === 'object') {
			logger.info(`Started at ${options.host}:${addr.port}`);
		} else {
			logger.info(`Started at ${options.host || 'localhost'}:${options.port}`);
		}
		ready(err, app, server);
	});
}

main({
	port: process.env.MAIL_API_PORT
		? parseInt(process.env.MAIL_API_PORT, 10)
		: 3001,
	host: process.env.MAIL_API_HOST || 'localhost',
});
