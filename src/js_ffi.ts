import {None, Some, type Option$} from '@gleam/gleam_stdlib/gleam/option.mjs';

export const toOption = <T>(value: T | null | undefined): Option$<T> =>
	value === null || value === undefined ? new None() : new Some(value);

export const fromOption = <T>(option: Option$<T>): T | null =>
	option instanceof Some ? option[0] : null;
