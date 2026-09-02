import {Note, type NoteProps} from '@/components/note';
import type {List} from '@gleam/prelude.mjs';
import type {ReactNode} from 'react';
import {withChildren} from '../react_ffi.ts';

export const note = (variant: NoteProps['variant'], title: string, children: List<ReactNode>) =>
	withChildren(Note, {variant, title}, children);
