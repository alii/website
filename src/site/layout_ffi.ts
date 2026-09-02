import {Layout} from '@/components/layout';
import type {List} from '@gleam/prelude.mjs';
import {createElement, type ReactNode} from 'react';

export const layout = (children: List<ReactNode>) => createElement(Layout, null, ...children);
