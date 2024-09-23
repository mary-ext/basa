import Elysia, { error } from 'elysia';

import { XrpcError } from './errors.ts';
import { isAotAvailable } from './utils.ts';

import describeServer from './routes/describeServer.ts';
import translate from './routes/translate.ts';

const app = new Elysia({ aot: isAotAvailable })
	.onError(({ error: err, code }) => {
		if (err instanceof XrpcError) {
			return err.toResponse();
		}

		if (code === 'VALIDATION') {
			const first = err.all[0];
			return error(400, { error: 'InvalidRequest', message: first.summary });
		}

		if (code === 'UNKNOWN') {
			return error(500, { error: 'InternalServerError' });
		}
	})
	.onRequest(({ set }) => {
		set.headers['access-control-allow-origin'] = '*';
		set.headers['access-control-max-age'] = '86400';
	})
	.use(describeServer)
	.use(translate);

export default app;
