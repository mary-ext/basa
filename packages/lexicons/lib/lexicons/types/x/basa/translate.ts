import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('x.basa.translate', {
	params: /*#__PURE__*/ v.object({
		engine: /*#__PURE__*/ v.literalEnum(['deepl', 'google']),
		from: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), 'auto'),
		text: /*#__PURE__*/ v.string(),
		to: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			result: /*#__PURE__*/ v.string(),
			sourceLanguage: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			sourceTransliteration: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			targetTransliteration: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'x.basa.translate': mainSchema;
	}
}
