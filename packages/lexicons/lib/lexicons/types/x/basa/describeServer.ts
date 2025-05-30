import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _engineSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('x.basa.describeServer#engine')),
	languages: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
});
const _enginesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('x.basa.describeServer#engines')),
	get deepl() {
		return /*#__PURE__*/ v.optional(engineSchema);
	},
	get google() {
		return /*#__PURE__*/ v.optional(engineSchema);
	},
});
const _mainSchema = /*#__PURE__*/ v.query('x.basa.describeServer', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get engines() {
				return enginesSchema;
			},
		}),
	},
});

type engine$schematype = typeof _engineSchema;
type engines$schematype = typeof _enginesSchema;
type main$schematype = typeof _mainSchema;

export interface engineSchema extends engine$schematype {}
export interface enginesSchema extends engines$schematype {}
export interface mainSchema extends main$schematype {}

export const engineSchema = _engineSchema as engineSchema;
export const enginesSchema = _enginesSchema as enginesSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Engine extends v.InferInput<typeof engineSchema> {}
export interface Engines extends v.InferInput<typeof enginesSchema> {}

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'x.basa.describeServer': mainSchema;
	}
}
