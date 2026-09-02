import {GoogleAnalytics} from '@next/third-parties/google';
import {createElement} from 'react';
import {Toaster} from 'react-hot-toast';
import {toOption} from '../js_ffi.ts';

export const gtmId = () => toOption(process.env.NEXT_PUBLIC_GTM_ID);
export const googleAnalytics = (gaId: string) => createElement(GoogleAnalytics, {gaId});
export const toaster = () => createElement(Toaster);
