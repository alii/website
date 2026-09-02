import {None, Some, type Option$} from '@gleam/gleam_stdlib/gleam/option.mjs';
import {Error as GleamError, Ok, type Result} from '@gleam/prelude.mjs';

export const toOption = <T>(value: T | null | undefined): Option$<T> =>
	value === null || value === undefined ? new None() : new Some(value);

export const fromOption = <T>(option: Option$<T>): T | null =>
	option instanceof Some ? option[0] : null;

export const identity = <T>(value: T) => value;

export const json = (value: unknown, indent: number): string | undefined =>
	JSON.stringify(value, null, indent);

export const attempt = <T>(promise: Promise<T>): Promise<Result<T, unknown>> =>
	promise.then(
		value => new Ok(value),
		(error: unknown) => new GleamError(error),
	);
