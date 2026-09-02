import {createElement, Fragment} from 'react';

function toProps(attrs) {
	const props = {};
	for (const attr of attrs) props[attr.name] = attr.value;
	return props;
}

export function element(tag, attrs, children) {
	return createElement(tag, toProps(attrs), ...children);
}

export function fragment(children) {
	return createElement(Fragment, null, ...children);
}

export const identity = x => x;

export const none = () => null;
