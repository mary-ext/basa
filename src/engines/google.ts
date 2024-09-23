import { InvalidRequestError, UpstreamFailureError } from '../errors.ts';

import type { TranslateResult } from './types.ts';

const RPC_URI = `https://translate.google.com/_/TranslateWebserverUi/data/batchexecute`;

export const translate = async (from: string, to: string, text: string): Promise<TranslateResult> => {
	if (from !== 'auto' && !languages.includes(from)) {
		throw new InvalidRequestError(`invalid source language; received=${from}`);
	}

	if (!languages.includes(to)) {
		throw new InvalidRequestError(`invalid target language; received=${to}`);
	}

	const response = await fetch(RPC_URI, {
		method: 'post',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			'f.req': JSON.stringify([
				[['MkEWBc', JSON.stringify([[text, from, to, true], [null]]), null, 'generic']],
			]),
		}),
	});

	if (!response.ok) {
		throw new UpstreamFailureError(`service responded with non-ok; engine=google; status=${response.status}`);
	}

	const txt = await response.text();

	if (!txt.startsWith(")]}'\n\n")) {
		throw new UpstreamFailureError(`service returned unexpected response format; engine=google`);
	}

	let json = JSON.parse(txt.slice(6));

	// Unwrap the first layer of JSON
	jump: {
		if (Array.isArray(json)) {
			const first = json[0];

			if (Array.isArray(first)) {
				if (first[0] === 'wrb.fr' && first[1] === 'MkEWBc' && typeof first[2] === 'string') {
					try {
						const unwrapped = JSON.parse(first[2]);

						json = unwrapped;
						break jump;
					} catch {}
				}
			}
		}

		throw new UpstreamFailureError(`unexpected rpc response format; engine=google`);
	}

	// Read stuff
	try {
		let result: string = '';
		let sourceLanguage: string | undefined;
		let sourceTransliteration: string | undefined;
		let targetTransliteration: string | undefined;

		if (json[1][0][0][5] === undefined) {
			result = json[1][0][0][0];
		} else {
			for (const substr of json[1][0][0][5]) {
				if (substr[0]) {
					result && !result.endsWith('\n') && (result += ' ');
					result += substr[0];
				}
			}
		}

		targetTransliteration = json[1][0][0][1] || undefined;
		sourceTransliteration = json[0][0] || undefined;

		if (json[0] && json[0][1] && json[0][1][1]) {
			sourceLanguage = json[0][1][1][0];
		} else if (from === 'auto') {
			sourceLanguage = json[2];
		}

		return {
			result,
			sourceLanguage,
			sourceTransliteration,
			targetTransliteration,
		};
	} catch (err) {
		console.error(err);
		throw new UpstreamFailureError(`unexpected rpc response format`);
	}
};

export const languages = [
	'ab',
	'ace',
	'ach',
	'aa',
	'af',
	'sq',
	'alz',
	'am',
	'ar',
	'hy',
	'as',
	'av',
	'awa',
	'ay',
	'az',
	'ban',
	'bal',
	'bm',
	'bci',
	'ba',
	'eu',
	'btx',
	'bts',
	'bbc',
	'be',
	'bem',
	'bn',
	'bew',
	'bho',
	'bik',
	'bs',
	'br',
	'bg',
	'bua',
	'yue',
	'ca',
	'ceb',
	'ch',
	'ce',
	'ny',
	'zh-CN',
	'zh-TW',
	'chk',
	'cv',
	'co',
	'crh',
	'hr',
	'cs',
	'da',
	'fa-AF',
	'dv',
	'din',
	'doi',
	'dov',
	'nl',
	'dyu',
	'dz',
	'en',
	'eo',
	'et',
	'ee',
	'fo',
	'fj',
	'tl',
	'fi',
	'fon',
	'fr',
	'fy',
	'fur',
	'ff',
	'gaa',
	'gl',
	'ka',
	'de',
	'el',
	'gn',
	'gu',
	'ht',
	'cnh',
	'ha',
	'haw',
	'iw',
	'hil',
	'hi',
	'hmn',
	'hu',
	'hrx',
	'iba',
	'is',
	'ig',
	'ilo',
	'id',
	'ga',
	'it',
	'jam',
	'ja',
	'jw',
	'kac',
	'kl',
	'kn',
	'kr',
	'pam',
	'kk',
	'kha',
	'km',
	'cgg',
	'kg',
	'rw',
	'ktu',
	'trp',
	'kv',
	'gom',
	'ko',
	'kri',
	'ku',
	'ckb',
	'ky',
	'lo',
	'ltg',
	'la',
	'lv',
	'lij',
	'li',
	'ln',
	'lt',
	'lmo',
	'lg',
	'luo',
	'lb',
	'mk',
	'mad',
	'mai',
	'mak',
	'mg',
	'ms',
	'ms-Arab',
	'ml',
	'mt',
	'mam',
	'gv',
	'mi',
	'mr',
	'mh',
	'mwr',
	'mfe',
	'chm',
	'mni-Mtei',
	'min',
	'lus',
	'mn',
	'my',
	'nhe',
	'ndc-ZW',
	'nr',
	'new',
	'ne',
	'bm-Nkoo',
	'no',
	'nus',
	'oc',
	'or',
	'om',
	'os',
	'pag',
	'pap',
	'ps',
	'fa',
	'pl',
	'pt',
	'pt-PT',
	'pa',
	'pa-Arab',
	'qu',
	'kek',
	'rom',
	'ro',
	'rn',
	'ru',
	'se',
	'sm',
	'sg',
	'sa',
	'sat-Latn',
	'gd',
	'nso',
	'sr',
	'st',
	'crs',
	'shn',
	'sn',
	'scn',
	'szl',
	'sd',
	'si',
	'sk',
	'sl',
	'so',
	'es',
	'su',
	'sus',
	'sw',
	'ss',
	'sv',
	'ty',
	'tg',
	'ber-Latn',
	'ber',
	'ta',
	'tt',
	'te',
	'tet',
	'th',
	'bo',
	'ti',
	'tiv',
	'tpi',
	'to',
	'ts',
	'tn',
	'tcy',
	'tum',
	'tr',
	'tk',
	'tyv',
	'ak',
	'udm',
	'uk',
	'ur',
	'ug',
	'uz',
	've',
	'vec',
	'vi',
	'war',
	'cy',
	'wo',
	'xh',
	'sah',
	'yi',
	'yo',
	'yua',
	'zap',
	'zu',
];
