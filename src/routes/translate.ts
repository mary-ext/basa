import { Elysia, t } from 'elysia';

import { InvalidRequestError } from '../errors.ts';

import { translate as translateDeepl } from '../engines/deepl.ts';
import { translate as translateGoogle } from '../engines/google.ts';

enum TranslateEngine {
	DEEPL = 'deepl',
	GOOGLE = 'google',
}

const routes = new Elysia().get(
	'/xrpc/x.basa.translate',
	async ({ query: { engine, from = 'auto', to, text } }) => {
		if (engine === TranslateEngine.GOOGLE) {
			return await translateGoogle(from, to, text);
		}

		if (engine === TranslateEngine.DEEPL) {
			return await translateDeepl(from, to, text);
		}

		throw new InvalidRequestError(`Unsupported engine "${engine}"`);
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
