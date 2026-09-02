import {Layout} from '@/components/layout';
import {createElement, type ReactNode} from 'react';

export const layout = (children: ReactNode[]) => createElement(Layout, null, ...children);
