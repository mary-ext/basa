import * as t from '@sinclair/typebox';

import { InvalidRequestError, UpstreamFailureError } from '../errors.ts';
import { interpretSchema } from '../utils.ts';

import type { TranslateResult } from './types.ts';

const getRandomId = () => {
	return 1e4 * Math.round(1e4 * Math.random());
};

const transformPayload = (id: number, json: string) => {
	// I have no idea what the fuck this is meant to do
	return json.replace('hod":"', (id + 3) % 13 == 0 || (id + 5) % 29 == 0 ? 'hod" : "' : 'hod": "');
};

const call = async (method: string, params: any): Promise<unknown> => {
	const id = getRandomId();

	const payload = transformPayload(
		id,
		JSON.stringify({
			jsonrpc: '2.0',
			method: method,
			params: params,
			id: id,
		}),
	);

	const response = await fetch(`https://www2.deepl.com/jsonrpc`, {
		method: 'post',
		keepalive: true,
		headers: {
			'content-type': 'application/json',
			'user-agent': 'DeepL/24.10(120) Android 14 (Pixel 9;aarch64)',
			'x-app-device': 'Pixel 9',
			'x-app-os-name': 'Android',
			'x-app-os-version': '14',
			'x-app-version': '24.10',
		},
		body: payload,
	});

	if (response.status === 429) {
		throw new UpstreamFailureError(`service ratelimit reached; engine=deepl`);
	}
	if (!response.ok) {
		throw new UpstreamFailureError(`service responded with non-ok; engine=deepl; status=${response.status}`);
	}

	try {
		const json = (await response.json()) as any;
		return json.result;
	} catch (err) {
		throw new UpstreamFailureError(`failed to parse json; engine=deepl; status=${response.status}`);
	}
};

const SplitTextResponse = interpretSchema(
	t.Object({
		lang: t.Object({
			detected: t.String(),
			isConfident: t.Boolean(),
			detectedLanguages: t.Record(t.String(), t.Number()),
		}),
		texts: t.Array(
			t.Object({
				chunks: t.Array(
					t.Object({
						sentences: t.Array(
							t.Object({
								prefix: t.String(),
								text: t.String(),
							}),
						),
					}),
				),
			}),
		),
	}),
);

const HandleJobsResponse = interpretSchema(
	t.Object({
		// target_lang: t.String(),
		// source_lang: t.String(),
		// source_lang_is_confident: t.Boolean(),
		translations: t.Array(
			t.Object({
				// quality: t.String(),
				beams: t.Array(
					t.Object({
						// num_symbols: t.Number(),
						sentences: t.Array(
							t.Object({
								text: t.String(),
							}),
						),
					}),
				),
			}),
		),
	}),
);

export const translate = async (from: string, to: string, text: string): Promise<TranslateResult> => {
	if (from !== 'auto' && !languages.includes(from)) {
		throw new InvalidRequestError(`Invalid source language "${from}"`);
	}

	if (!languages.includes(to)) {
		throw new InvalidRequestError(`Invalid target language "${to}"`);
	}

	const splits: unknown = await call('LMT_split_text', {
		texts: text.split('\n'),
		commonJobParams: {
			mode: 'translate',
			textType: 'plaintext',
			advancedMode: false,
		},
		lang: {
			lang_user_selected: from,
		},
	});

	console.log(JSON.stringify(splits));

	if (!SplitTextResponse.Check(splits)) {
		throw new UpstreamFailureError(`mismatching expected response; engine=deepl`);
	}

	const detected = from === 'auto' ? splits.lang.detected.toLowerCase() : undefined;
	const sourceLang = detected ?? from.split('-')[0];

	let sentenceId = 0;

	const result: unknown = await call('LMT_handle_jobs', {
		jobs: splits.texts.flatMap((txt) => {
			return txt.chunks.map((chunk, index, array) => {
				const before = array[index - 1];
				const after = array[index + 1];

				return {
					kind: 'default',
					preferred_num_beams: 1,
					raw_en_context_after: after ? [after.sentences.at(-1)!.text] : [],
					raw_en_context_before: before ? [before.sentences.at(-1)!.text] : [],
					sentences: chunk.sentences.map((sentence) => ({
						id: ++sentenceId,
						prefix: sentence.prefix,
						text: sentence.text,
					})),
				};
			});
		}),
		commonJobParams: {
			mode: 'translate',
			textType: 'plaintext',
			regionalVariant: to.includes('-') ? to : undefined,
			wasSpoken: false,
			transcribe_as: transliterations.includes(to) ? 'romanize' : undefined,
		},
		lang: {
			target_lang: to.split('-')[0],
			source_lang_user_selected: sourceLang,
			source_lang_computed: sourceLang,
			preference: {
				weight: {},
				default: 'default',
			},
		},
		priority: 1,
		timestamp: Date.now(),
	});

	console.log(JSON.stringify(result));

	if (!HandleJobsResponse.Check(result)) {
		throw new UpstreamFailureError(`mismatching expected response; engine=deepl`);
	}

	return {
		result: result.translations
			.flatMap((tl) => tl.beams.flatMap((beam) => beam.sentences.map((sentence) => sentence.text)))
			.join('\n'),
		sourceLanguage: detected,
	};
};

export const transliterations = ['ja', 'zh'];

export const languages = [
	'ar',
	'bg',
	'zh',
	'zh-Hant',
	'cs',
	'da',
	'nl',
	'en-US',
	'en-GB',
	'et',
	'fi',
	'fr',
	'de',
	'el',
	'hu',
	'id',
	'it',
	'ja',
	'ko',
	'lv',
	'lt',
	'nb',
	'pl',
	'pt-PT',
	'pt-BR',
	'ro',
	'ru',
	'sk',
	'sl',
	'es',
	'sv',
	'tr',
	'uk',
];
