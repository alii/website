import type {List} from '@gleam/prelude.mjs';
import {createElement, Fragment, type ComponentType, type ReactNode} from 'react';

// the `Attribute` record from react.gleam
interface Attribute {
	readonly name: string;
	readonly value: unknown;
}

function toProps(attrs: List<Attribute>) {
	const props: Record<string, unknown> = {};
	for (const attr of attrs) props[attr.name] = attr.value;
	return props;
}

export function element(
	tag: string | ComponentType<Record<string, unknown>>,
	attrs: List<Attribute>,
	children: List<ReactNode>,
) {
	return createElement(tag, toProps(attrs), ...children);
}

export function fragment(children: List<ReactNode>) {
	return createElement(Fragment, null, ...children);
}

export const identity = <T>(value: T) => value;

export const none = () => null;
