import {None, Some, type Option$} from '@gleam/gleam_stdlib/gleam/option.mjs';
import type {List} from '@gleam/prelude.mjs';

export const toOption = <T>(value: T | null | undefined): Option$<T> =>
	value === null || value === undefined ? new None() : new Some(value);

export const fromOption = <T>(option: Option$<T>): T | null =>
	option instanceof Some ? option[0] : null;

export const object = (fields: List<[string, unknown]>) => Object.fromEntries(fields);

export const spread = (record: object) => ({...record});

export const merge = (base: object, extra: object) => ({...base, ...extra});

export const identity = <T>(value: T) => value;

export const json = (value: unknown, indent: number): string | undefined =>
	JSON.stringify(value, null, indent);
