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
		detail: {
			description: `Translates a given text into another language`,
		},
		query: t.Object({
			engine: t.Enum(TranslateEngine, {
				description: `Which translation service to use`,
			}),
			from: t.Optional(
				t.String({
					description: `Source language`,
				}),
			),
			to: t.String({
				description: `Target language`,
			}),
			text: t.String({
				description: `Source text needing translation`,
			}),
		}),
		response: {
			200: t.Object({
				result: t.String({
					description: `Resulting translation`,
				}),
				sourceLanguage: t.Optional(
					t.String({
						description: `Detected language of source text`,
					}),
				),
				sourceTransliteration: t.Optional(
					t.String({
						description: `Transliteration of source text`,
					}),
				),
				targetTransliteration: t.Optional(
					t.String({
						description: `Transliateration of translated text`,
					}),
				),
			}),
		},
	},
);

export default routes;
