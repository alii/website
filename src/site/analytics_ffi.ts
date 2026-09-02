import {None, Some} from '@gleam/gleam_stdlib/gleam/option.mjs';
import {GoogleAnalytics} from '@next/third-parties/google';
import {Toaster} from 'react-hot-toast';

const tag = process.env.NEXT_PUBLIC_GTM_ID;

export const gtmId = () => (tag ? new Some(tag) : new None());
export const googleAnalytics = () => GoogleAnalytics;
export const toaster = () => Toaster;
