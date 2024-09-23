import { Elysia, t } from 'elysia';

import { InvalidRequestError } from '../errors.ts';

import { translate as translateDeepl } from '../engines/deepl.ts';
import { translate as translateGoogle } from '../engines/google.ts';
import type { TranslateResult } from '../engines/types.ts';

enum TranslateEngine {
	DEEPL = 'deepl',
	GOOGLE = 'google',
}

const routes = new Elysia().get(
	'/xrpc/x.basa.translate',
	async ({ query: { engine, from = 'auto', to, text }, set }) => {
		let result: TranslateResult;

		if (engine === TranslateEngine.GOOGLE) {
			result = await translateGoogle(from, to, text);
		} else if (engine === TranslateEngine.DEEPL) {
			result = await translateDeepl(from, to, text);
		} else {
			throw new InvalidRequestError(`Unsupported engine "${engine}"`);
		}

		set.headers['cache-control'] = `public, max-age=604800`;
		return result;
	},
	{
		query: t.Object({
			engine: t.Enum(TranslateEngine),
			from: t.Optional(t.String()),
			to: t.String(),
			text: t.String(),
		}),
		response: {
			200: t.Object({
				result: t.String(),
				sourceLanguage: t.Optional(t.String()),
				sourceTransliteration: t.Optional(t.String()),
				targetTransliteration: t.Optional(t.String()),
			}),
		},
	},
);

export default routes;
