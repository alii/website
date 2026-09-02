import {createElement, Fragment, type ElementType, type ReactNode} from 'react';

export const create = (type: ElementType, props: object, children: ReactNode[]) =>
	createElement(type, props, ...children);

export const fragment = () => Fragment;
