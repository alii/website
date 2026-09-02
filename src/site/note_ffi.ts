import {Note, type NoteProps} from '@/components/note';
import type {ReactNode} from 'react';
import {create} from '../react_ffi.ts';

export const note = (variant: NoteProps['variant'], title: string, children: ReactNode[]) =>
	create(Note, {variant, title}, children);
