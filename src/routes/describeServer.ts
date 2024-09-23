import Elysia from 'elysia';

import { languages as deeplLanguages } from '../engines/deepl';
import { languages as googleLanguages } from '../engines/google';

const routes = new Elysia().get('/xrpc/x.basa.describeServer', () => {
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
});

export default routes;
