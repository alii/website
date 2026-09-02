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

export function withProps(
	component: ComponentType<Record<string, unknown>>,
	props: Record<string, unknown>,
) {
	return createElement(component, props);
}

export const innerHtml = (html: string) => ({__html: html});

// What JSX would pass as `children`: one child as is, several as a fragment.
// For typed components whose props require `children`.
export function childrenProp(children: List<ReactNode>): ReactNode {
	const list = children.toArray();
	return list.length === 1 ? list[0] : createElement(Fragment, null, ...list);
}
