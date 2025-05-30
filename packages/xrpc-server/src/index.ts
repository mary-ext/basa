import { json, XRPCRouter } from '@atcute/xrpc-server';
import { cors } from '@atcute/xrpc-server/middlewares/cors';

import { XBasaDescribeServer, XBasaTranslate } from '@kelinci/basa-lexicons';

import * as deepl from './engines/deepl.js';
import * as google from './engines/google.js';
import type { TranslateResult } from './engines/types.js';

const router = new XRPCRouter({ middlewares: [cors()] });

router.add(XBasaDescribeServer.mainSchema, {
	handler() {
		return json({
			engines: {
				deepl: {
					languages: deepl.languages,
				},
				google: {
					languages: google.languages,
				},
			},
		});
	},
});

router.add(XBasaTranslate.mainSchema, {
	async handler({ params: { engine, from, to, text } }) {
		let result: TranslateResult;

		switch (engine) {
			case 'google': {
				result = await google.translate(from, to, text);
				break;
			}
			case 'deepl': {
				result = await deepl.translate(from, to, text);
				break;
			}
		}

		return json(result, {
			headers: {
				'cache-control': `public, max-age=604800`,
			},
		});
	},
});

export default router;
