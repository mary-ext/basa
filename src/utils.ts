import * as t from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import type { ValueErrorIterator } from '@sinclair/typebox/errors';
import { Value } from '@sinclair/typebox/value';

export interface InterpretedSchema<T extends t.TSchema> {
	/** Returns an iterator for each error in this value. */
	Errors(value: unknown): ValueErrorIterator;
	/** Returns true if the value matches the compiled type. */
	Check(value: unknown): value is t.Static<T>;
	/** Decodes a value or throws if error */
	Decode<Static = t.StaticDecode<T>, Result extends Static = Static>(value: unknown): Result;
	/** Encodes a value or throws if error */
	Encode<Static = t.StaticDecode<T>, Result extends Static = Static>(value: unknown): Result;
}

export const isAotAvailable = (() => {
	try {
		TypeCompiler.Compile(t.String());
		return true;
	} catch {
		return false;
	}
})();

export const interpretSchema = <T extends t.TSchema>(schema: T): InterpretedSchema<T> => {
	if (isAotAvailable) {
		return TypeCompiler.Compile(schema);
	}

	return {
		Errors(value) {
			return Value.Errors(schema, value);
		},
		Check(value) {
			return Value.Check(schema, value);
		},
		Decode(value) {
			return Value.Decode(schema, value);
		},
		Encode(value) {
			return Value.Encode(schema, value);
		},
	};
};
