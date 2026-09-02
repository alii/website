import type {AppProps} from 'next/app';
import Head from 'next/head';
import Link from 'next/link';

export const link = () => Link;
export const head = () => Head;

export const component = (props: AppProps) => props.Component;
export const pageProps = (props: AppProps) => props.pageProps;
