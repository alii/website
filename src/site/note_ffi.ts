import {Note, type NoteProps} from '@/components/note';
import type {List} from '@gleam/prelude.mjs';
import {createElement, type ReactNode} from 'react';
import {childrenProp} from '../react_ffi.ts';

export const note = (variant: NoteProps['variant'], title: string, children: List<ReactNode>) =>
	createElement(Note, {variant, title, children: childrenProp(children)});
