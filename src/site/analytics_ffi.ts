import {GoogleAnalytics} from '@next/third-parties/google';
import {createElement} from 'react';
import {Toaster} from 'react-hot-toast';

export const gtmId = () => process.env.NEXT_PUBLIC_GTM_ID;
export const googleAnalytics = (gaId: string) => createElement(GoogleAnalytics, {gaId});
export const toaster = () => createElement(Toaster);
