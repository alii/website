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

// Render a typed component whose props require `children`, with the children
// as createElement rest arguments like JSX does. TypeScript cannot see that
// createElement fills `children` from them, hence the cast on the component;
// the props object itself stays fully typed.
export function withChildren<P extends {children?: ReactNode}>(
	component: ComponentType<P>,
	props: Omit<P, 'children'>,
	children: List<ReactNode>,
) {
	return createElement(
		component as unknown as ComponentType<Omit<P, 'children'>>,
		props,
		...children,
	);
}
