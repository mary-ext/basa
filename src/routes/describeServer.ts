import Elysia, { t } from 'elysia';

import { languages as deeplLanguages } from '../engines/deepl';
import { languages as googleLanguages } from '../engines/google';

const Engine = t.Object({
	languages: t.Array(t.String(), {
		description: `Supported language codes`,
	}),
});

const routes = new Elysia().get(
	'/xrpc/x.basa.describeServer',
	() => {
		return {
			engines: {
				deepl: {
					languages: deeplLanguages,
				},
				google: {
					languages: googleLanguages,
				},
			},
		};
	},
	{
		detail: {
			description: `Describes the translation proxy instance`,
		},
		response: {
			200: t.Object({
				engines: t.Object({
					deepl: Engine,
					google: Engine,
				}),
			}),
		},
	},
);

export default routes;
